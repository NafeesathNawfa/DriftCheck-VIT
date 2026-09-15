"""
Patient Tokenization & Vault Service.

Provides cryptographic generation of non-guessable patient tokens (e.g. PAT_7F3A91B2)
and maintains isolated identity-to-token mappings.
"""

import re
import secrets
from typing import Dict, Optional


PATIENT_TOKEN_REGEX = re.compile(r"^PAT_[0-9A-F]{8}$")


def generate_patient_token() -> str:
    """
    Generate an opaque, cryptographically random patient token.
    Uses CSPRNG (secrets module) to ensure 32 bits of entropy.
    Never derived from guessable attributes (DOB, name, email).
    Format: PAT_<8-HEX-DIGITS> (e.g. PAT_7F3A91B2)
    """
    random_hex = secrets.token_hex(4).upper()
    return f"PAT_{random_hex}"


def is_valid_patient_token(token: str) -> bool:
    """Verify that a string matches the required patient token specification."""
    if not token or not isinstance(token, str):
        return False
    return bool(PATIENT_TOKEN_REGEX.match(token))


class TokenVault:
    """
    Protected in-memory or database token vault.
    Enforces unidirectional separation between patient personal identity
    (auth_user_id, email, legal name) and the tokenized laboratory dataset.
    """

    def __init__(self):
        # Maps auth_user_id -> patient_token
        self._user_to_token: Dict[str, str] = {}
        # Maps patient_token -> identity metadata (strictly protected)
        self._token_to_identity: Dict[str, Dict[str, str]] = {}

    def register_patient(self, auth_user_id: str, email: str, name: Optional[str] = None) -> str:
        """
        Register a new patient and issue an opaque token.
        Guarantees that the token has NO algorithmic correlation with name, DOB, or email.
        """
        if not auth_user_id:
            raise ValueError("auth_user_id is required.")

        if auth_user_id in self._user_to_token:
            return self._user_to_token[auth_user_id]

        token = generate_patient_token()
        # Avoid collisions
        while token in self._token_to_identity:
            token = generate_patient_token()

        self._user_to_token[auth_user_id] = token
        self._token_to_identity[token] = {
            "auth_user_id": auth_user_id,
            "email": email.strip().lower() if email else "",
            "name": name.strip() if name else "",
        }
        return token

    def get_token_for_user(self, auth_user_id: str) -> Optional[str]:
        """Retrieve patient_token for an authenticated user session."""
        return self._user_to_token.get(auth_user_id)

    def get_identity_for_token(self, token: str) -> Optional[Dict[str, str]]:
        """
        Lookup patient identity given a token.
        RESTRICTED: This method must only be callable by authorized backend services,
        never exposed via public client API endpoints.
        """
        return self._token_to_identity.get(token)
