from .database import supabase


def get_or_create_patient(patient_token: str):

    response = (
        supabase
        .table("patients")
        .select("*")
        .eq("patient_token", patient_token)
        .execute()
    )

    if response.data:
        return response.data[0]

    response = (
        supabase
        .table("patients")
        .insert({
            "patient_token": patient_token
        })
        .execute()
    )

    return response.data[0]


def create_report(
    patient_id: str,
    lab_name: str,
    report_date: str,
    file_name: str
):

    response = (
        supabase
        .table("reports")
        .insert({
            "patient_id": patient_id,
            "lab_name": lab_name,
            "report_date": report_date,
            "file_name": file_name
        })
        .execute()
    )

    return response.data[0]


def save_lab_result(
    report_id: str,
    biomarker: str,
    value: float,
    unit: str,
    reference_range: str,
    status: str,
    confidence: float
):

    needs_review = confidence < 0.80

    response = (
        supabase
        .table("lab_results")
        .insert({
            "report_id": report_id,
            "biomarker": biomarker,
            "value": value,
            "unit": unit,
            "reference_range": reference_range,
            "status": status,
            "confidence": confidence,
            "needs_review": needs_review
        })
        .execute()
    )

    return response.data[0]