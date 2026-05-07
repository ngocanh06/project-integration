"""Salary Discrepancy Alert Service"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from .alert_generator import AlertGenerator


class SalaryDiscrepancyAlert:
    """Generate alerts for salary-related discrepancies"""

    @staticmethod
    def check_salary_discrepancy(
        employee_name: str,
        employee_email: str,
        expected_salary: float,
        actual_salary: float,
        discrepancy_percentage: float = 2.0
    ) -> Optional[Dict[str, Any]]:
        """
        Check if there's a salary discrepancy and generate alert if needed
        
        Args:
            employee_name: Name of the employee
            employee_email: Email of the employee
            expected_salary: Expected salary amount
            actual_salary: Actual salary amount paid
            discrepancy_percentage: Threshold percentage for alert (default 2%)
        
        Returns:
            Alert dict if discrepancy found, None otherwise
        """
        if expected_salary == 0:
            return None
        
        discrepancy = abs(actual_salary - expected_salary)
        percentage_diff = (discrepancy / expected_salary) * 100
        
        if percentage_diff >= discrepancy_percentage:
            return AlertGenerator.create_alert(
                alert_type="salary_discrepancy",
                title="Salary Discrepancy Alert",
                message=f"Salary discrepancy detected for {employee_name} ({employee_email}). "
                       f"Expected: ${expected_salary:.2f}, Actual: ${actual_salary:.2f} (Diff: {percentage_diff:.2f}%)",
                severity="critical" if percentage_diff > 5 else "warning",
                related_user_id=None,
                metadata={
                    "employee_name": employee_name,
                    "employee_email": employee_email,
                    "expected_salary": expected_salary,
                    "actual_salary": actual_salary,
                    "discrepancy_percentage": round(percentage_diff, 2)
                }
            )
        
        return None

    @staticmethod
    def check_delayed_payment(
        employee_name: str,
        employee_email: str,
        payment_due_date: datetime,
        days_overdue: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        Check if salary payment is delayed and generate alert
        
        Args:
            employee_name: Name of the employee
            employee_email: Email of the employee
            payment_due_date: When payment was due
            days_overdue: Number of days payment is overdue
        
        Returns:
            Alert dict if payment is late, None otherwise
        """
        if days_overdue <= 0:
            return None
        
        severity = "critical" if days_overdue > 7 else "warning"
        
        return AlertGenerator.create_alert(
            alert_type="delayed_payment",
            title="Delayed Salary Payment Alert",
            message=f"Salary payment for {employee_name} ({employee_email}) is overdue by {days_overdue} days. "
                   f"Due date: {payment_due_date.strftime('%Y-%m-%d')}",
            severity=severity,
            related_user_id=None,
            metadata={
                "employee_name": employee_name,
                "employee_email": employee_email,
                "payment_due_date": payment_due_date.isoformat(),
                "days_overdue": days_overdue
            }
        )

    @staticmethod
    def check_duplicate_payment(
        employee_name: str,
        employee_email: str,
        payment_amount: float,
        payment_date: datetime
    ) -> Dict[str, Any]:
        """
        Generate alert for potential duplicate payment
        
        Args:
            employee_name: Name of the employee
            employee_email: Email of the employee
            payment_amount: Amount of payment
            payment_date: Date of payment
        
        Returns:
            Alert dict for duplicate payment detection
        """
        return AlertGenerator.create_alert(
            alert_type="duplicate_payment",
            title="Potential Duplicate Payment Detected",
            message=f"Potential duplicate payment detected for {employee_name} ({employee_email}). "
                   f"Amount: ${payment_amount:.2f} on {payment_date.strftime('%Y-%m-%d')}. "
                   f"Please verify and take action if needed.",
            severity="critical",
            related_user_id=None,
            metadata={
                "employee_name": employee_name,
                "employee_email": employee_email,
                "payment_amount": payment_amount,
                "payment_date": payment_date.isoformat()
            }
        )

    @staticmethod
    def check_unusual_payment_pattern(
        employee_name: str,
        employee_email: str,
        pattern_description: str,
        average_salary: float,
        current_salary: float
    ) -> Dict[str, Any]:
        """
        Generate alert for unusual salary payment patterns
        
        Args:
            employee_name: Name of the employee
            employee_email: Email of the employee
            pattern_description: Description of the unusual pattern
            average_salary: Average historical salary
            current_salary: Current salary payment
        
        Returns:
            Alert dict for unusual payment pattern
        """
        return AlertGenerator.create_alert(
            alert_type="unusual_payment_pattern",
            title="Unusual Salary Payment Pattern",
            message=f"Unusual payment pattern detected for {employee_name} ({employee_email}). "
                   f"Pattern: {pattern_description}. "
                   f"Average: ${average_salary:.2f}, Current: ${current_salary:.2f}",
            severity="warning",
            related_user_id=None,
            metadata={
                "employee_name": employee_name,
                "employee_email": employee_email,
                "pattern_description": pattern_description,
                "average_salary": average_salary,
                "current_salary": current_salary
            }
        )

    @staticmethod
    def check_bulk_salary_adjustment(
        affected_employees_count: int,
        adjustment_type: str,
        adjustment_percentage: float
    ) -> Dict[str, Any]:
        """
        Generate alert for bulk salary adjustments
        
        Args:
            affected_employees_count: Number of employees affected
            adjustment_type: Type of adjustment (e.g., 'raise', 'cut', 'correction')
            adjustment_percentage: Percentage of adjustment
        
        Returns:
            Alert dict for bulk adjustment
        """
        return AlertGenerator.create_alert(
            alert_type="bulk_salary_adjustment",
            title="Bulk Salary Adjustment Detected",
            message=f"Bulk salary {adjustment_type} applied to {affected_employees_count} employees. "
                   f"Adjustment: {adjustment_percentage:+.2f}%. Please verify this operation.",
            severity="warning",
            related_user_id=None,
            metadata={
                "affected_employees_count": affected_employees_count,
                "adjustment_type": adjustment_type,
                "adjustment_percentage": adjustment_percentage
            }
        )
