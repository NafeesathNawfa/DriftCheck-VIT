export const biomarkers = [
  {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    unit: 'g/dL',
    category: 'Anemia & Iron Stores',
    status: 'Ready to track baseline',
    ready: true,
    rangeLabel: 'Normal range: 12.0–15.5 g/dL',
    range: { min: 12.0, max: 15.5 },
    step: 0.1,
  },
  {
    id: 'tsh',
    name: 'TSH',
    unit: 'mIU/L',
    category: 'Thyroid Function',
    status: 'Awaiting first reading',
    ready: false,
    rangeLabel: 'Normal range: 0.4–4.0 mIU/L',
    range: { min: 0.4, max: 4.0 },
    step: 0.1,
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    unit: '%',
    category: 'Diabetes & Glycemia',
    status: 'Awaiting first reading',
    ready: false,
    rangeLabel: 'Normal range: 4.0–5.6%',
    range: { min: 4.0, max: 5.6 },
    step: 0.1,
  },
  {
    id: 'creatinine',
    name: 'Creatinine',
    unit: 'mg/dL',
    category: 'Kidney Filtration',
    status: 'Awaiting first reading',
    ready: false,
    rangeLabel: 'Normal range: 0.6–1.3 mg/dL',
    range: { min: 0.6, max: 1.3 },
    step: 0.05,
  },
]

export function getBiomarker(id) {
  return biomarkers.find((b) => b.id === id)
}