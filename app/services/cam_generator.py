from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime

def generate_cam(company, financials, ratios, risk):
    """Generate a Credit Appraisal Memo (CAM) as PDF"""
    try:
        file_path = f"uploads/{company.replace(' ', '_')}_CAM.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        story = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1  # Center
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("Credit Appraisal Memo (CAM)", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Date and Company
        story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y')}", styles['Normal']))
        story.append(Paragraph(f"<b>Company:</b> {company}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Financial Summary Section
        story.append(Paragraph("Financial Summary", heading_style))
        fin_data = [['Metric', 'Value (₹)']]
        for key, value in financials.items():
            metric_name = key.replace("_", " ").title()
            if isinstance(value, (int, float)):
                fin_data.append([metric_name, f"{value:,.0f}"])
            else:
                fin_data.append([metric_name, str(value)])
        
        fin_table = Table(fin_data, colWidths=[3*inch, 2*inch])
        fin_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ecf0f1')]),
        ]))
        story.append(fin_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Financial Ratios Section
        story.append(Paragraph("Financial Ratios", heading_style))
        ratio_data = [['Ratio', 'Value']]
        for key, value in ratios.items():
            ratio_name = key.replace("_", " ").title()
            ratio_data.append([ratio_name, f"{float(value):.4f}"])
        
        ratio_table = Table(ratio_data, colWidths=[3*inch, 2*inch])
        ratio_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ecc71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ecf0f1')]),
        ]))
        story.append(ratio_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Risk Assessment Section
        story.append(Paragraph("Risk Assessment", heading_style))
        risk_color = {
            "Low Risk": colors.HexColor('#27ae60'),
            "Medium Risk": colors.HexColor('#f39c12'),
            "High Risk": colors.HexColor('#e74c3c')
        }
        
        risk_bg = risk_color.get(risk['risk_level'], colors.gray)
        
        risk_data = [
            ['Metric', 'Value'],
            ['Risk Score', f"{risk['score']}/100"],
            ['Risk Level', risk['risk_level']]
        ]
        
        risk_table = Table(risk_data, colWidths=[3*inch, 2*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), risk_bg),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ecf0f1')]),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Recommendation
        story.append(Paragraph("Recommendation", heading_style))
        if risk['risk_level'] == "Low Risk":
            recommendation = "✓ <b>Recommended for approval</b> - Company demonstrates strong financial health and low risk profile."
            rec_color = colors.HexColor('#27ae60')
        elif risk['risk_level'] == "Medium Risk":
            recommendation = "⚠ <b>Conditional Approval Recommended</b> - Further detailed review required before final decision."
            rec_color = colors.HexColor('#f39c12')
        else:
            recommendation = "✗ <b>Not Recommended</b> - High risk profile. Recommend declining at this time."
            rec_color = colors.HexColor('#e74c3c')
        
        story.append(Paragraph(recommendation, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Footer
        story.append(Paragraph("---", styles['Normal']))
        footer_text = "<i>This is an AI-generated Credit Appraisal Memo. Manual verification and official review are recommended before final lending decision.</i>"
        story.append(Paragraph(footer_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        return file_path
        
    except Exception as e:
        print(f"[ERROR] CAM PDF Generation failed: {e}")
        raise
