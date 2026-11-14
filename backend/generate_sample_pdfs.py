import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_quotations")
os.makedirs(output_dir, exist_ok=True)

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontSize=16,
    leading=20,
    textColor=colors.HexColor('#0F172A'),
    spaceAfter=6
)
subtitle_style = ParagraphStyle(
    'SubTitle',
    parent=styles['Normal'],
    fontSize=10,
    textColor=colors.HexColor('#475569'),
    spaceAfter=12
)
heading_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontSize=12,
    leading=16,
    textColor=colors.HexColor('#1E293B'),
    spaceBefore=10,
    spaceAfter=6
)
body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontSize=9,
    leading=13,
    textColor=colors.HexColor('#334155')
)
bold_body_style = ParagraphStyle(
    'BoldBody',
    parent=styles['Normal'],
    fontSize=9,
    leading=13,
    fontName='Helvetica-Bold',
    textColor=colors.HexColor('#0F172A')
)

contractors_data = [
    {
        "filename": "Gomes_Dias_Builders_Quotation.pdf",
        "name": "Gomes Dias Builders Pvt. Ltd.",
        "address": "Campal Heritage Complex, Panaji, Goa 403001 | Reg: GOA-BLD-88219",
        "project": "Proposed G+1 Residential Villa for Mr. Siddharth V. Kamat, Porvorim, North Goa",
        "total": "Rs. 56,46,300",
        "timeline": "11 Months from commencement",
        "warranty": "24 months defects liability + 5 years terrace waterproofing leakage guarantee",
        "payment": "20% Advance on signing, 70% Stage-wise progress billing (foundation, plinth, slab 1, slab 2, finishing), 10% on completion",
        "specs": "Fe 550D TMT Reinforcement Steel (Tata Tiscon / JSW Neosteel), UltraTech / ACC OPC 53 Grade Cement, M25 Ready-Mix Concrete for roof slabs, Jaquar sanitary fittings, Asian Paints Royale luxury emulsion, Finolex concealed conduits.",
        "items": [
            ("Earthwork excavation & site clearance in soft/hard rock", "180 cu.m", "Rs. 450", "Rs. 81,000"),
            ("PCC 1:4:8 under footings and plinth beams", "35 cu.m", "Rs. 5,200", "Rs. 1,82,000"),
            ("RCC M25 grade in isolated footings, columns & plinth beams", "65 cu.m", "Rs. 11,500", "Rs. 7,47,500"),
            ("Fe 550D High yield strength ribbed steel reinforcement (Tata Tiscon)", "6.8 MT", "Rs. 74,000", "Rs. 5,03,200"),
            ("Laterite stone masonry in CM 1:6 for external walls (Goan red stone)", "240 sq.m", "Rs. 1,850", "Rs. 4,44,000"),
            ("Internal & external plastering with waterproofing compound", "780 sq.m", "Rs. 420", "Rs. 3,27,600"),
            ("Plumbing, CPVC piping (Astral) & sanitary installation (Jaquar)", "Lump sum", "-", "Rs. 6,85,000"),
            ("Electrical wiring (Finolex/Polycab) with modular switches (Legrand)", "Lump sum", "-", "Rs. 5,90,000"),
            ("Vitrified tile flooring 800x800mm (Kajaria) & teakwood doors", "210 sq.m", "Rs. 2,100", "Rs. 4,41,000"),
            ("Terrace elastomeric waterproofing & 3-coat exterior painting (Asian Paints)", "Lump sum", "-", "Rs. 6,45,000"),
        ]
    },
    {
        "filename": "Vaz_Patil_Constructions_Quotation.pdf",
        "name": "VAZ PATIL CONSTRUCTIONS LLP",
        "address": "Margao Commercial Center, South Goa 403601 | LLPIN: AAA-9182",
        "project": "Proposed G+1 Residential Villa for Mr. Siddharth V. Kamat, Porvorim, North Goa",
        "total": "Rs. 51,72,318",
        "timeline": "9 Months from commencement",
        "warranty": "12 months defects liability for workmanship",
        "payment": "25% Advance booking deposit, 65% Stage-wise milestone billing, 10% on completion handover",
        "specs": "Fe 500D TMT Reinforcement Steel (JSW / Kamdhenu), ACC / Ambuja OPC 43 Grade Cement, M20 Grade site-mixed concrete, Cera sanitaryware, Berger Weathercoat exterior paint, Supreme PVC drainage pipes.",
        "items": [
            ("Site preparation, excavation and backfilling", "175 cu.m", "Rs. 420", "Rs. 73,500"),
            ("PCC 1:4:8 base course foundation", "32 cu.m", "Rs. 4,900", "Rs. 1,56,800"),
            ("RCC M20 framework columns, beams and roof slabs", "62 cu.m", "Rs. 10,800", "Rs. 6,69,600"),
            ("Fe 500D TMT Rebar (JSW Steel)", "6.5 MT", "Rs. 71,000", "Rs. 4,61,500"),
            ("Concrete solid block masonry 150mm thick", "230 sq.m", "Rs. 1,650", "Rs. 3,79,500"),
            ("Cement sand plaster smooth finish", "750 sq.m", "Rs. 380", "Rs. 2,85,000"),
            ("Plumbing, water supply and drainage works (Cera fixtures)", "Lump sum", "-", "Rs. 5,80,000"),
            ("Concealed electrical installation & distribution panel", "Lump sum", "-", "Rs. 5,20,000"),
            ("Ceramic flooring and bathroom wall tiling", "205 sq.m", "Rs. 1,750", "Rs. 3,58,750"),
            ("Waterproofing of wet areas and exterior painting (Berger)", "Lump sum", "-", "Rs. 4,87,668"),
        ]
    },
    {
        "filename": "Konkan_Crest_Constructions_Quotation.pdf",
        "name": "Konkan Crest Constructions",
        "address": "Mapusa Market Road, Bardez, Goa 403507 | Reg: CC/GOA/2019/441",
        "project": "Proposed G+1 Residential Villa for Mr. Siddharth V. Kamat, Porvorim, North Goa",
        "total": "Rs. 54,69,241",
        "timeline": "10 Months (excluding 15 days monsoon window)",
        "warranty": "12 months defects liability",
        "payment": "15% Advance on work order, 75% Stage-wise civil and finishing milestones, 10% on completion",
        "specs": "Fe 550D TMT Reinforcement Steel (Tata Tiscon), UltraTech Super Cement, M25 Concrete Mix with slump test verification, Kohler / Jaquar CP fittings, Dulux Weathershield exterior painting, Astral CPVC pipes.",
        "items": [
            ("Earth excavation & foundation trenches", "180 cu.m", "Rs. 440", "Rs. 79,200"),
            ("Plain Cement Concrete 1:4:8 under footings", "34 cu.m", "Rs. 5,100", "Rs. 1,73,400"),
            ("RCC M25 grade in superstructure columns, beams and slabs", "64 cu.m", "Rs. 11,200", "Rs. 7,16,800"),
            ("Fe 550D Tata Tiscon TMT Bar reinforcement", "6.7 MT", "Rs. 73,500", "Rs. 4,92,450"),
            ("Laterite red block masonry external walls", "235 sq.m", "Rs. 1,800", "Rs. 4,23,000"),
            ("Two coat sand-faced plastering with waterproofer", "760 sq.m", "Rs. 410", "Rs. 3,11,600"),
            ("Internal plumbing & Kohler/Jaquar sanitaryware", "Lump sum", "-", "Rs. 6,40,000"),
            ("Electrical wiring (Polycab) with modular switches", "Lump sum", "-", "Rs. 5,60,000"),
            ("Vitrified tile flooring (Somany) and flush doors", "210 sq.m", "Rs. 1,950", "Rs. 4,09,500"),
            ("Terrace brick-bat coba waterproofing & exterior painting", "Lump sum", "-", "Rs. 5,63,291"),
        ]
    }
]

for c in contractors_data:
    filepath = os.path.join(output_dir, c["filename"])
    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph(c["name"], title_style))
    story.append(Paragraph(c["address"], subtitle_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph(f"<b>Project:</b> {c['project']}", bold_body_style))
    story.append(Paragraph(f"<b>Total Quoted Amount:</b> {c['total']}", bold_body_style))
    story.append(Paragraph(f"<b>Completion Timeline:</b> {c['timeline']}", body_style))
    story.append(Paragraph(f"<b>Warranty Terms:</b> {c['warranty']}", body_style))
    story.append(Paragraph(f"<b>Payment Terms:</b> {c['payment']}", body_style))
    story.append(Paragraph(f"<b>Material Specifications:</b> {c['specs']}", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Detailed Bill of Quantities (BOQ)", heading_style))

    table_data = [["Item Description", "Quantity", "Rate", "Amount"]]
    for desc, qty, rate, amt in c["items"]:
        table_data.append([
            Paragraph(desc, body_style),
            Paragraph(qty, body_style),
            Paragraph(rate, body_style),
            Paragraph(amt, bold_body_style)
        ])

    table = Table(table_data, colWidths=[280, 80, 80, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(table)

    doc.build(story)
    print(f"Generated: {filepath} ({os.path.getsize(filepath)} bytes)")
