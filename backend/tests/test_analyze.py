import os
import shutil
import io

def test_onboarding_submission(client):
    """Test entity onboarding POST endpoint"""
    payload = {
        "cin": "U72200KA2020PTC134251",
        "pan": "AAACX1234A",
        "sector": "Technology",
        "turnover": "50000000",
        "type": "Term Loan",
        "amount": "10000000",
        "tenure": "60",
        "interest": "9.5"
    }
    response = client.post("/onboarding/", json=payload)
    assert response.status_code == 200
    assert "saved successfully" in response.json()["message"]
    assert response.json()["data"]["cin"] == payload["cin"]

def test_file_upload_success(client):
    """Test file upload endpoint with mock files"""
    # Create test byte streams representing dummy PDF files
    data = {
        "company": "TestCorp",
    }
    
    # We must provide all 5 files required by the route:
    # alm, shareholding, borrowing, annual, portfolio
    files = {
        "alm": ("alm.pdf", io.BytesIO(b"dummy pdf content alm"), "application/pdf"),
        "shareholding": ("shareholding.pdf", io.BytesIO(b"dummy pdf content shareholding"), "application/pdf"),
        "borrowing": ("borrowing.pdf", io.BytesIO(b"dummy pdf content borrowing"), "application/pdf"),
        "annual": ("annual.pdf", io.BytesIO(b"dummy pdf content annual"), "application/pdf"),
        "portfolio": ("portfolio.pdf", io.BytesIO(b"dummy pdf content portfolio"), "application/pdf"),
    }
    
    response = client.post("/upload/", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["message"] == "All files uploaded successfully"
    assert "file_paths" in res_data
    assert "annual" in res_data["file_paths"]
    
    # Clean up uploaded files in uploads folder after test
    for file_path in res_data["file_paths"].values():
        if os.path.exists(file_path):
            os.remove(file_path)

def test_download_file_path_traversal_prevention(client):
    """Test downloading files block directory traversal paths"""
    # Try directory traversal
    response = client.get("/download/?file_path=../etc/passwd")
    assert response.status_code == 200
    assert "error" in response.json()
    assert response.json()["error"] == "Invalid file path"

def test_download_file_not_found(client):
    """Test download endpoint returns error when file does not exist"""
    response = client.get("/download/?file_path=uploads/nonexistent_file.pdf")
    assert response.status_code == 200
    assert "error" in response.json()
    assert response.json()["error"] == "File not found"

def test_llm_extractor_fallback_when_api_key_missing(monkeypatch):
    """Test that LLM extractor returns zero financials if API key is missing"""
    import asyncio
    from app.services.llm_extractor import extract_financials
    monkeypatch.setenv("GROQ_API_KEY", "")
    res = asyncio.run(extract_financials("some random text"))
    assert res["revenue"] == 0
    assert res["net_profit"] == 0

def test_swot_analysis_fallback_when_api_key_missing(monkeypatch):
    """Test that SWOT analysis returns default mock SWOT if API key is missing"""
    import asyncio
    from app.services.swot_analysis import generate_swot_analysis
    monkeypatch.setenv("GROQ_API_KEY", "")
    res = asyncio.run(generate_swot_analysis("Test Company", "Tech", {}, {}, {}, {}))
    assert res["company"] == "Test Company"
    assert len(res["strengths"]) > 0  # Should use default fallback SWOT

