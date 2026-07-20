from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os

def generate_cam(company, financials, ratios, risk, secondary_research, triangulation, swot, recommendation):
    """Generate a comprehensive Credit Appraisal Memo (CAM) as PDF"""
    try:
        os.makedirs("uploads", exist_ok=True)
        sanitized_company = "".join(c for c in company if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
        file_path = f"uploads/{sanitized_company}_CAM.pdf"
        
        # 0.5 inch margins to fit comprehensive details
        doc = SimpleDocTemplate(file_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#003d82'),
            spaceAfter=15,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#003d82'),
            spaceAfter=8,
            spaceBefore=12
        )
        
        bold_label_style = ParagraphStyle(
            'BoldLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10
        )
        
        normal_style = styles['Normal']
        
        # 1. Header
        story.append(Paragraph("CREDIT APPRAISAL MEMO", title_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Metadata Table
        meta_data = [
            [Paragraph("<b>Company:</b>", normal_style), Paragraph(company, normal_style),
             Paragraph("<b>Date:</b>", normal_style), Paragraph(datetime.now().strftime('%d-%m-%Y'), normal_style)],
            [Paragraph("<b>Recommendation:</b>", normal_style), Paragraph(f"<b>{recommendation.get('decision', 'PENDING')}</b>", normal_style),
             Paragraph("<b>Confidence:</b>", normal_style), Paragraph(f"{recommendation.get('confidence', 0):.0f}/100", normal_style)]
        ]
        meta_table = Table(meta_data, colWidths=[1.8*inch, 2.0*inch, 1.2*inch, 2.5*inch])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 0.15*inch))
        
        # 2. Executive Summary
        story.append(Paragraph("EXECUTIVE RECOMMENDATION", heading_style))
        summary_text = recommendation.get('recommendation_summary', 'No summary available.')
        story.append(Paragraph(summary_text, normal_style))
        story.append(Spacer(1, 0.15*inch))
        
        # 3. Financial & Ratio Tables (Side-by-side to save space)
        story.append(Paragraph("FINANCIAL PERFORMANCE & METRICS", heading_style))
        
        # Create Financials List
        fin_rows = [[Paragraph("<b>Metric</b>", bold_label_style), Paragraph("<b>Value</b>", bold_label_style)]]
        for key, value in financials.items():
            if key == "equity":
                continue
            metric_name = key.replace("_", " ").title()
            if isinstance(value, (int, float)):
                val_str = f"₹ {value:,.0f}" if value > 0 else "0"
                fin_rows.append([Paragraph(metric_name, normal_style), Paragraph(val_str, normal_style)])
            else:
                fin_rows.append([Paragraph(metric_name, normal_style), Paragraph(str(value), normal_style)])
                
        # Create Ratios List
        ratio_rows = [[Paragraph("<b>Ratio</b>", bold_label_style), Paragraph("<b>Value</b>", bold_label_style)]]
        for key, value in ratios.items():
            ratio_name = key.replace("_", " ").title()
            if "margin" in key or "roe" in key or "roa" in key:
                val_str = f"{value:.2%}"
            elif "ratio" in key or "leverage" in key or "debt_equity" in key:
                val_str = f"{value:.2f}x"
            else:
                val_str = f"{value:.4f}"
            ratio_rows.append([Paragraph(ratio_name, normal_style), Paragraph(val_str, normal_style)])
            
        # Pad shorter list to make rows equal
        max_rows = max(len(fin_rows), len(ratio_rows))
        while len(fin_rows) < max_rows:
            fin_rows.append([Paragraph("", normal_style), Paragraph("", normal_style)])
        while len(ratio_rows) < max_rows:
            ratio_rows.append([Paragraph("", normal_style), Paragraph("", normal_style)])
            
        # Combine side-by-side
        combined_rows = []
        for i in range(max_rows):
            combined_rows.append([
                fin_rows[i][0], fin_rows[i][1],
                Paragraph("", normal_style), # gap
                ratio_rows[i][0], ratio_rows[i][1]
            ])
            
        metrics_table = Table(combined_rows, colWidths=[2.2*inch, 1.4*inch, 0.3*inch, 2.2*inch, 1.4*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#003d82')),
            ('BACKGROUND', (3, 0), (4, 0), colors.HexColor('#003d82')),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
            ('TEXTCOLOR', (3, 0), (4, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (1, -1), 0.5, colors.grey),
            ('GRID', (3, 0), (4, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (1, -1), [colors.white, colors.HexColor('#f4f5f7')]),
            ('ROWBACKGROUNDS', (3, 1), (4, -1), [colors.white, colors.HexColor('#f4f5f7')]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.15*inch))
        
        # 4. SWOT Analysis
        swot_elements = []
        swot_elements.append(Paragraph("SWOT ANALYSIS SUMMARY", heading_style))
        
        swot_data = [
            [Paragraph("<b>Strengths</b>", bold_label_style), Paragraph("<b>Weaknesses</b>", bold_label_style)],
            [
                Paragraph("<br/>".join([f"• {item['point']} (Evidence: {item['evidence']})" for item in swot.get('strengths', [])]), normal_style),
                Paragraph("<br/>".join([f"• {item['point']} (Evidence: {item['evidence']})" for item in swot.get('weaknesses', [])]), normal_style)
            ],
            [Paragraph("<b>Opportunities</b>", bold_label_style), Paragraph("<b>Threats</b>", bold_label_style)],
            [
                Paragraph("<br/>".join([f"• {item['point']} (Evidence: {item['evidence']})" for item in swot.get('opportunities', [])]), normal_style),
                Paragraph("<br/>".join([f"• {item['point']} (Evidence: {item['evidence']})" for item in swot.get('threats', [])]), normal_style)
            ]
        ]
        swot_table = Table(swot_data, colWidths=[3.7*inch, 3.8*inch])
        swot_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef3f7')),
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#eef3f7')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        swot_elements.append(swot_table)
        story.append(KeepTogether(swot_elements))
        story.append(Spacer(1, 0.15*inch))
        
        # 5. Risk Assessment, Triangulation, & Validation
        risk_elements = []
        risk_elements.append(Paragraph("RISK ASSESSMENT & DATA VALIDATION", heading_style))
        
        # In case there are red flags
        red_flags_list = triangulation.get('red_flags', [])
        if red_flags_list:
            flags_text = "<br/>".join([f"• [{f.get('severity', 'medium').upper()}] {f.get('flag')}" for f in red_flags_list])
        else:
            flags_text = "No critical regulatory or compliance red flags detected."
            
        anomalies_list = triangulation.get('anomalies', [])
        if anomalies_list:
            anomalies_text = "<br/>".join([f"• {a.get('description')}" for a in anomalies_list])
        else:
            anomalies_text = "No validation anomalies or data mismatches detected."
            
        risk_table_data = [
            [Paragraph("<b>Regulatory Red Flags</b>", bold_label_style), Paragraph("<b>Data Validation Anomalies</b>", bold_label_style)],
            [Paragraph(flags_text, normal_style), Paragraph(anomalies_text, normal_style)]
        ]
        risk_table = Table(risk_table_data, colWidths=[3.7*inch, 3.8*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#fbebeb')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        risk_elements.append(risk_table)
        story.append(KeepTogether(risk_elements))
        story.append(Spacer(1, 0.15*inch))
        
        # 6. Conditions & Guidance
        guidance_elements = []
        guidance_elements.append(Paragraph("APPROVAL CONDITIONS & NEXT STEPS", heading_style))
        
        conditions_list = recommendation.get('conditions', [])
        if conditions_list:
            cond_text = "<br/>".join([f"{idx+1}. {c}" for idx, c in enumerate(conditions_list)])
        else:
            cond_text = "Standard lending guidelines and covenants apply. No special approval conditions."
            
        steps_list = recommendation.get('next_steps', [])
        if steps_list:
            steps_text = "<br/>".join([f"{idx+1}. {s}" for idx, s in enumerate(steps_list)])
        else:
            steps_text = "Proceed with standard closing checksheets."
            
        guidance_data = [
            [Paragraph("<b>Approval Conditions</b>", bold_label_style), Paragraph("<b>Recommended Next Steps</b>", bold_label_style)],
            [Paragraph(cond_text, normal_style), Paragraph(steps_text, normal_style)]
        ]
        guidance_table = Table(guidance_data, colWidths=[3.7*inch, 3.8*inch])
        guidance_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eefaf2')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        guidance_elements.append(guidance_table)
        story.append(KeepTogether(guidance_elements))
        story.append(Spacer(1, 0.2*inch))
        
        # Footer Disclaimer
        footer_text = "<i><b>Disclaimer:</b> This is an AI-generated Credit Appraisal Memo built from submitted materials and secondary intelligence. Manual validation of balance sheets and regulatory records must be performed by a certified credit officer before loan disbursement.</i>"
        story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.darkgrey)))
        
        doc.build(story)
        return file_path
        
    except Exception as e:
        print(f"[ERROR] CAM PDF Generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise
