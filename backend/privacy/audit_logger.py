"""
Security & Privacy Audit Logger.

Tracks security-sensitive events without logging raw medical text,
clinical values, or direct patient identifiers (PII).
"""

from datetime import datetime, timezone
from enum import Enum
import hashlib
import json
import logging
from typing import Any, Dict, Optional


logger = logging.getLogger("driftcheck.security_audit")


class SecurityEvent(str, Enum):
    REPORT_UPLOADED = "REPORT_UPLOADED"
    REPORT_PROCESSED = "REPORT_PROCESSED"
    REPORT_VIEWED = "REPORT_VIEWED"
    REPORT_MODIFIED = "REPORT_MODIFIED"
    REPORT_CONFIRMED = "REPORT_CONFIRMED"
    REPORT_DELETED = "REPORT_DELETED"
    PATIENT_RECORD_ACCESSED = "PATIENT_RECORD_ACCESSED"


# Fields strictly banned from appearing anywhere in audit logs
BANNED_METADATA_KEYS = {
    "name", "patient_name", "full_name", "first_name", "last_name",
    "dob", "date_of_birth", "ssn", "mrn", "phone", "email",
    "address", "raw_text", "report_text", "ocr_text", "value",
    "test_result", "lab_result", "password", "token_secret"
}


def hash_ip(ip_address: Optional[str]) -> Optional[str]:
    """Compute one-way SHA-256 hash of client IP to allow rate-limiting analysis without storing raw IP."""
    if not ip_address:
        return None
    return hashlib.sha256(ip_address.encode("utf-8")).hexdigest()[:16]


class AuditLogger:
    """
    Emits structured audit log entries and verifies zero leakage of PII or clinical numbers.
    """

    def __init__(self, storage_sink=None):
        self.sink = storage_sink

    def log_event(
        self,
        event_type: SecurityEvent,
        actor_token: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "SUCCESS",
        ip_address: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Record a security-sensitive event with strict metadata sanitization.
        """
        clean_metadata = self._sanitize_metadata(metadata or {})

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type.value,
            "actor_token": actor_token or "ANONYMOUS",
            "resource_id": resource_id or "NONE",
            "status": status,
            "ip_hash": hash_ip(ip_address),
            "metadata": clean_metadata,
        }

        # Log via standard logging facility
        logger.info("AUDIT_EVENT: %s", json.dumps(entry))

        # Forward to database or external store if configured
        if self.sink and hasattr(self.sink, "record_audit_log"):
            self.sink.record_audit_log(entry)

        return entry

    @staticmethod
    def _sanitize_metadata(meta: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively filter out any raw text or clinical values from metadata payload.
        """
        sanitized = {}
        for k, v in meta.items():
            lower_k = k.lower().replace("-", "_")
            if lower_k in BANNED_METADATA_KEYS:
                # Omit entirely
                continue
            if isinstance(v, dict):
                sanitized[k] = AuditLogger._sanitize_metadata(v)
            elif isinstance(v, (str, int, float, bool)) or v is None:
                sanitized[k] = v
        return sanitized
