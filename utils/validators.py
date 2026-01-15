"""Input validation utilities for the Task Manager API."""

from datetime import datetime
from typing import Tuple, Optional


def validate_date(date_string: str) -> Tuple[bool, Optional[str]]:
    """Validate that a date string is in ISO format (YYYY-MM-DD).
    
    Args:
        date_string: Date string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True, None
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"


def validate_status(status: str) -> Tuple[bool, Optional[str]]:
    """Validate that a status is one of the allowed values.
    
    Args:
        status: Status string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_statuses = ["Pending", "In Progress", "Completed"]
    if status not in valid_statuses:
        return False, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
    return True, None


def validate_task_data(data: dict, required_fields: list) -> Tuple[bool, Optional[str]]:
    """Validate that required fields are present in task data.
    
    Args:
        data: Dictionary containing task data
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, None


def validate_create_task(data: dict) -> Tuple[bool, Optional[str]]:
    """Validate data for creating a new task.
    
    Args:
        data: Dictionary containing task data
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check required fields
    required_fields = ["title", "description", "due_date"]
    is_valid, error = validate_task_data(data, required_fields)
    if not is_valid:
        return is_valid, error
    
    # Validate due_date format
    is_valid, error = validate_date(data["due_date"])
    if not is_valid:
        return is_valid, error
    
    # Validate status if provided
    if "status" in data:
        is_valid, error = validate_status(data["status"])
        if not is_valid:
            return is_valid, error
    
    return True, None


def validate_update_task(data: dict) -> Tuple[bool, Optional[str]]:
    """Validate data for updating a task.
    
    Args:
        data: Dictionary containing task data
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # At least one field should be provided
    if not data:
        return False, "No fields provided for update"
    
    # Validate due_date format if provided
    if "due_date" in data:
        is_valid, error = validate_date(data["due_date"])
        if not is_valid:
            return is_valid, error
    
    # Validate status if provided
    if "status" in data:
        is_valid, error = validate_status(data["status"])
        if not is_valid:
            return is_valid, error
    
    return True, None
