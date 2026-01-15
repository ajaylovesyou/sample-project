# Personal Task Manager API

A RESTful API built with Python and Flask for managing personal tasks. This API allows users to create, read, update, and delete tasks with full CRUD functionality.

## Features

- **Create tasks**: Add tasks with title, description, due date, and status
- **Read tasks**: View all tasks or fetch a specific task by ID
- **Update tasks**: Modify existing task attributes
- **Delete tasks**: Remove tasks by ID
- **Input validation**: Proper error handling for invalid requests
- **In-memory storage**: Simple dictionary-based storage (easily extensible to database)

## Task Attributes

Each task has the following attributes:
- **id** (integer): Auto-generated unique identifier
- **title** (string): Task title
- **description** (string): Detailed task description
- **due_date** (string): Due date in ISO format (YYYY-MM-DD)
- **status** (string): Task status - one of:
  - "Pending" (default)
  - "In Progress"
  - "Completed"

## Project Structure

```
/project-root
|-- app.py              # Main Flask application entry point
|-- requirements.txt    # Python dependencies
|-- test_app.py         # Unit tests with pytest
|-- .gitignore          # Git ignore file
|-- /routes             # API route handlers
    |-- task_routes.py  # Task CRUD endpoints
|-- /models             # Data models
    |-- task_model.py   # Task and TaskStorage classes
|-- /utils              # Utility functions
    |-- validators.py   # Input validation functions
```

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajaylovesyou/sample-project.git
cd sample-project
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

Start the Flask development server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

**Note:** Debug mode is disabled by default for security. To enable it for development, set the environment variable:
```bash
# Linux/Mac
export FLASK_DEBUG=True
python app.py

# Windows
set FLASK_DEBUG=True
python app.py
```

### Running Tests

Run all tests with pytest:
```bash
pytest test_app.py -v
```

Run tests with coverage:
```bash
pytest test_app.py --cov=. --cov-report=html
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Get API Information
```
GET /
```

**Response:**
```json
{
  "message": "Personal Task Manager API",
  "version": "1.0.0",
  "endpoints": {
    "POST /tasks": "Create a new task",
    "GET /tasks": "Get all tasks",
    "GET /tasks/<id>": "Get task by ID",
    "PUT /tasks/<id>": "Update task by ID",
    "DELETE /tasks/<id>": "Delete task by ID"
  }
}
```

#### 2. Create a Task
```
POST /tasks
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "due_date": "2026-12-31",
  "status": "Pending"
}
```

Note: `status` is optional and defaults to "Pending"

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "due_date": "2026-12-31",
  "status": "Pending"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `500 Internal Server Error`: Server error

#### 3. Get All Tasks
```
GET /tasks
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "due_date": "2026-12-31",
    "status": "Pending"
  },
  {
    "id": 2,
    "title": "Review code",
    "description": "Review pull requests",
    "due_date": "2026-11-30",
    "status": "In Progress"
  }
]
```

#### 4. Get Task by ID
```
GET /tasks/<id>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "due_date": "2026-12-31",
  "status": "Pending"
}
```

**Error Responses:**
- `404 Not Found`: Task with specified ID doesn't exist

#### 5. Update Task
```
PUT /tasks/<id>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "due_date": "2026-12-31",
  "status": "Completed"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "due_date": "2026-12-31",
  "status": "Completed"
}
```

**Error Responses:**
- `400 Bad Request`: No fields provided or invalid data
- `404 Not Found`: Task with specified ID doesn't exist

#### 6. Delete Task
```
DELETE /tasks/<id>
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Task with specified ID doesn't exist

## API Usage Examples

### Using cURL

**Create a task:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "due_date": "2026-12-31",
    "status": "Pending"
  }'
```

**Get all tasks:**
```bash
curl http://localhost:5000/tasks
```

**Get task by ID:**
```bash
curl http://localhost:5000/tasks/1
```

**Update a task:**
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

### Using Python Requests

```python
import requests
import json

BASE_URL = "http://localhost:5000"

# Create a task
task_data = {
    "title": "Test Task",
    "description": "This is a test task",
    "due_date": "2026-12-31",
    "status": "Pending"
}
response = requests.post(f"{BASE_URL}/tasks", json=task_data)
print(response.json())

# Get all tasks
response = requests.get(f"{BASE_URL}/tasks")
print(response.json())

# Get task by ID
task_id = 1
response = requests.get(f"{BASE_URL}/tasks/{task_id}")
print(response.json())

# Update a task
update_data = {"status": "Completed"}
response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data)
print(response.json())

# Delete a task
response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
print(response.json())
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **200 OK**: Successful GET, PUT, or DELETE request
- **201 Created**: Successful POST request (task created)
- **400 Bad Request**: Invalid request (missing fields, invalid format)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error responses include a JSON object with an `error` field:
```json
{
  "error": "Error message description"
}
```

## Validation Rules

### Required Fields (POST)
- `title`: String, required
- `description`: String, required
- `due_date`: String in YYYY-MM-DD format, required
- `status`: String, optional (defaults to "Pending")

### Valid Status Values
- "Pending"
- "In Progress"
- "Completed"

### Date Format
Dates must be in ISO format: `YYYY-MM-DD` (e.g., "2026-12-31")

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User authentication and authorization
- Task filtering and sorting
- Task priorities
- Task categories/tags
- Due date reminders
- Task search functionality
- Pagination for large task lists
- API rate limiting
- Docker containerization

## Development

### Adding New Features

1. Add new models in `/models`
2. Add validation logic in `/utils/validators.py`
3. Create route handlers in `/routes`
4. Register blueprints in `app.py`
5. Write tests in `test_app.py`

### Testing

The project includes comprehensive unit tests covering:
- All CRUD operations
- Input validation
- Error handling
- Edge cases
- Integration workflows

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or feedback, please open an issue in the repository.