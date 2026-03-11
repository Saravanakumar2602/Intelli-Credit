from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
import os

def generate_cam(company, financials, ratios, risk):
    """Generate a Credit Appraisal Memo (CAM) as PDF"""
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{company.replace(' ', '_')}_CAM.pdf"
        
        doc = SimpleDocTemplate(file_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#003d82'),
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#003d82'),
            spaceAfter=10,
            spaceBefore=15
        )
        
        story.append(Paragraph("CREDIT APPRAISAL MEMO", title_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y')}", styles['Normal']))
        story.append(Paragraph(f"<b>Company:</b> {company}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("FINANCIAL SUMMARY", heading_style))
        fin_data = [['Metric', 'Value']]
        for key, value in financials.items():
            metric_name = key.replace("_", " ").title()
            if isinstance(value, (int, float)):
                fin_data.append([metric_name, f"{value:,.0f}"])
            else:
                fin_data.append([metric_name, str(value)])
        
        fin_table = Table(fin_data, colWidths=[3.5*inch, 2.5*inch])
        fin_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003d82')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f4f5f7')]),
        ]))
        story.append(fin_table)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("FINANCIAL RATIOS", heading_style))
        ratio_data = [['Ratio', 'Value']]
        for key, value in ratios.items():
            ratio_name = key.replace("_", " ").title()
            ratio_data.append([ratio_name, f"{float(value):.4f}"])
        
        ratio_table = Table(ratio_data, colWidths=[3.5*inch, 2.5*inch])
        ratio_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003d82')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f4f5f7')]),
        ]))
        story.append(ratio_table)
        story.append(Spacer(1, 0.3*inch))
        
        story.append(Paragraph("RISK ASSESSMENT", heading_style))
        risk_data = [
            ['Metric', 'Value'],
            ['Risk Score', f"{risk['score']}/100"],
            ['Risk Level', risk['risk_level']]
        ]
        
        risk_table = Table(risk_data, colWidths=[3.5*inch, 2.5*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003d82')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f4f5f7')]),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 0.3*inch))
        

        story.append(Paragraph("RECOMMENDATION", heading_style))
        # --- Updated logic to match recommendation_engine.py ---
        revenue = financials.get("revenue", 0)
        profit = financials.get("net_profit", 0)
        profit_margin = ratios.get("profit_margin", 0)
        leverage = ratios.get("leverage", 0)
        debt_ratio = ratios.get("debt_ratio", 0)
        risk_score = risk.get("score", 100)
        # Financial health score (simple version)
        financial_score = 0
        if revenue > 0:
            financial_score += 20
        if profit_margin > 0.15:
            financial_score += 20
        elif profit_margin > 0.05:
            financial_score += 10
        if leverage < 1.5:
            financial_score += 20
        elif leverage < 2.5:
            financial_score += 10
        if debt_ratio < 0.4:
            financial_score += 20
        elif debt_ratio < 0.7:
            financial_score += 10
        if profit > 0:
            financial_score += 10

        # Decision logic
        # (financial × 40%) + ((100-risk) × 40%) + (100 × 20%)
        final_score = (financial_score * 0.4) + ((100 - risk_score) * 0.4) + (100 * 0.2)

        if revenue <= 0 or profit <= 0 or risk_score >= 70 or financial_score < 40:
            recommendation = "<b>REJECTED</b> - Multiple risk factors and/or poor financials. Recommend declining or escalating for senior review."
        elif final_score >= 75 and risk_score <= 40:
            recommendation = "<b>APPROVED</b> - Company demonstrates strong financial health and low risk profile."
        elif final_score >= 60 and risk_score <= 60:
            recommendation = "<b>CONDITIONAL APPROVAL</b> - Further detailed review or conditions required before final decision."
        else:
            recommendation = "<b>REJECTED</b> - Multiple risk factors and/or poor financials. Recommend declining or escalating for senior review."

        story.append(Paragraph(recommendation, styles['Normal']))
        story.append(Spacer(1, 0.4*inch))
        
        footer_text = "<i>This is an AI-generated Credit Appraisal Memo. Manual verification and official review are required before final lending decision.</i>"
        story.append(Paragraph(footer_text, styles['Normal']))
        
        doc.build(story)
        return file_path
        
    except Exception as e:
        print(f"[ERROR] CAM PDF Generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise
