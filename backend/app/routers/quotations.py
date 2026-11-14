import os
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.quotation import ComparisonResponse, ExtractedQuotation
from app.services.quotation_analyzer import (
    extract_text_from_pdf,
    parse_quotation_text,
    evaluate_and_rank_quotations,
    get_default_goa_benchmark_quotes
)

router = APIRouter(prefix="/quotations", tags=["AI Quotation Comparison"])

@router.get("/benchmark", response_model=ComparisonResponse)
def get_benchmark_comparison():
    """
    Returns the exact evaluation matrix from AI_Quotation_Comparison_Recovered.ipynb
    for the 3 benchmark Goan contractors: Gomes Dias, Vaz Patil, and Konkan Crest.
    """
    quotes = get_default_goa_benchmark_quotes()
    return evaluate_and_rank_quotations(quotes)

@router.post("/compare", response_model=ComparisonResponse)
def compare_custom_quotations(quotes: List[ExtractedQuotation]):
    """
    Accepts custom structured contractor quotations and calculates the
    7-criteria MCDA evaluation matrix and leaderboard.
    """
    if len(quotes) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 2 contractor quotations for comparison."
        )

    dict_quotes = [q.dict() for q in quotes]
    return evaluate_and_rank_quotations(dict_quotes)

@router.post("/upload-pdfs", response_model=ComparisonResponse)
async def upload_and_compare_pdfs(files: List[UploadFile] = File(...)):
    """
    Accepts multiple uploaded PDF quotation documents (e.g. 2 to 5 files),
    extracts text from each using pypdf, uses Gemini AI to understand & analyze
    material specifications, warranty, timelines and prices, and calculates the
    7-criteria MCDA ranking matrix from the notebook.
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least 2 PDF quotation files to run side-by-side comparison."
        )

    file_payloads = []
    for file in files:
        if file.filename.lower().endswith(".pdf"):
            content = await file.read()
            file_payloads.append((file.filename, content))

    if len(file_payloads) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least 2 valid PDF documents (.pdf)."
        )

    def process_single_pdf(item):
        fname, content = item
        try:
            text = extract_text_from_pdf(content)
            return parse_quotation_text(fname, text)
        except Exception as e:
            print(f"Error processing {fname}: {e}")
            return None

    # Run PDF processing concurrently for speed
    with ThreadPoolExecutor(max_workers=min(5, len(file_payloads))) as executor:
        extracted_quotes = list(executor.map(process_single_pdf, file_payloads))

    valid_quotes = [q for q in extracted_quotes if q and q.get("contractor")]

    if len(valid_quotes) < 2:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient quotation data from the uploaded files. Please ensure the PDFs contain readable contractor text."
        )

    return evaluate_and_rank_quotations(valid_quotes)
