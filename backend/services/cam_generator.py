from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

def generate_cam(
    company: str,
    financials: dict,
    ratios: dict,
    risk: dict,
    secondary_research: dict,
    triangulation: dict,
    swot: dict,
    recommendation: dict
) -> str:
    """
    Generate an enterprise-grade Credit Appraisal Memo (CAM) PDF.
    Saves the file to settings.UPLOAD_DIR and returns the filepath.
    """
    try:
        os.makedirs("uploads", exist_ok=True)
        sanitized_company = "".join(c for c in company if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
        file_path = f"uploads/{sanitized_company}_CAM.pdf"
        
        # 0.5-inch margins for dense financial layout
        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch,
            leftMargin=0.5*inch,
            rightMargin=0.5*inch
        )
        story = []
        styles = getSampleStyleSheet()
        
        # Corporate Banking Theme Colors
        PRIMARY_COLOR = colors.HexColor('#002B49')   # Navy Blue
        SECONDARY_COLOR = colors.HexColor('#008080') # Teal
        LIGHT_BG = colors.HexColor('#F4F6F8')        # Off-white
        BORDER_COLOR = colors.HexColor('#D1D5DB')    # Light Grey
        
        title_style = ParagraphStyle(
            'CAMTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=PRIMARY_COLOR,
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CAMSectionHeading',
            parent=styles['Heading2'],
            fontSize=11,
            textColor=PRIMARY_COLOR,
            spaceBefore=10,
            spaceAfter=6,
            borderColor=SECONDARY_COLOR,
            borderWidth=1,
            borderRadius=2,
            borderPadding=4,
            backColor=LIGHT_BG
        )
        
        bold_style = ParagraphStyle(
            'CAMBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=colors.HexColor('#111827')
        )
        
        normal_style = ParagraphStyle(
            'CAMNormal',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#374151'),
            leading=12
        )
        
        right_style = ParagraphStyle(
            'CAMRight',
            parent=normal_style,
            alignment=TA_RIGHT
        )
        
        # 1. Title Block
        story.append(Paragraph("INTELLI-CREDIT ENTERPRISE UNDERWRITING PLATFORM", ParagraphStyle('Sub', parent=normal_style, alignment=TA_CENTER, fontSize=7, textColor=colors.grey)))
        story.append(Paragraph("CREDIT APPRAISAL MEMORANDUM", title_style))
        story.append(Spacer(1, 0.05*inch))
        
        # 2. Executive Appraisal Table
        appraisal_data = [
            [
                Paragraph("<b>Corporate Entity:</b>", bold_style), Paragraph(company, normal_style),
                Paragraph("<b>Appraisal Date:</b>", bold_style), Paragraph(datetime.now().strftime('%d-%m-%Y'), normal_style)
            ],
            [
                Paragraph("<b>Credit Decision:</b>", bold_style), Paragraph(f"<b>{recommendation.get('decision', 'PENDING')}</b>", bold_style),
                Paragraph("<b>Confidence Score:</b>", bold_style), Paragraph(f"{recommendation.get('confidence', 0.0):.1f}/100", normal_style)
            ],
            [
                Paragraph("<b>Sector / Industry:</b>", bold_style), Paragraph(secondary_research.get("sector_outlook", "General Corporate")[:40] + "...", normal_style),
                Paragraph("<b>Prob. of Default (PD):</b>", bold_style), Paragraph(f"{ratios.get('probability_of_default', 0.01)*100:.2f}%", normal_style)
            ]
        ]
        appraisal_table = Table(appraisal_data, colWidths=[1.8*inch, 2.0*inch, 1.4*inch, 2.3*inch])
        appraisal_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(appraisal_table)
        story.append(Spacer(1, 0.1*inch))
        
        # 3. Decision Rationale Summary
        story.append(Paragraph("I. EXECUTIVE APPRASIAL & UNDERWRITING DECISION", heading_style))
        summary_text = recommendation.get('recommendation_summary', 'No summary generated.')
        story.append(Paragraph(summary_text, normal_style))
        story.append(Spacer(1, 0.1*inch))
        
        # 4. Financial Snapshot & Ratios (Side-by-side)
        story.append(Paragraph("II. FINANCIAL ANALYSIS & CREDIT RATIOS", heading_style))
        
        fin_rows = [[Paragraph("<b>Key Balance Sheet Metrics</b>", bold_style), Paragraph("<b>Value</b>", bold_style)]]
        for key, val in financials.items():
            if key in ["confidence_score", "citations", "equity"]:
                continue
            metric_name = key.replace("_", " ").title()
            if isinstance(val, (int, float)):
                val_str = f"₹ {val:,.0f}" if val > 0 else "0"
                fin_rows.append([Paragraph(metric_name, normal_style), Paragraph(val_str, right_style)])
            else:
                fin_rows.append([Paragraph(metric_name, normal_style), Paragraph(str(val), right_style)])
                
        ratio_rows = [[Paragraph("<b>Credit & Solvency Ratios</b>", bold_style), Paragraph("<b>Value</b>", bold_style)]]
        for key, val in ratios.items():
            if key in ["probability_of_default"]:
                continue
            ratio_name = key.replace("_", " ").title()
            if "margin" in key or "roe" in key or "roa" in key:
                val_str = f"{val:.2%}"
            elif "ratio" in key or "leverage" in key or "debt_equity" in key or "turnover" in key:
                val_str = f"{val:.2f}x"
            else:
                val_str = f"{val:.4f}"
            ratio_rows.append([Paragraph(ratio_name, normal_style), Paragraph(val_str, right_style)])
            
        # Pad tables to same size
        max_rows = max(len(fin_rows), len(ratio_rows))
        while len(fin_rows) < max_rows:
            fin_rows.append([Paragraph("", normal_style), Paragraph("", normal_style)])
        while len(ratio_rows) < max_rows:
            ratio_rows.append([Paragraph("", normal_style), Paragraph("", normal_style)])
            
        combined_rows = []
        for i in range(max_rows):
            combined_rows.append([
                fin_rows[i][0], fin_rows[i][1],
                Paragraph("", normal_style), # padding spacer
                ratio_rows[i][0], ratio_rows[i][1]
            ])
            
        metrics_table = Table(combined_rows, colWidths=[2.2*inch, 1.3*inch, 0.4*inch, 2.2*inch, 1.4*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), PRIMARY_COLOR),
            ('BACKGROUND', (3, 0), (4, 0), PRIMARY_COLOR),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
            ('TEXTCOLOR', (3, 0), (4, 0), colors.white),
            ('GRID', (0, 0), (1, -1), 0.5, BORDER_COLOR),
            ('GRID', (3, 0), (4, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (1, -1), [colors.white, LIGHT_BG]),
            ('ROWBACKGROUNDS', (3, 1), (4, -1), [colors.white, LIGHT_BG]),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.1*inch))
        
        # 5. SWOT Analysis (Keep together)
        swot_elements = []
        swot_elements.append(Paragraph("III. STRATEGIC SWOT MATRIX", heading_style))
        
        swot_data = [
            [Paragraph("<b>Strengths</b>", bold_style), Paragraph("<b>Weaknesses</b>", bold_style)],
            [
                Paragraph("<br/>".join([f"• {item.get('point')} (Impact: {item.get('level')})" for item in swot.get('strengths', [])]), normal_style),
                Paragraph("<br/>".join([f"• {item.get('point')} (Impact: {item.get('level')})" for item in swot.get('weaknesses', [])]), normal_style)
            ],
            [Paragraph("<b>Opportunities</b>", bold_style), Paragraph("<b>Threats</b>", bold_style)],
            [
                Paragraph("<br/>".join([f"• {item.get('point')} (Potential: {item.get('level')})" for item in swot.get('opportunities', [])]), normal_style),
                Paragraph("<br/>".join([f"• {item.get('point')} (Severity: {item.get('level')})" for item in swot.get('threats', [])]), normal_style)
            ]
        ]
        swot_table = Table(swot_data, colWidths=[3.7*inch, 3.8*inch])
        swot_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
            ('BACKGROUND', (0, 2), (-1, 2), LIGHT_BG),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        swot_elements.append(swot_table)
        story.append(KeepTogether(swot_elements))
        story.append(Spacer(1, 0.1*inch))
        
        # 6. Risk Breakdown Radar Table
        risk_elements = []
        risk_elements.append(Paragraph("IV. COMPREHENSIVE RISK INDEX BREAKDOWN", heading_style))
        
        risk_table_rows = [[
            Paragraph("<b>Risk Category</b>", bold_style),
            Paragraph("<b>Risk Score (100 is best)</b>", bold_style),
            Paragraph("<b>Underwriting Rationale / Explanation</b>", bold_style)
        ]]
        
        breakdown = risk.get("breakdown", {})
        for cat, details in breakdown.items():
            cat_name = cat.replace("_", " ").title()
            score_val = details.get("score", 70.0)
            weight_val = details.get("weight", 0.125)
            
            # Simple color matching based on score
            if score_val < 50.0:
                score_str = f"<b>{score_val} (High Risk)</b>"
            elif score_val < 75.0:
                score_str = f"<b>{score_val} (Medium Risk)</b>"
            else:
                score_str = f"<b>{score_val} (Low Risk)</b>"
                
            risk_table_rows.append([
                Paragraph(f"{cat_name} (Weight: {weight_val:.0%})", normal_style),
                Paragraph(score_str, normal_style),
                Paragraph(risk.get("explanation") if cat == "financial" else "Evaluated compliant by underwriting engine criteria.", normal_style)
            ])
            
        risk_table = Table(risk_table_rows, colWidths=[2.0*inch, 2.0*inch, 3.5*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        risk_elements.append(risk_table)
        story.append(KeepTogether(risk_elements))
        story.append(Spacer(1, 0.1*inch))
        
        # 7. Triangulation & Verification Warnings
        tri_elements = []
        tri_elements.append(Paragraph("V. DATA TRIANGULATION & COMPLIANCE SANITY", heading_style))
        
        red_flags_list = triangulation.get("red_flags", [])
        if red_flags_list:
            flags_txt = "<br/>".join([f"• [{f.get('severity', 'medium').upper()}] {f.get('flag')}" for f in red_flags_list])
        else:
            flags_txt = "No regulatory or compliance red flags detected."
            
        anomalies_list = triangulation.get("anomalies", [])
        if anomalies_list:
            anom_txt = "<br/>".join([f"• {a.get('description')}" for a in anomalies_list])
        else:
            anom_txt = "No validation mismatch anomalies detected."
            
        tri_data = [
            [Paragraph("<b>Regulatory Red Flags</b>", bold_style), Paragraph("<b>Data Validation Anomalies</b>", bold_style)],
            [Paragraph(flags_txt, normal_style), Paragraph(anom_txt, normal_style)]
        ]
        tri_table = Table(tri_data, colWidths=[3.7*inch, 3.8*inch])
        tri_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')), # Light Red
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        tri_elements.append(tri_table)
        story.append(KeepTogether(tri_elements))
        story.append(Spacer(1, 0.1*inch))
        
        # 8. Covenants, Conditions & Next Steps
        cov_elements = []
        cov_elements.append(Paragraph("VI. APPROVAL COVENANTS & DISBURSEMENT CONDITIONS", heading_style))
        
        conditions_list = recommendation.get('conditions', [])
        if conditions_list:
            cond_txt = "<br/>".join([f"{idx+1}. {c}" for idx, c in enumerate(conditions_list)])
        else:
            cond_txt = "No special covenants assigned. Standard credit guidelines apply."
            
        steps_list = recommendation.get('next_steps', [])
        if steps_list:
            steps_txt = "<br/>".join([f"{idx+1}. {s}" for idx, s in enumerate(steps_list)])
        else:
            steps_txt = "Standard disbursement checks sheets apply."
            
        cov_data = [
            [Paragraph("<b>Credit Covenants</b>", bold_style), Paragraph("<b>Disbursement Next Steps</b>", bold_style)],
            [Paragraph(cond_txt, normal_style), Paragraph(steps_txt, normal_style)]
        ]
        cov_table = Table(cov_data, colWidths=[3.7*inch, 3.8*inch])
        cov_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ECFDF5')), # Light Green
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        cov_elements.append(cov_table)
        story.append(KeepTogether(cov_elements))
        story.append(Spacer(1, 0.15*inch))
        
        # 9. Signatures and Disclaimer
        story.append(Paragraph("<i><b>Disclaimer:</b> This is an AI-generated corporate Credit Appraisal Memo. Credit decisions must be reviewed and signed off by authorized banking credit officers prior to execution.</i>", ParagraphStyle('Disc', parent=normal_style, fontSize=7, textColor=colors.grey)))
        
        doc.build(story)
        print(f"[PDF] Generated Credit Appraisal Memo at: {file_path}")
        return file_path
        
    except Exception as e:
        print(f"[PDF ERROR] Generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise e
