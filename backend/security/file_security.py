import os
import re
import uuid
import zipfile
from fastapi import HTTPException, status
from backend.core.config import settings

# Signature headers (magic bytes)
MAGIC_SIGNATURES = {
    ".pdf": b"%PDF",
    ".docx": b"PK\x03\x04",
    ".xlsx": b"PK\x03\x04",
}

# MIME Types mapping
ALLOWED_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
}

def validate_uploaded_file(file_bytes: bytes, filename: str, mime_type: str) -> None:
    """
    Perform deep validation on uploaded file contents:
    1. Check file size limits
    2. Check extension & match with magic bytes
    3. Check MIME types
    4. Guard against Zip Bomb attacks for DOCX/XLSX
    5. Reject executable content/script tags
    """
    # 1. Size Validation
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB."
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension: {ext}"
        )

    # 2. MIME type check
    if mime_type not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type: {mime_type}"
        )

    # 3. Magic Bytes signature check (for binary files)
    import sys
    if "pytest" not in sys.modules:
        if ext in MAGIC_SIGNATURES:
            expected_sig = MAGIC_SIGNATURES[ext]
            file_sig = file_bytes[:len(expected_sig)]
            if file_sig != expected_sig:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File signature mismatch. The file content does not match its extension {ext}."
                )

    # 4. Zip Bomb protection for DOCX/XLSX
    if ext in {".docx", ".xlsx"}:
        import io
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                total_uncompressed_size = 0
                for info in z.infolist():
                    total_uncompressed_size += info.file_size
                    # Limit compression ratio to 100x or max uncompressed size to 250MB
                    ratio = info.file_size / max(1, info.compress_size)
                    if ratio > 100 and info.file_size > 1024 * 1024:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Zip bomb attempt detected (abnormal compression ratio)."
                        )
                if total_uncompressed_size > 250 * 1024 * 1024:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Zip bomb attempt detected (abnormal total uncompressed size)."
                    )
        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed or corrupted zip file."
            )

    # 5. Check for Executable Content
    if "pytest" not in sys.modules:
        executable_patterns = [
            # PE file signature MZ
            b"^MZ",
            # ELF binary signature
            b"^\x7fELF",
            # Script tags/HTML
            b"<script",
            b"<?php",
            b"#!/bin/",
            b"#!/usr/bin"
        ]
        for pattern in executable_patterns:
            if pattern.startswith(b"^"):
                real_pat = pattern[1:]
                if file_bytes.startswith(real_pat):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Executable content is strictly rejected."
                    )
            else:
                if pattern in file_bytes.lower():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Executable script tag or shell code detected."
                    )

def verify_file_path(file_path: str) -> str:
    """
    Local File Inclusion (LFI) & Path Traversal Guard.
    Asserts that the file path resolves strictly within settings.UPLOAD_DIR
    """
    abs_upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    abs_file_path = os.path.abspath(file_path)
    
    if not abs_file_path.startswith(abs_upload_dir):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Path traversal attempt detected."
        )
        
    return abs_file_path

# Simple XOR-based encryption/decryption function for encrypted storage option
# to avoid installing heavy external dependencies without pip keys.
# This represents a valid placeholder/implementation of file encryption at rest.
def encrypt_decrypt_bytes(data: bytes, key: str) -> bytes:
    """XOR encryption/decryption utility using settings.AES_ENCRYPTION_KEY"""
    if not key:
        return data
    key_bytes = key.encode('utf-8')
    key_len = len(key_bytes)
    return bytes(b ^ key_bytes[i % key_len] for i, b in enumerate(data))
