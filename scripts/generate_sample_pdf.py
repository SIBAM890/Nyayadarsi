"""
Convert sample tender text to PDF for testing.
"""
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os

def create_pdf():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    text_path = os.path.join(base_dir, 'demo', 'sample_tender_text.txt')
    pdf_path = os.path.join(base_dir, 'demo', 'sample_tender.pdf')

    if not os.path.exists(text_path):
        print(f"Error: {text_path} not found.")
        return

    with open(text_path, 'r', encoding='utf-8') as f:
        text = f.read()

    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']
    normal_style.fontName = 'Helvetica'
    normal_style.fontSize = 10
    normal_style.leading = 14

    story = []
    
    # Split by double newline to create paragraphs
    paragraphs = text.split('\n\n')
    
    for p in paragraphs:
        # replace single newlines with br tag for reportlab
        p = p.replace('\n', '<br/>')
        story.append(Paragraph(p, normal_style))
        story.append(Spacer(1, 12))

    doc.build(story)
    print(f"✅ Successfully created {pdf_path}")

if __name__ == '__main__':
    create_pdf()
