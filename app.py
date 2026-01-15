"""Main Flask application for the Personal Task Manager API."""

import os
from flask import Flask, jsonify
from routes.task_routes import task_bp


def create_app():
    """Create and configure the Flask application.
    
    Returns:
        Configured Flask app instance
    """
    app = Flask(__name__)
    
    # Register blueprints
    app.register_blueprint(task_bp)
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def home():
        """Root endpoint with API information."""
        return jsonify({
            "message": "Personal Task Manager API",
            "version": "1.0.0",
            "endpoints": {
                "POST /tasks": "Create a new task",
                "GET /tasks": "Get all tasks",
                "GET /tasks/<id>": "Get task by ID",
                "PUT /tasks/<id>": "Update task by ID",
                "DELETE /tasks/<id>": "Delete task by ID"
            }
        }), 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
