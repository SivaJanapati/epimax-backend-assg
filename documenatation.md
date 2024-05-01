Backend Documentation

Introduction
This document provides an overview of the backend code for an application designed to manage tasks. The backend is built using Express.js and SQLite, with authentication handled using JWT tokens.


Setup and Dependencies
Express.js: The backend framework used to build the API endpoints.
SQLite: The lightweight database management system used to store task data.
bcrypt: A library used for hashing passwords securely.
jsonwebtoken (JWT): Used for user authentication and generating JWT tokens.


API Endpoints

1. /register Endpoint
Purpose: Allows users to register by creating a new account.
Method: POST
Request Body:
username: The username for the new account.
password: The password for the new account.
Response:
Success: Returns a success message with the newly created user ID.
Failure: Returns an error message if the username already exists.

2. /login Endpoint
Purpose: Handles user login and issues JWT tokens upon successful authentication.
Method: POST
Request Body:
username: The username of the user.
password: The password of the user.
Response:
Success: Returns a JWT token if the login is successful.
Failure: Returns an error message if the username or password is invalid.

3. /tasks Endpoints
Purpose: Provides CRUD operations for managing tasks.
Authentication: All /tasks endpoints require a valid JWT token for authentication.
a. GET /tasks
Purpose: Retrieves a list of all tasks.
Response: Returns an array of tasks.
b. GET /tasks/:id
Purpose: Retrieves details of a specific task by ID.
Request Parameters: id - The ID of the task.
Response: Returns details of the specified task.
c. POST /tasks
Purpose: Creates a new task.
Request Body: Contains details of the new task.
Response: Returns the ID of the newly created task.
d. PUT /tasks/:id
Purpose: Updates details of an existing task.
Request Parameters: id - The ID of the task to update.
Request Body: Contains updated details of the task.
Response: Returns a success message upon successful update.
e. DELETE /tasks/:id
Purpose: Deletes an existing task.
Request Parameters: id - The ID of the task to delete.
Response: Returns a success message upon successful deletion.

Authentication Middleware
Purpose: Middleware function to authenticate incoming requests using JWT tokens.
Usage: Applied to all /tasks endpoints to ensure that only authenticated users can access them.
Database Initialization
Purpose: Initializes the SQLite database and starts the Express server.
Initialization: Opens the database connection and listens for incoming HTTP requests on port 4004.

Conclusion:
This documentation provides an overview of the backend code structure, API endpoints, authentication mechanisms, and database setup. Refer to the comments within the code for further details and implementation specifics.





