import pdfplumber
import os

pdf_files = [
    'frontend\\public\\sample-pdfs\\01_annual_report_Infosys.pdf',
    'frontend\\public\\sample-pdfs\\02_borrowing_Infosys.pdf',
]

for pdf_file in pdf_files:
    full_path = f"c:\\Saravanakumar G\\Projects\\Intelli-Credit\\{pdf_file}"
    
    print(f"\n{'='*70}")
    print(f"Testing PDF: {pdf_file}")
    print(f"Full Path: {full_path}")
    print(f"File Exists: {os.path.exists(full_path)}")
    print(f"{'='*70}")
    
    if not os.path.exists(full_path):
        print("❌ FILE NOT FOUND!")
        continue
    
    try:
        with pdfplumber.open(full_path) as pdf:
            text = ""
            print(f"Number of pages: {len(pdf.pages)}")
            
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                    print(f"\n--- PAGE {page_num+1} ---")
                    print(page_text[:500])
                    print(f"... (page text length: {len(page_text)})")
            
            print(f"\n[TOTAL TEXT LENGTH: {len(text)} chars]")
            
            # Try to find financial numbers
            if "2500000" in text:
                print("✓ FOUND: Revenue number (2500000)")
            else:
                print("✗ NOT FOUND: Revenue number")
                
            if "216000" in text:
                print("✓ FOUND: Net Profit number (216000)")
            else:
                print("✗ NOT FOUND: Net Profit number")
                
            if "2000000" in text:
                print("✓ FOUND: Total Assets number (2000000)")
            else:
                print("✗ NOT FOUND: Total Assets number")
                
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
