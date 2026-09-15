"""
PII Detection and Minimization Engine.

Identifies and strips direct personal identifiers from raw lab reports/OCR text,
substituting patient references with the opaque internal token (e.g. PAT_7F3A91B2)
before transmission to external AI model APIs.
"""

import re
from typing import Dict, List


# Regex patterns for direct identifiers (restricted to horizontal whitespace [ \t] to avoid newline bleeding)
PATIENT_NAME_PATTERNS = [
    re.compile(r"(?i)\b(?:patient(?:\s+name)?|pt(?:\s+name)?|name)\s*:\s*([A-Za-z,\.\- \t]{2,50})"),
    re.compile(r"(?i)\bpatient\s+record\s+for\s*:\s*([A-Za-z,\.\- \t]{2,50})"),
]

DOB_PATTERNS = [
    re.compile(r"(?i)\b(?:dob|date\s+of\s+birth|birth\s*date)\s*:\s*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})"),
    re.compile(r"(?i)\bage\s*:\s*([0-9]{1,3}(?:\s*(?:years?|yrs?|y\/o))?)"),
]

PATIENT_ID_PATTERNS = [
    re.compile(r"(?i)\b(?:patient\s*id|mrn|medical\s+record\s*(?:no|number|#)|ssn|uhid)\s*:\s*([A-Za-z0-9\-_]{3,25})"),
]

CONTACT_PATTERNS = [
    re.compile(r"(?i)\b(?:phone|tel|mobile|cell)\s*:\s*(\+?[0-9\(\) \t\-\.]{7,20})"),
    re.compile(r"\b(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b"),
    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    re.compile(r"(?i)\b(?:address|residence)\s*:\s*([^\n\r]+)"),
]

PHYSICIAN_PATTERNS = [
    re.compile(r"(?i)\b(?:dr\.|doctor|physician|attending|ordering\s+provider)\s*:\s*([A-Za-z,\.\- \t]{2,40})"),
]


class PIIDetector:
    """
    Scans clinical laboratory text, flags direct PII, and returns sanitized,
    minimized text suitable for AI extraction.
    """

    @classmethod
    def detect_pii(cls, text: str) -> Dict[str, List[str]]:
        """Identify detected PII entities without modifying the original text."""
        findings: Dict[str, List[str]] = {
            "patient_names": [],
            "dobs": [],
            "patient_ids": [],
            "contact_info": [],
            "physicians": [],
        }

        for pattern in PATIENT_NAME_PATTERNS:
            for match in pattern.finditer(text):
                findings["patient_names"].append(match.group(1).strip())

        for pattern in DOB_PATTERNS:
            for match in pattern.finditer(text):
                findings["dobs"].append(match.group(1).strip())

        for pattern in PATIENT_ID_PATTERNS:
            for match in pattern.finditer(text):
                findings["patient_ids"].append(match.group(1).strip())

        for pattern in CONTACT_PATTERNS:
            for match in pattern.finditer(text):
                findings["contact_info"].append(match.group(0).strip())

        for pattern in PHYSICIAN_PATTERNS:
            for match in pattern.finditer(text):
                findings["physicians"].append(match.group(1).strip())

        return findings

    @classmethod
    def sanitize_for_ai(cls, raw_text: str, patient_token: str) -> str:
        """
        Produce a minimized text representation for the AI extraction prompt:
        1. Strips patient names, DOB, contact details, physician notes, and MRNs.
        2. Injects the opaque patient_token.
        3. Preserves test names, numerical values, units, reference ranges, dates, and lab names.
        """
        sanitized_lines: List[str] = []
        token_injected = False

        for raw_line in raw_text.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            # Check if this line is patient name
            matched_patient = any(p.search(line) for p in PATIENT_NAME_PATTERNS)
            if matched_patient:
                if not token_injected:
                    sanitized_lines.append(f"Patient Token: {patient_token}")
                    token_injected = True
                continue

            # Check if this line is DOB, MRN, contact, or physician
            if any(p.search(line) for p in DOB_PATTERNS):
                continue
            if any(p.search(line) for p in PATIENT_ID_PATTERNS):
                continue
            if any(p.search(line) for p in CONTACT_PATTERNS):
                continue
            if any(p.search(line) for p in PHYSICIAN_PATTERNS):
                continue

            sanitized_lines.append(line)

        if not token_injected:
            sanitized_lines.insert(0, f"Patient Token: {patient_token}")

        return "\n".join(sanitized_lines)


def sanitize_lab_text_for_ai(raw_text: str, patient_token: str) -> str:
    """Convenience helper to sanitize raw OCR text for AI inference."""
    return PIIDetector.sanitize_for_ai(raw_text, patient_token)
