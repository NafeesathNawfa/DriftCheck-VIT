import re

from .normalizer import BIOMARKER_ALIASES, normalize_name


NUMBER_PATTERN = r"[-+]?\d+(?:\.\d+)?"
RANGE_PATTERN = re.compile(
    rf"({NUMBER_PATTERN})\s*(?:-|\u2013|to)\s*({NUMBER_PATTERN})",
    re.IGNORECASE,
)
STATUS_PATTERN = re.compile(r"\b(low|high|normal|abnormal|critical)\b", re.IGNORECASE)


def extract_lab_values(text: str):

    results = []

    lines = text.splitlines()

    for line in lines:

        line_clean = line.strip()

        if not line_clean:
            continue

        lower_line = line_clean.lower()

        for alias in sorted(BIOMARKER_ALIASES, key=len, reverse=True):

            if re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", lower_line):

                match_start = lower_line.find(alias)
                value_match = re.search(NUMBER_PATTERN, line_clean[match_start + len(alias):])

                if value_match:
                    value = float(value_match.group())
                    value_end = match_start + len(alias) + value_match.end()
                    remainder = line_clean[value_end:]
                    range_match = RANGE_PATTERN.search(remainder)
                    status_match = STATUS_PATTERN.search(line_clean)

                    unit_end = range_match.start() if range_match else len(remainder)
                    unit = remainder[:unit_end].strip(" ,:;()")
                    reference_range = range_match.group(0) if range_match else ""
                    status = status_match.group(1).lower() if status_match else ""

                    # Missing units or ranges remain explicit and lower confidence.
                    confidence = 0.70 if not unit or not reference_range else 0.90

                    results.append({
                        "biomarker": normalize_name(alias),
                        "value": value,
                        "unit": unit,
                        "reference_range": reference_range,
                        "status": status,
                        "confidence": confidence,
                    })

                break

    return results