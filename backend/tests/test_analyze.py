import os
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
    response = client.post("/api/v1/onboarding/", json=payload)
    assert response.status_code == 200
    assert "saved successfully" in response.json()["message"]
    assert response.json()["data"]["cin"] == payload["cin"]


def test_file_upload_success(client):
    """Test file upload endpoint with mock files"""
    data = {"company": "TestCorp"}
    files = {
        "alm": ("alm.pdf", io.BytesIO(b"%PDF-1.4 dummy alm"), "application/pdf"),
        "shareholding": ("shareholding.pdf", io.BytesIO(b"%PDF-1.4 dummy shareholding"), "application/pdf"),
        "borrowing": ("borrowing.pdf", io.BytesIO(b"%PDF-1.4 dummy borrowing"), "application/pdf"),
        "annual": ("annual.pdf", io.BytesIO(b"%PDF-1.4 dummy annual"), "application/pdf"),
        "portfolio": ("portfolio.pdf", io.BytesIO(b"%PDF-1.4 dummy portfolio"), "application/pdf"),
    }
    response = client.post("/api/v1/upload/", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["message"] == "All files uploaded successfully"
    assert "file_paths" in res_data
    assert "annual" in res_data["file_paths"]

    for file_path in res_data["file_paths"].values():
        if os.path.exists(file_path):
            os.remove(file_path)


def test_download_file_path_traversal_prevention(client):
    """Test downloading files blocks directory traversal paths"""
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


def test_llm_pipeline_fallback_when_api_key_missing(monkeypatch):
    """Test that LLM pipeline returns fallback values if GROQ_API_KEY is missing"""
    import asyncio
    from backend.services.llm_pipeline import run_multi_agent_pipeline
    monkeypatch.setenv("GROQ_API_KEY", "")
    res = asyncio.run(run_multi_agent_pipeline(
        company_name="Test Company",
        sector="Technology",
        text="some random text",
        loan_details={"amount": 1000000, "tenure": 12, "interest": 10.0, "type": "Term Loan"}
    ))
    assert "financials" in res
    assert "recommendation" in res
    assert res["recommendation"]["decision"] in ["APPROVE", "CONDITIONAL_APPROVE", "REJECT"]
