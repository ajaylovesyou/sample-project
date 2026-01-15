"""Unit tests for the Personal Task Manager API."""

import pytest
import json
from app import create_app
from routes.task_routes import task_storage


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app = create_app()
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        yield client
    
    # Clean up task storage after each test
    task_storage.tasks.clear()
    task_storage.next_id = 1


@pytest.fixture
def sample_task():
    """Sample task data for testing."""
    return {
        "title": "Test Task",
        "description": "This is a test task",
        "due_date": "2026-12-31",
        "status": "Pending"
    }


class TestRootEndpoint:
    """Tests for the root endpoint."""
    
    def test_root_endpoint(self, client):
        """Test that root endpoint returns API information."""
        response = client.get('/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "message" in data
        assert "endpoints" in data


class TestCreateTask:
    """Tests for POST /tasks endpoint."""
    
    def test_create_task_success(self, client, sample_task):
        """Test successful task creation."""
        response = client.post('/tasks', 
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["title"] == sample_task["title"]
        assert data["description"] == sample_task["description"]
        assert data["due_date"] == sample_task["due_date"]
        assert data["status"] == sample_task["status"]
        assert "id" in data
    
    def test_create_task_without_status(self, client):
        """Test task creation with default status."""
        task_data = {
            "title": "Task without status",
            "description": "Test description",
            "due_date": "2026-12-31"
        }
        response = client.post('/tasks',
                              data=json.dumps(task_data),
                              content_type='application/json')
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["status"] == "Pending"
    
    def test_create_task_missing_title(self, client, sample_task):
        """Test task creation with missing title."""
        del sample_task["title"]
        response = client.post('/tasks',
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "title" in data["error"].lower()
    
    def test_create_task_missing_description(self, client, sample_task):
        """Test task creation with missing description."""
        del sample_task["description"]
        response = client.post('/tasks',
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "description" in data["error"].lower()
    
    def test_create_task_missing_due_date(self, client, sample_task):
        """Test task creation with missing due_date."""
        del sample_task["due_date"]
        response = client.post('/tasks',
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "due_date" in data["error"].lower()
    
    def test_create_task_invalid_date_format(self, client, sample_task):
        """Test task creation with invalid date format."""
        sample_task["due_date"] = "31-12-2026"
        response = client.post('/tasks',
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "date" in data["error"].lower()
    
    def test_create_task_invalid_status(self, client, sample_task):
        """Test task creation with invalid status."""
        sample_task["status"] = "Invalid Status"
        response = client.post('/tasks',
                              data=json.dumps(sample_task),
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        assert "status" in data["error"].lower()
    
    def test_create_task_no_data(self, client):
        """Test task creation with no data."""
        response = client.post('/tasks',
                              data=json.dumps({}),
                              content_type='application/json')
        assert response.status_code == 400


class TestGetAllTasks:
    """Tests for GET /tasks endpoint."""
    
    def test_get_all_tasks_empty(self, client):
        """Test getting all tasks when none exist."""
        response = client.get('/tasks')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_get_all_tasks_with_data(self, client, sample_task):
        """Test getting all tasks when tasks exist."""
        # Create two tasks
        client.post('/tasks',
                   data=json.dumps(sample_task),
                   content_type='application/json')
        sample_task["title"] = "Second Task"
        client.post('/tasks',
                   data=json.dumps(sample_task),
                   content_type='application/json')
        
        response = client.get('/tasks')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 2


class TestGetTaskById:
    """Tests for GET /tasks/<id> endpoint."""
    
    def test_get_task_by_id_success(self, client, sample_task):
        """Test getting a task by valid ID."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Get the task
        response = client.get(f'/tasks/{task_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["id"] == task_id
        assert data["title"] == sample_task["title"]
    
    def test_get_task_by_id_not_found(self, client):
        """Test getting a task with invalid ID."""
        response = client.get('/tasks/999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert "error" in data


class TestUpdateTask:
    """Tests for PUT /tasks/<id> endpoint."""
    
    def test_update_task_success(self, client, sample_task):
        """Test successful task update."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Update the task
        update_data = {
            "title": "Updated Task",
            "status": "In Progress"
        }
        response = client.put(f'/tasks/{task_id}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["title"] == "Updated Task"
        assert data["status"] == "In Progress"
        assert data["description"] == sample_task["description"]
    
    def test_update_task_not_found(self, client):
        """Test updating a non-existent task."""
        update_data = {"title": "Updated Task"}
        response = client.put('/tasks/999',
                             data=json.dumps(update_data),
                             content_type='application/json')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert "error" in data
    
    def test_update_task_invalid_status(self, client, sample_task):
        """Test updating task with invalid status."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Try to update with invalid status
        update_data = {"status": "Invalid Status"}
        response = client.put(f'/tasks/{task_id}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
    
    def test_update_task_invalid_date(self, client, sample_task):
        """Test updating task with invalid date format."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Try to update with invalid date
        update_data = {"due_date": "31-12-2026"}
        response = client.put(f'/tasks/{task_id}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
    
    def test_update_task_no_data(self, client, sample_task):
        """Test updating task with no data."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Try to update with no data
        response = client.put(f'/tasks/{task_id}',
                             data=json.dumps({}),
                             content_type='application/json')
        assert response.status_code == 400


class TestDeleteTask:
    """Tests for DELETE /tasks/<id> endpoint."""
    
    def test_delete_task_success(self, client, sample_task):
        """Test successful task deletion."""
        # Create a task
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        task_id = json.loads(create_response.data)["id"]
        
        # Delete the task
        response = client.delete(f'/tasks/{task_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "message" in data
        
        # Verify task is deleted
        get_response = client.get(f'/tasks/{task_id}')
        assert get_response.status_code == 404
    
    def test_delete_task_not_found(self, client):
        """Test deleting a non-existent task."""
        response = client.delete('/tasks/999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert "error" in data


class TestMultipleTasks:
    """Integration tests with multiple tasks."""
    
    def test_create_multiple_tasks_unique_ids(self, client, sample_task):
        """Test that multiple tasks get unique IDs."""
        # Create first task
        response1 = client.post('/tasks',
                               data=json.dumps(sample_task),
                               content_type='application/json')
        task1_id = json.loads(response1.data)["id"]
        
        # Create second task
        sample_task["title"] = "Second Task"
        response2 = client.post('/tasks',
                               data=json.dumps(sample_task),
                               content_type='application/json')
        task2_id = json.loads(response2.data)["id"]
        
        # IDs should be different
        assert task1_id != task2_id
    
    def test_full_crud_workflow(self, client, sample_task):
        """Test complete CRUD workflow."""
        # Create
        create_response = client.post('/tasks',
                                     data=json.dumps(sample_task),
                                     content_type='application/json')
        assert create_response.status_code == 201
        task_id = json.loads(create_response.data)["id"]
        
        # Read (single)
        read_response = client.get(f'/tasks/{task_id}')
        assert read_response.status_code == 200
        
        # Update
        update_data = {"status": "Completed"}
        update_response = client.put(f'/tasks/{task_id}',
                                    data=json.dumps(update_data),
                                    content_type='application/json')
        assert update_response.status_code == 200
        assert json.loads(update_response.data)["status"] == "Completed"
        
        # Read (all)
        all_response = client.get('/tasks')
        assert all_response.status_code == 200
        assert len(json.loads(all_response.data)) == 1
        
        # Delete
        delete_response = client.delete(f'/tasks/{task_id}')
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = client.get(f'/tasks/{task_id}')
        assert verify_response.status_code == 404
