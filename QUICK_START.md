# Quick Start & Testing Guide

## Starting the Application

### 1. Start Backend
```bash
cd "c:\Saravanakumar G\Projects\Intelli-Credit"
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```
Backend runs on: `http://localhost:8000`

### 2. Start Ollama LLM
```bash
ollama serve
# In another terminal:
ollama pull qwen3:8b
```
Ollama runs on: `http://localhost:11434`

### 3. Start Frontend
```bash
cd "c:\Saravanakumar G\Projects\Intelli-Credit\frontend"
npm run dev
```
Frontend runs on: `http://localhost:5173` (or similar)

---

## Testing Workflow

### Step 1: Login
1. Go to `http://localhost:5173`
2. **Signup** with any credentials (email@test.com, password123)
3. **Login** with same credentials

### Step 2: Upload Documents
1. Click **"Upload"** tab
2. Enter **Company Name**: e.g., "ICICI Bank"
3. Upload **5 PDF files**:
   - ALM.pdf
   - Shareholding.pdf
   - Borrowing.pdf
   - Annual.pdf
   - Portfolio.pdf
4. Click **"Upload Files"**
5. Wait for success message

### Step 3: Classify Files
1. You'll be redirected to **"File Classification"** page
2. See all 5 uploaded files listed
3. Review auto-detected file types
4. Click **"Ingest & Extract"**
5. Wait for "Analyzing..." message (30-60 seconds)

### Step 4: View Results
You'll see **8 tabs** with analysis:

#### Tab 1: Financial Data
```
Shows extracted numbers:
- Revenue: ₹125,000
- Net Profit: ₹15,400
- Total Assets: ₹80,000
- Total Liabilities: ₹50,000
- Equity: ₹30,000
```

#### Tab 2: Financial Ratios
```
Shows calculated metrics:
- Profit Margin: 12.3%
- Debt Ratio: 62.5%
- Leverage: 2.67x
- Current Ratio: 1.2x
```

#### Tab 3: Risk Assessment
```
Shows risk score:
- Score: 45/100 (MODERATE)
- Risk Summary: Adequate with monitoring
```

#### Tab 4: Secondary Research ✓ NEW
```
Shows market intelligence:
- Overall Market Sentiment: POSITIVE
- Regulatory News (5+ articles with sentiment)
- Market News (5+ articles with sentiment)
- Competitive Analysis
- Media Coverage Metrics
- Industry Trends
- Risk Flags (if any)
```

#### Tab 5: SWOT Analysis ✓ NEW
```
Shows 4-panel strategic analysis:

STRENGTHS (green panel)
├─ Established business operations
└─ Solid asset base

WEAKNESSES (red panel)
├─ High debt burden

OPPORTUNITIES (blue panel)
├─ Market expansion
├─ Digital transformation

THREATS (orange panel)
├─ Economic volatility
└─ Regulatory changes
```

#### Tab 6: Recommendation ✓ NEW
```
Shows loan decision:

DECISION: CONDITIONAL APPROVAL
Confidence: 72/100
Approval Probability: 65%

FINANCIAL ANALYSIS
├─ Score: 70/100
├─ ✓ Positive revenue generation
├─ ⚠ Moderate profitability (12.3%)
├─ ✓ Conservative leverage (2.67x)
└─ ⚠ Moderate debt ratio (62.5%)

RISK ASSESSMENT
├─ Score: 45/100
└─ Label: MODERATE

SECONDARY RESEARCH
├─ Market Sentiment: POSITIVE
└─ Confidence: 85/100

DATA QUALITY
├─ Status: PASS
└─ Confidence: 85/100

POSITIVE FACTORS
✓ Positive market sentiment
✓ Adequate liquidity

RISK FACTORS
⚠ High leverage

APPROVAL CONDITIONS
1. Enhanced monitoring of risk indicators
2. Quarterly financial reporting

NEXT STEPS
1. Enhanced monitoring required
2. Quarterly financial review
```

#### Tab 7: News & Sentiment
```
Shows media articles with sentiment scores
```

#### Tab 8: Credit Memo
```
Shows detailed credit appraisal report
```

---

## Key Features to Test

### 1. Secondary Research
- ✓ NewsAPI integration (fetch articles)
- ✓ Regulatory news detection
- ✓ Market sentiment analysis
- ✓ Competitive intelligence
- ✓ Industry trends
- ✓ Media coverage metrics

### 2. Data Triangulation
- ✓ Financial health validation
- ✓ Sentiment alignment check
- ✓ Anomaly detection
- ✓ Red flag identification
- ✓ Confidence scoring
- ✓ Data quality report

### 3. SWOT Analysis
- ✓ LLM-powered generation (Ollama)
- ✓ Impact/Potential/Severity levels
- ✓ Evidence-based analysis
- ✓ Strategic assessment
- ✓ Key focus areas

### 4. Recommendation Engine
- ✓ Financial health scoring (0-100)
- ✓ Risk evaluation
- ✓ Explainable reasoning
- ✓ Decision logic (APPROVE/CONDITIONAL/REJECT)
- ✓ Approval probability calculation
- ✓ Conditions and next steps
- ✓ Positive and risk factors

---

## Environment Variables (Optional)

Create `.env` file in project root:

```env
# News API
NEWS_API_KEY=your_newsapi_key_here

# Ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=qwen3:8b

# Backend
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your_secret_key_here

# Frontend (in .env)
VITE_API_URL=http://localhost:8000
```

To get NewsAPI key:
1. Go to https://newsapi.org
2. Sign up for free account
3. Copy API key
4. Add to `.env`

---

## Troubleshooting

### Backend errors
```
Check logs in terminal running uvicorn
Common issues:
- Ollama not running: Start ollama serve
- NewsAPI not configured: Optional, works without it
- Files not found: Check uploads/ directory
```

### LLM timeouts
```
- Reduce input text (already limited to 2000 chars)
- Model may be slow on first run
- Give it 30-60 seconds
```

### Frontend not showing data
```
1. Check browser console (F12)
2. Check backend logs
3. Ensure /analyze endpoint returns data
4. Try refreshing page
```

### NewsAPI not working
```
- Add NEWS_API_KEY to environment
- Check API quota (free tier has limits)
- Works without it (uses fallback)
```

---

## File Locations

```
c:\Saravanakumar G\Projects\Intelli-Credit\
├── app/
│   ├── routes/
│   │   ├── upload.py           # File upload endpoint
│   │   └── analyze.py          # Main analysis pipeline
│   └── services/
│       ├── document_parser.py  # PDF text extraction
│       ├── llm_extractor.py    # Financial data extraction
│       ├── financial_analysis.py # Ratio calculation
│       ├── risk_scoring.py     # Risk calculation
│       ├── news_research.py    # News sentiment
│       ├── secondary_research.py ✓ # Multi-source research
│       ├── triangulation_service.py ✓ # Data validation
│       ├── swot_analysis.py    ✓ # SWOT generation
│       ├── recommendation_engine.py ✓ # Loan decision
│       └── cam_generator.py    # Report generation
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Upload.jsx
│       │   ├── FileClassification.jsx
│       │   ├── FinancialData.jsx
│       │   ├── FinancialRatios.jsx
│       │   ├── RiskAssessment.jsx
│       │   ├── NewsSentiment.jsx
│       │   ├── CreditAppraisalMemo.jsx
│       │   ├── SecondaryResearch.jsx ✓
│       │   ├── SWOTAnalysis.jsx ✓
│       │   └── Recommendation.jsx ✓
│       └── styles/
│           ├── Upload.css
│           ├── FileClassification.css
│           └── Results.css (enhanced) ✓
├── uploads/             # Stored PDF files
└── PHASE2_IMPLEMENTATION.md ✓ (this documentation)
```

---

## Development Notes

### Adding New Analysis Service
1. Create service in `app/services/`
2. Write function to extract/analyze data
3. Import in `app/routes/analyze.py`
4. Add to /analyze endpoint pipeline
5. Return data in response JSON

### Adding New Results Tab
1. Create page component in `frontend/src/pages/`
2. Accept `data` prop
3. Extract relevant section from `data` object
4. Add styling to `Results.css`
5. Add route in `App.jsx`
6. Add navigation link in `ResultsNavigation`

### Testing Without Files
Use demo data in FileClassification.jsx - it shows sample data if no files uploaded.

---

## Success Indicators

✅ Backend starts without errors
✅ Frontend loads login page
✅ Can login/signup
✅ Can upload 5 PDFs
✅ File classification page shows uploaded files
✅ Click "Ingest & Extract" triggers analysis
✅ Results page shows all 8 tabs
✅ Financial Data tab shows extracted numbers
✅ Secondary Research tab shows news articles
✅ SWOT Analysis tab shows 4 colored panels
✅ Recommendation tab shows decision (APPROVE/CONDITIONAL/REJECT)

---

## Next Steps (Optional)

1. **Add Legal Research Service**
   - Scrape regulatory filings
   - Extract credit bureau data
   - Analyze compliance status

2. **Add Market Analysis Service**
   - Sector benchmarking
   - Competitor comparison
   - Market share analysis

3. **Add PDF Export**
   - Download comprehensive report
   - Include all 8 sections
   - Professional formatting

4. **Add Email Reports**
   - Send analysis via email
   - Schedule automated reports
   - Batch processing

---

## Support & Debugging

### Enable Debug Logging
In `app/main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Analysis Response
In browser console, inspect the data sent:
```javascript
console.log(analysisData)
```

### Backend API Testing
Use Swagger UI at: `http://localhost:8000/docs`

---

**Status**: ✅ **PRODUCTION READY**

All core features implemented and tested. Ready for deployment.
