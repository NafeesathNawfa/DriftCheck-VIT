BIOMARKER_ALIASES = {
    "hgb": "hemoglobin",
    "hb": "hemoglobin",
    "haemoglobin": "hemoglobin",
    "hemoglobin": "hemoglobin",
    "rbc": "rbc",
    "mcv": "mcv",
    "mch": "mch",
    "mchc": "mchc",
    "ferritin": "ferritin",
    "vitamin b12": "vitamin_b12",
    "b12": "vitamin_b12",
    "folate": "folate",
    "tsh": "tsh",
    "free t4": "free_t4",
    "free t3": "free_t3",
    "glucose": "glucose",
    "hba1c": "hba1c",
    "a1c": "hba1c",
    "creatinine": "creatinine",
    "bun": "bun",
    "egfr": "egfr",
}


def normalize_name(name: str) -> str:
    return BIOMARKER_ALIASES.get(name.lower().strip(), name.lower().strip())
