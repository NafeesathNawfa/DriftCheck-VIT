"""
Unit tests for DriftCheck Privacy & Security Architecture.
"""

import os
import tempfile
import unittest

from backend.privacy.token_vault import (
    generate_patient_token,
    is_valid_patient_token,
    TokenVault,
)
from backend.privacy.pii_detector import (
    PIIDetector,
    sanitize_lab_text_for_ai,
)
from backend.privacy.audit_logger import (
    AuditLogger,
    SecurityEvent,
)
from backend.privacy.retention import FileRetentionManager
from backend.privacy.differential_privacy import (
    DifferentialPrivacyEngine,
    IndividualDataNoiseForbiddenError,
)


class TestTokenVault(unittest.TestCase):
    def test_token_format_and_entropy(self):
        tokens = {generate_patient_token() for _ in range(100)}
        self.assertEqual(len(tokens), 100, "All generated tokens must be uniquely random.")
        for token in tokens:
            self.assertTrue(is_valid_patient_token(token), f"Invalid token format: {token}")
            self.assertTrue(token.startswith("PAT_"))
            self.assertEqual(len(token), 12)  # PAT_ + 8 hex chars

    def test_vault_isolation(self):
        vault = TokenVault()
        token1 = vault.register_patient("user-uuid-1", "user1@example.com", "Jane Doe")
        token2 = vault.register_patient("user-uuid-2", "user2@example.com", "John Smith")
        self.assertNotEqual(token1, token2)
        self.assertEqual(vault.get_token_for_user("user-uuid-1"), token1)
        self.assertNotIn("Jane", token1)
        self.assertNotIn("user1", token1)


class TestPIIDetector(unittest.TestCase):
    def test_pii_sanitization_for_ai(self):
        raw_text = (
            "Patient Name: Johnathan Doe\n"
            "DOB: 15/04/1985\n"
            "Patient ID: 994821\n"
            "Phone: (555) 234-5678\n"
            "Attending: Dr. Robert Miller\n"
            "Hemoglobin: 13.8 g/dL\n"
            "Ferritin: 24 ng/mL\n"
        )
        token = "PAT_7F3A91B2"
        sanitized = sanitize_lab_text_for_ai(raw_text, token)

        # Confirm token is present
        self.assertIn(f"Patient Token: {token}", sanitized)
        # Confirm PII is removed
        self.assertNotIn("Johnathan Doe", sanitized)
        self.assertNotIn("15/04/1985", sanitized)
        self.assertNotIn("994821", sanitized)
        self.assertNotIn("555", sanitized)
        self.assertNotIn("Robert Miller", sanitized)
        # Confirm biomarkers remain intact
        self.assertIn("Hemoglobin: 13.8 g/dL", sanitized)
        self.assertIn("Ferritin: 24 ng/mL", sanitized)


class TestAuditLogger(unittest.TestCase):
    def test_no_pii_in_audit_logs(self):
        logger = AuditLogger()
        entry = logger.log_event(
            event_type=SecurityEvent.REPORT_UPLOADED,
            actor_token="PAT_7F3A91B2",
            resource_id="rep-1234",
            ip_address="192.168.1.100",
            metadata={
                "file_type": "pdf",
                "patient_name": "Jane Doe",  # Should be stripped
                "value": 14.5,               # Should be stripped
                "page_count": 2,             # Should be preserved
            },
        )

        self.assertEqual(entry["event_type"], "REPORT_UPLOADED")
        self.assertEqual(entry["actor_token"], "PAT_7F3A91B2")
        self.assertNotIn("patient_name", entry["metadata"])
        self.assertNotIn("value", entry["metadata"])
        self.assertEqual(entry["metadata"]["page_count"], 2)
        # IP must be hashed
        self.assertNotEqual(entry["ip_hash"], "192.168.1.100")


class TestFileRetention(unittest.TestCase):
    def test_immediate_file_purge(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            mgr = FileRetentionManager(temp_dir, retention_minutes=0)
            file_path = os.path.join(temp_dir, "test_lab_report.pdf")
            with open(file_path, "wb") as f:
                f.write(b"%PDF-1.4 Mock Lab Content")

            self.assertTrue(os.path.exists(file_path))
            mgr.register_temp_file(file_path)
            mgr.purge_file_immediately(file_path)
            self.assertFalse(os.path.exists(file_path))


class TestDifferentialPrivacy(unittest.TestCase):
    def test_individual_record_noise_forbidden(self):
        dp = DifferentialPrivacyEngine(default_epsilon=1.0)
        with self.assertRaises(IndividualDataNoiseForbiddenError):
            dp.perturb_individual_reading(14.2)

    def test_aggregate_cohort_mean(self):
        dp = DifferentialPrivacyEngine(default_epsilon=1.0)
        # 60 synthetic ferritin measurements
        cohort = [25.0 + (i % 20) for i in range(60)]
        private_mean = dp.compute_private_cohort_mean(
            values=cohort, min_val=5.0, max_val=150.0, min_cohort_size=50
        )
        self.assertGreaterEqual(private_mean, 5.0)
        self.assertLessEqual(private_mean, 150.0)

    def test_small_cohort_rejection(self):
        dp = DifferentialPrivacyEngine()
        cohort = [12.0, 13.0, 14.0]
        with self.assertRaises(ValueError):
            dp.compute_private_cohort_mean(cohort, 5.0, 20.0, min_cohort_size=50)


if __name__ == "__main__":
    unittest.main()
