"""
Differential Privacy Engine (Aggregate Analytics Layer).

CRITICAL ARCHITECTURAL RULE:
Do NOT add differential-privacy noise to an individual patient's stored laboratory results.
The actual values are required for accurate longitudinal trend analysis.
Instead, reserve differential privacy for aggregate population queries and research dashboards.
"""

import math
import random
from typing import List, Optional, Union


class IndividualDataNoiseForbiddenError(ValueError):
    """Raised if an attempt is made to perturb individual patient lab readings with DP noise."""
    pass


class DifferentialPrivacyEngine:
    """
    Applies mathematical differential privacy (e.g. Laplace mechanism)
    STRICTLY to aggregate cohort queries (means, counts, histograms).
    """

    def __init__(self, default_epsilon: float = 1.0):
        """
        :param default_epsilon: Privacy budget parameter (lower epsilon = stronger privacy, more noise).
        """
        if default_epsilon <= 0:
            raise ValueError("Epsilon must be strictly positive.")
        self.default_epsilon = default_epsilon

    def add_laplace_noise(self, value: float, sensitivity: float, epsilon: Optional[float] = None) -> float:
        """
        Standard Laplace mechanism:
        Draws noise from Laplace(0, scale = sensitivity / epsilon).
        """
        eps = epsilon if epsilon is not None else self.default_epsilon
        if eps <= 0:
            raise ValueError("Epsilon must be positive.")
        if sensitivity <= 0:
            raise ValueError("Sensitivity must be positive.")

        scale = sensitivity / eps
        # Sample Laplace noise: L(0, b) = b * sign(u) * ln(1 - 2*|u|) where u in (-0.5, 0.5)
        u = random.random() - 0.5
        noise = -scale * math.copysign(1.0, u) * math.log(1.0 - 2.0 * abs(u) + 1e-15)
        return value + noise

    def compute_private_cohort_mean(
        self,
        values: List[float],
        min_val: float,
        max_val: float,
        epsilon: Optional[float] = None,
        min_cohort_size: int = 50,
    ) -> float:
        """
        Compute differentially private mean for a population cohort.
        Requires a minimum cohort size to prevent small-cell re-identification.
        """
        n = len(values)
        if n < min_cohort_size:
            raise ValueError(
                f"Cohort size ({n}) is below safe privacy threshold ({min_cohort_size}). "
                "Differential privacy release refused to prevent singling-out."
            )

        # Clip values to bounded range [min_val, max_val]
        clipped = [min(max(v, min_val), max_val) for v in values]
        exact_sum = sum(clipped)

        # Global sensitivity for sum is (max_val - min_val)
        sensitivity_sum = max_val - min_val
        eps = epsilon if epsilon is not None else self.default_epsilon

        # Allocate 80% budget to sum, 20% to count
        eps_sum = 0.8 * eps
        eps_count = 0.2 * eps

        noisy_sum = self.add_laplace_noise(exact_sum, sensitivity=sensitivity_sum, epsilon=eps_sum)
        noisy_count = max(1.0, self.add_laplace_noise(float(n), sensitivity=1.0, epsilon=eps_count))

        private_mean = noisy_sum / noisy_count
        # Clamp result within valid physical range
        return max(min_val, min(max_val, private_mean))

    def perturb_individual_reading(self, reading_value: float) -> None:
        """
        Guardrail method:
        Strictly forbids injecting DP noise into individual patient readings.
        """
        raise IndividualDataNoiseForbiddenError(
            "DEFENSE-IN-DEPTH VIOLATION: Differential privacy noise must NEVER be applied to "
            "an individual patient's stored laboratory records. Clinical longitudinal tracking "
            "requires exact, unperturbed measurements. Differential privacy is reserved strictly "
            "for aggregate population queries."
        )
