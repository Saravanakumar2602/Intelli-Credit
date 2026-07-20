import re
import numpy as np
from typing import List, Dict, Tuple, Set

class RAGEngine:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.chunks: List[str] = []
        self.vocab: Dict[str, int] = {}
        self.tfidf_matrix: np.ndarray = np.array([])
        self.idf: np.ndarray = np.array([])

    def chunk_document(self, text: str) -> List[str]:
        """
        Split document text into chunks of self.chunk_size characters,
        overlapping by self.chunk_overlap characters.
        Deduplicates exact matching chunks to avoid redundancy.
        """
        if not text:
            return []
            
        paragraphs = text.split("\n\n")
        raw_chunks = []
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
                
            # If paragraph fits, keep it as is
            if len(para) <= self.chunk_size:
                raw_chunks.append(para)
            else:
                # Sliding window chunking
                start = 0
                while start < len(para):
                    end = start + self.chunk_size
                    chunk = para[start:end]
                    raw_chunks.append(chunk)
                    start += (self.chunk_size - self.chunk_overlap)

        # Deduplicate chunks
        seen: Set[str] = set()
        deduplicated = []
        for chunk in raw_chunks:
            normalized = re.sub(r'\s+', ' ', chunk).strip()
            if normalized and normalized not in seen:
                seen.add(normalized)
                deduplicated.append(chunk)
                
        self.chunks = deduplicated
        self._build_index()
        return self.chunks

    def _tokenize(self, text: str) -> List[str]:
        """Convert text into lowercase tokens"""
        return re.findall(r'\b[a-z]{3,15}\b', text.lower())

    def _build_index(self):
        """Build TF-IDF vectors for all chunks"""
        if not self.chunks:
            return
            
        # 1. Build Vocabulary
        tokenized_chunks = [self._tokenize(chunk) for chunk in self.chunks]
        vocab_set = set()
        for tokens in tokenized_chunks:
            vocab_set.update(tokens)
            
        self.vocab = {word: idx for idx, word in enumerate(sorted(vocab_set))}
        vocab_size = len(self.vocab)
        
        if vocab_size == 0:
            return
            
        num_docs = len(self.chunks)
        
        # 2. Compute TF and DF
        tf = np.zeros((num_docs, vocab_size))
        df = np.zeros(vocab_size)
        
        for doc_idx, tokens in enumerate(tokenized_chunks):
            if not tokens:
                continue
            unique_tokens = set(tokens)
            for token in tokens:
                if token in self.vocab:
                    tf[doc_idx, self.vocab[token]] += 1
            for token in unique_tokens:
                if token in self.vocab:
                    df[self.vocab[token]] += 1
                    
        # 3. Compute IDF
        # Add 1 to numerator and denominator to prevent division by zero (standard smoothing)
        self.idf = np.log((num_docs + 1) / (df + 1)) + 1
        
        # 4. Compute TF-IDF Matrix
        self.tfidf_matrix = tf * self.idf
        
        # Normalize vectors for cosine similarity
        norms = np.linalg.norm(self.tfidf_matrix, axis=1, keepdims=True)
        # Avoid division by zero
        norms[norms == 0] = 1.0
        self.tfidf_matrix = self.tfidf_matrix / norms

    def semantic_search(self, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Perform cosine similarity semantic search on the query
        Returns: list of tuples (chunk_text, similarity_score)
        """
        if not self.chunks or len(self.vocab) == 0:
            return []
            
        # Vectorize query
        query_tokens = self._tokenize(query)
        query_vector = np.zeros(len(self.vocab))
        
        for token in query_tokens:
            if token in self.vocab:
                query_vector[self.vocab[token]] += 1
                
        # TF-IDF query vector
        query_vector = query_vector * self.idf
        
        query_norm = np.linalg.norm(query_vector)
        if query_norm == 0:
            # Fallback to returning top chunks
            return [(self.chunks[i], 0.0) for i in range(min(top_k, len(self.chunks)))]
            
        query_vector = query_vector / query_norm
        
        # Compute cosine similarity
        similarities = np.dot(self.tfidf_matrix, query_vector)
        
        # Get top K indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append((self.chunks[idx], float(similarities[idx])))
            
        return results

    def get_context_for_query(self, query: str, max_chunks: int = 3) -> str:
        """Helper to get a combined text block of matching chunks for prompting"""
        search_results = self.semantic_search(query, top_k=max_chunks)
        return "\n\n---\n\n".join([chunk for chunk, score in search_results])
