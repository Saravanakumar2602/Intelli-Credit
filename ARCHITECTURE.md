# Intelli-Credit Platform - Complete Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐           │
│  │   Login      │    │  Onboarding     │    │  Upload (5 PDFs) │           │
│  │   Signup     │    │  (Company Info) │    │  (Company Name)  │           │
│  └──────────────┘    └─────────────────┘    └──────────────────┘           │
│         ↓                    ↓                       ↓                        │
│         └────────────────────┴───────────────────────┘                      │
│                              ↓                                              │
│                  ┌───────────────────────┐                                  │
│                  │ FileClassification    │                                  │
│                  │ (Review 5 Files)      │                                  │
│                  │ (Classify Types)      │                                  │
│                  └───────────────────────┘                                  │
│                              ↓                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  RESULTS PAGE - 8 ANALYSIS TABS                                      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  [Financial] [Ratios] [Risk] [Secondary] [SWOT] [Recommendation]     │  │
│  │  [News]      [CAM]                                                   │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Each Tab Displays Comprehensive Analysis Data                  │  │  │
│  │  │ - FinancialData: Revenue, Assets, Liabilities, Equity          │  │  │
│  │  │ - FinancialRatios: Margins, Leverage, Liquidity                │  │  │
│  │  │ - RiskAssessment: Risk Score, Risk Factors                     │  │  │
│  │  │ - SecondaryResearch: News Sentiment, Red Flags, Trends         │  │  │
│  │  │ - SWOTAnalysis: 4-Panel Strategic Analysis                     │  │  │
│  │  │ - Recommendation: APPROVE/CONDITIONAL/REJECT with Reasoning    │  │  │
│  │  │ - NewsSentiment: Media Articles with Sentiment Scores          │  │  │
│  │  │ - CreditAppraisalMemo: Detailed Report                         │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       ↕
                              (HTTP REST API)
                                       ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ROUTE: /upload (POST)                                                │  │
│  │ Input: 5 PDFs (alm, shareholding, borrowing, annual, portfolio)     │  │
│  │        Company Name                                                  │  │
│  │ Output: file_paths object with saved file locations                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                              ↓                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ROUTE: /analyze (POST)                                               │  │
│  │ Input: file_paths, company_name                                     │  │
│  │                                                                       │  │
│  │ PROCESSING PIPELINE:                                                │  │
│  │ ├─ extract_text_from_pdf()        [document_parser.py]             │  │
│  │ ├─ extract_financials()           [llm_extractor.py]               │  │
│  │ ├─ calculate_ratios()             [financial_analysis.py]          │  │
│  │ ├─ get_company_news()             [news_research.py]               │  │
│  │ ├─ calculate_risk_score()         [risk_scoring.py]                │  │
│  │ ├─ generate_secondary_research()  [secondary_research.py] ✓        │  │
│  │ │  └─ NewsAPI article fetching                                     │  │
│  │ │  └─ Regulatory news sentiment analysis                           │  │
│  │ │  └─ Market news sentiment analysis                               │  │
│  │ │  └─ Competitive landscape analysis                               │  │
│  │ │  └─ Media coverage metrics                                        │  │
│  │ │  └─ Industry trend analysis                                       │  │
│  │ ├─ triangulate_data()             [triangulation_service.py] ✓     │  │
│  │ │  └─ Validate financial health                                    │  │
│  │ │  └─ Cross-check with sentiment                                   │  │
│  │ │  └─ Identify anomalies                                           │  │
│  │ │  └─ Flag red flags                                               │  │
│  │ │  └─ Calculate confidence score                                   │  │
│  │ ├─ generate_swot_analysis()       [swot_analysis.py] ✓             │  │
│  │ │  └─ Call Ollama LLM (qwen3:8b)                                   │  │
│  │ │  └─ Generate strengths, weaknesses                               │  │
│  │ │  └─ Identify opportunities, threats                              │  │
│  │ │  └─ Strategic assessment                                          │  │
│  │ ├─ generate_recommendation()      [recommendation_engine.py] ✓     │  │
│  │ │  └─ Score financial health (0-100)                               │  │
│  │ │  └─ Evaluate risk factors                                         │  │
│  │ │  └─ Review secondary research                                     │  │
│  │ │  └─ Check data quality                                            │  │
│  │ │  └─ Make APPROVE/CONDITIONAL/REJECT decision                     │  │
│  │ │  └─ Generate reasoning                                            │  │
│  │ └─ generate_cam()                 [cam_generator.py]                │  │
│  │                                                                       │  │
│  │ Output: Comprehensive analysis object with all components            │  │
│  │ {                                                                    │  │
│  │   "financials": {...},                                              │  │
│  │   "ratios": {...},                                                  │  │
│  │   "news": {...},                                                    │  │
│  │   "risk": {...},                                                    │  │
│  │   "secondary_research": {...},     ✓ NEW                            │  │
│  │   "triangulation": {...},          ✓ NEW                            │  │
│  │   "swot": {...},                   ✓ NEW                            │  │
│  │   "recommendation": {...},         ✓ NEW                            │  │
│  │   "cam_report": {...}                                               │  │
│  │ }                                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ EXTERNAL SERVICES CALLED:                                            │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │ • NewsAPI.org (for secondary research articles)                     │  │
│  │   ├─ Regulatory news                                                │  │
│  │   ├─ Market news                                                    │  │
│  │   ├─ Competitive intelligence                                       │  │
│  │   └─ Industry trends                                                │  │
│  │                                                                       │  │
│  │ • Ollama LLM (localhost:11434)                                       │  │
│  │   └─ SWOT analysis generation                                        │  │
│  │   └─ Text analysis and summarization                                │  │
│  │                                                                       │  │
│  │ • TextBlob (sentiment analysis)                                      │  │
│  │   └─ News article sentiment scoring                                 │  │
│  │   └─ Market sentiment analysis                                      │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       ↕
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE & PROCESSING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  • PDFs: /app/uploads/{company}_*.pdf                                      │
│  • Extracted Text: In-memory processing                                     │
│  • Financial Data: Python dict (memory resident)                            │
│  • Analysis Results: JSON response to frontend                              │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Complete Workflow

```
USER INPUT
├─ Login/Signup
│  └─ Store auth token
│
├─ Onboarding (Optional)
│  └─ Save company info
│
└─ Upload 5 PDFs + Company Name
   └─ POST /upload
      ├─ Save files to disk
      └─ Return file_paths

CLASSIFICATION
└─ Review uploaded files
   ├─ Auto-detect file types
   ├─ Approve/Edit types
   └─ Click "Ingest & Extract"
      └─ POST /analyze

BACKEND ANALYSIS (Sequential)
├─ PDF PARSING
│  ├─ Extract text from PDFs (pdfplumber)
│  └─ Limit to 2000 chars for LLM
│
├─ FINANCIAL EXTRACTION
│  ├─ Call Ollama LLM (qwen3:8b)
│  ├─ Structured JSON extraction
│  ├─ Extract: revenue, profit, assets, liabilities
│  └─ Calculate: equity = assets - liabilities
│
├─ FINANCIAL RATIOS
│  ├─ Profit margin
│  ├─ Debt ratio
│  ├─ Leverage ratio
│  └─ Current ratio (if available)
│
├─ SENTIMENT ANALYSIS
│  ├─ Get news articles (NewsAPI)
│  └─ Sentiment score per article (TextBlob)
│
├─ RISK SCORING
│  ├─ Base risk from financials
│  ├─ Adjust by sentiment
│  └─ Score: 0 (low) - 100 (high)
│
├─ SECONDARY RESEARCH ✓ NEW
│  ├─ Query NewsAPI for:
│  │  ├─ Regulatory news (RBI, SEBI)
│  │  ├─ Market news (earnings, IPO, etc)
│  │  ├─ Competitive news
│  │  └─ Industry trends
│  ├─ Sentiment analysis on each
│  ├─ Extract top 5-10 articles per category
│  ├─ Calculate overall sentiment
│  └─ Identify risk flags
│
├─ DATA TRIANGULATION ✓ NEW
│  ├─ Compare financial health score (0-100)
│  ├─ Compare with sentiment score (-1 to 1)
│  ├─ Identify mismatches > 0.5 (anomalies)
│  ├─ Check for regulatory red flags
│  ├─ Validate data completeness
│  ├─ Check industry vs company sentiment
│  └─ Confidence score: 0-100
│
├─ SWOT ANALYSIS ✓ NEW
│  ├─ Call Ollama LLM with context
│  ├─ Generate 3-4 items per category
│  ├─ Strengths with impact (high/med/low)
│  ├─ Weaknesses with impact
│  ├─ Opportunities with potential
│  ├─ Threats with severity
│  └─ Strategic assessment summary
│
├─ LOAN RECOMMENDATION ✓ NEW
│  ├─ Financial health score (0-100)
│  │  └─ Revenue, profit, leverage, debt, liquidity
│  ├─ Risk evaluation (0-100)
│  ├─ Secondary research review
│  │  └─ Sentiment, red flags, trends
│  ├─ Data quality check
│  │  └─ Completeness, anomalies, confidence
│  ├─ Decision logic:
│  │  ├─ APPROVE if: Score ≥75 AND Risk ≤40 AND Data=Pass
│  │  ├─ CONDITIONAL if: Score ≥60 AND Risk ≤60 AND Data≠Fail
│  │  └─ REJECT if: Score<60 OR Risk>60 OR Data=Fail
│  ├─ Generate reasoning:
│  │  ├─ Financial analysis points
│  │  ├─ Risk factors
│  │  ├─ Secondary research insights
│  │  └─ Data quality notes
│  ├─ List positive factors
│  ├─ List risk factors
│  ├─ Define conditions (if conditional)
│  └─ Outline next steps
│
└─ CAM REPORT
   └─ Detailed credit appraisal memo

RESPONSE TO FRONTEND
└─ Complete analysis JSON with 8+ data sections

DISPLAY RESULTS
└─ 8-Tab Results Interface
   ├─ Financial Data (extracted numbers)
   ├─ Financial Ratios (calculated metrics)
   ├─ Risk Assessment (risk score & factors)
   ├─ Secondary Research (news & sentiment)
   ├─ SWOT Analysis (strategic view)
   ├─ Recommendation (decision + reasoning)
   ├─ News & Sentiment (media articles)
   └─ Credit Memo (detailed report)
```

---

## Key Components Summary

### Services Added

| Service | Purpose | Key Output |
|---------|---------|-----------|
| secondary_research.py | Multi-source news analysis | Sentiment scores from regulatory, market, competitive sources |
| triangulation_service.py | Data validation | Confidence score, anomalies, red flags |
| swot_analysis.py | LLM-powered strategy | Strengths, weaknesses, opportunities, threats |
| recommendation_engine.py | Explainable loan decision | APPROVE/CONDITIONAL/REJECT with detailed reasoning |

### Frontend Pages Added

| Page | Purpose | Key Displays |
|------|---------|-------------|
| SecondaryResearch.jsx | News & market analysis | Sentiment breakdown by category, articles, trends, risk flags |
| SWOTAnalysis.jsx | Strategic analysis | 4-panel SWOT grid with color coding and evidence |
| Recommendation.jsx | Loan decision | Decision card, confidence meter, reasoning, factors, conditions |

### Decision Scoring

```
Financial Score (0-100)
  ├─ Revenue: +20
  ├─ Profit Margin: +20 (high) or +10 (moderate)
  ├─ Leverage: +20 (<1.5x) or +10 (<2.5x)
  ├─ Debt Ratio: +20 (<40%) or +10 (<60%)
  └─ Liquidity: +20 (≥1.5x) or +10 (≥1.0x)

Risk Score (0-100)
  ├─ Base: from financial analysis
  ├─ Adjust: by sentiment
  └─ Range: 0 (lowest) to 100 (highest)

Data Quality (0-100)
  ├─ Start: 100
  ├─ Deduct: for anomalies, missing data
  ├─ Deduct: for red flags
  └─ Add: for complete data, sentiment match

Final Decision Score = (Financial × 0.4) + ((100-Risk) × 0.4) + (Quality × 0.2)
  + Sentiment adjustments + Red flag deductions

DECISION:
  ├─ APPROVE: Score ≥ 75 AND Risk ≤ 40
  ├─ CONDITIONAL: Score ≥ 60 AND Risk ≤ 60
  └─ REJECT: Otherwise
```

---

## Performance & Limits

- **LLM Input Limit**: 2000 characters (prevents timeouts)
- **News API Limits**: 10 articles per query
- **Processing Time**: ~30-60 seconds for full analysis
- **Confidence Interval**: 0-100 (higher = more reliable)
- **Data Quality Validation**: Multiple cross-checks

---

## System Status

✅ **Phase 1 Complete**: File upload, document parsing, financial extraction
✅ **Phase 2 Complete**: Secondary research, SWOT, recommendation engine
⏳ **Phase 3 (Optional)**: Legal research, market benchmarking, PDF export

