"""Task data model for the Task Manager API."""

from datetime import datetime
from typing import Optional


class Task:
    """Represents a task with title, description, due date, and status."""
    
    # Valid status values
    VALID_STATUSES = ["Pending", "In Progress", "Completed"]
    
    def __init__(self, task_id: int, title: str, description: str, 
                 due_date: str, status: str = "Pending"):
        """Initialize a new Task.
        
        Args:
            task_id: Unique identifier for the task
            title: Task title
            description: Task description
            due_date: Due date in ISO format (YYYY-MM-DD)
            status: Task status (default: "Pending")
        """
        self.id = task_id
        self.title = title
        self.description = description
        self.due_date = due_date
        self.status = status
    
    def to_dict(self) -> dict:
        """Convert task to dictionary representation.
        
        Returns:
            Dictionary containing task data
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date,
            "status": self.status
        }
    
    def update(self, title: Optional[str] = None, 
               description: Optional[str] = None,
               due_date: Optional[str] = None, 
               status: Optional[str] = None) -> None:
        """Update task attributes.
        
        Args:
            title: New title (optional)
            description: New description (optional)
            due_date: New due date (optional)
            status: New status (optional)
        """
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if due_date is not None:
            self.due_date = due_date
        if status is not None:
            self.status = status


class TaskStorage:
    """In-memory storage for tasks."""
    
    def __init__(self):
        """Initialize task storage."""
        self.tasks = {}
        self.next_id = 1
    
    def create_task(self, title: str, description: str, 
                   due_date: str, status: str = "Pending") -> Task:
        """Create a new task.
        
        Args:
            title: Task title
            description: Task description
            due_date: Due date in ISO format
            status: Task status (default: "Pending")
            
        Returns:
            Created Task object
        """
        task = Task(self.next_id, title, description, due_date, status)
        self.tasks[self.next_id] = task
        self.next_id += 1
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by ID.
        
        Args:
            task_id: Task ID
            
        Returns:
            Task object or None if not found
        """
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> list:
        """Get all tasks.
        
        Returns:
            List of all tasks
        """
        return list(self.tasks.values())
    
    def update_task(self, task_id: int, title: Optional[str] = None,
                   description: Optional[str] = None,
                   due_date: Optional[str] = None,
                   status: Optional[str] = None) -> Optional[Task]:
        """Update a task.
        
        Args:
            task_id: Task ID
            title: New title (optional)
            description: New description (optional)
            due_date: New due date (optional)
            status: New status (optional)
            
        Returns:
            Updated Task object or None if not found
        """
        task = self.get_task(task_id)
        if task:
            task.update(title, description, due_date, status)
        return task
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task.
        
        Args:
            task_id: Task ID
            
        Returns:
            True if deleted, False if not found
        """
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False
