from fastapi import FastAPI, UploadFile, File, Form

from driftcheck.pdf_extractor import extract_pdf
from driftcheck.extraction_agent import extract_lab_values
from driftcheck.database_service import (
    get_or_create_patient,
    create_report,
    save_lab_result
)


app = FastAPI(
    title="DriftCheck Lab Extraction API"
)


@app.get("/")
def home():
    return {
        "message": "DriftCheck API is running"
    }


@app.post("/upload-report")
async def upload_report(
    patient_token: str = Form(...),
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):
        return {
            "success": False,
            "error": "Only PDF files are allowed"
        }

    file_bytes = await file.read()

    text = extract_pdf(file_bytes)

    if not text:
        return {
            "success": False,
            "error": "Could not extract text from PDF"
        }

    extracted_results = extract_lab_values(text)

    if not extracted_results:
        return {
            "success": False,
            "error": "No laboratory results detected"
        }

    patient = get_or_create_patient(patient_token)

    report = create_report(
        patient_id=patient["id"],
        lab_name="Unknown",
        report_date=None,
        file_name=file.filename
    )

    saved_results = []

    for result in extracted_results:

        saved = save_lab_result(
            report_id=report["id"],
            biomarker=result["biomarker"],
            value=result["value"],
            unit=result["unit"],
            reference_range=result["reference_range"],
            status=result["status"],
            confidence=result["confidence"]
        )

        saved_results.append(saved)

    return {
        "success": True,
        "patient_token": patient_token,
        "report_id": report["id"],
        "results_saved": len(saved_results),
        "results": saved_results
    }