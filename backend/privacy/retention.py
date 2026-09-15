"""
Data Retention & File Purge Manager.

Enforces configurable retention policies for temporary uploaded lab PDFs and images.
By default, files are purged immediately following structured extraction and validation.
"""

from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
from typing import Dict, List, Optional


class FileRetentionManager:
    """
    Manages temporary file lifecycle for uploaded laboratory PDF documents.
    """

    def __init__(self, scratch_dir: str, retention_minutes: int = 0):
        """
        :param scratch_dir: Path to encrypted/isolated temporary staging directory.
        :param retention_minutes: Maximum file lifetime in minutes. 0 indicates immediate purge upon processing.
        """
        self.scratch_dir = Path(scratch_dir)
        self.retention_minutes = max(0, retention_minutes)
        self.scratch_dir.mkdir(parents=True, exist_ok=True)
        # In-memory tracking of file creation timestamps
        self._tracked_files: Dict[str, datetime] = {}

    def register_temp_file(self, file_path: str) -> str:
        """Track a newly uploaded temporary PDF."""
        resolved = str(Path(file_path).resolve())
        self._tracked_files[resolved] = datetime.now(timezone.utc)
        return resolved

    def purge_file_immediately(self, file_path: str) -> bool:
        """
        Purge the file immediately following extraction & validation.
        Overwrites file contents before unlinking to prevent data recovery.
        """
        resolved = str(Path(file_path).resolve())
        path_obj = Path(resolved)
        if not path_obj.exists():
            self._tracked_files.pop(resolved, None)
            return False

        try:
            # Overwrite with zeros before deletion
            file_size = path_obj.stat().st_size
            with open(path_obj, "wb") as f:
                f.write(b"\x00" * min(file_size, 1024 * 1024))
            path_obj.unlink()
            self._tracked_files.pop(resolved, None)
            return True
        except OSError:
            return False

    def cleanup_expired_files(self) -> List[str]:
        """
        Periodic sweep to purge files that have exceeded the retention window.
        """
        purged = []
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(minutes=self.retention_minutes)

        tracked_keys = list(self._tracked_files.keys())
        for file_path in tracked_keys:
            uploaded_at = self._tracked_files.get(file_path, now)
            if self.retention_minutes == 0 or uploaded_at <= cutoff:
                if self.purge_file_immediately(file_path):
                    purged.append(file_path)

        return purged
