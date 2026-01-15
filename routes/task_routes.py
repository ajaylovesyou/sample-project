"""Task-related API routes for the Task Manager."""

from flask import Blueprint, request, jsonify
from models.task_model import TaskStorage
from utils.validators import validate_create_task, validate_update_task


# Create blueprint for task routes
task_bp = Blueprint('tasks', __name__)

# Initialize task storage
task_storage = TaskStorage()


@task_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task.
    
    Expected JSON body:
        {
            "title": "Task title",
            "description": "Task description",
            "due_date": "YYYY-MM-DD",
            "status": "Pending" (optional, defaults to "Pending")
        }
    
    Returns:
        JSON response with created task or error message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate input data
        is_valid, error = validate_create_task(data)
        if not is_valid:
            return jsonify({"error": error}), 400
        
        # Create task
        task = task_storage.create_task(
            title=data["title"],
            description=data["description"],
            due_date=data["due_date"],
            status=data.get("status", "Pending")
        )
        
        return jsonify(task.to_dict()), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route('/tasks', methods=['GET'])
def get_all_tasks():
    """Get all tasks.
    
    Returns:
        JSON response with list of all tasks
    """
    try:
        tasks = task_storage.get_all_tasks()
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task by ID.
    
    Args:
        task_id: Task ID
    
    Returns:
        JSON response with task data or error message
    """
    try:
        task = task_storage.get_task(task_id)
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        return jsonify(task.to_dict()), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task by ID.
    
    Args:
        task_id: Task ID
    
    Expected JSON body (all fields optional):
        {
            "title": "New title",
            "description": "New description",
            "due_date": "YYYY-MM-DD",
            "status": "In Progress"
        }
    
    Returns:
        JSON response with updated task or error message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if task exists
        task = task_storage.get_task(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        # Validate input data
        is_valid, error = validate_update_task(data)
        if not is_valid:
            return jsonify({"error": error}), 400
        
        # Update task
        updated_task = task_storage.update_task(
            task_id=task_id,
            title=data.get("title"),
            description=data.get("description"),
            due_date=data.get("due_date"),
            status=data.get("status")
        )
        
        return jsonify(updated_task.to_dict()), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task by ID.
    
    Args:
        task_id: Task ID
    
    Returns:
        JSON response with success message or error
    """
    try:
        success = task_storage.delete_task(task_id)
        
        if not success:
            return jsonify({"error": "Task not found"}), 404
        
        return jsonify({"message": "Task deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
