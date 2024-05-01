const express=require("express");
const path = require("path");
const bodyParser = require('body-parser');
const { open } = require("sqlite");
const bcrypt = require('bcrypt');
const sqlite3 = require("sqlite3");
const jsonMiddleware = express.json();
const jwt=require("jsonwebtoken");
const app = express();

//Registers the JSON middleware (express.json()) and the body-parser middleware (bodyParser.json()) with the Express application to parse incoming JSON request bodies.
app.use(jsonMiddleware);
app.use(bodyParser.json());

//Constructs the file path for the SQLite database file (data.db) by joining the current directory (__dirname) with the database filename.
const dbPath = path.join(__dirname, "data.db");

let db = null;

//Declares an asynchronous function initializeDBAndServer that initializes the SQLite database connection and starts the Express server.
const initializeDBAndServer = async () => {
    try {

      //Opens the SQLite database using the open function with the specified filename (dbPath) and SQLite driver.  
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      //Starts the Express server, listening for incoming HTTP requests on port 4004, and logs a message indicating that the server is running.
      app.listen(4004, () => {
        console.log("Server Running at http://localhost:4004/");
      });
    } 
    // Catches and handles any errors that occur during database initialization, logging the error message and exiting the process with an error code if an error occurs.
    catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
};
  
initializeDBAndServer();

// Registration endpoint
app.post("/register/", async (request, response) => {
    const { username, password_hash} = request.body;
    const hashedPassword = await bcrypt.hash(password_hash, 10).catch((err) => {
        // Handle error
        console.error("Error while hashing password:", err);
        // Optionally, return a default value or throw the error
        throw err;
    });
    const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          Users ( username, password_hash) 
        VALUES 
          (
            '${username}',
            '${hashedPassword}'
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
});

// Login endpoint
app.post("/login", async (request, response) => {
    const { username, password_hash } = request.body;
    
    const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password_hash, dbUser.password_hash);
      
      if (isPasswordMatched === true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
});

// Middleware for authorization  
const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          request.username = payload.username;
          next();
        }
      });
    }
};

//GET all tasks API
app.get("/tasks/",authenticateToken, async (request, response) => {
    const getTasksQuery = `
      SELECT
        *
      FROM
        Tasks
      ORDER BY
        id;`;
    const tasksArray = await db.all(getTasksQuery);
    response.send(tasksArray);
});

//GET single task API
app.get("/tasks/:id/",authenticateToken, async (request, response) => {
    const { id } = request.params;
    const getTaskQuery = `
      SELECT
        *
      FROM
        Tasks
      WHERE
        id = ${id};`;
    const task = await db.get(getTaskQuery);
    response.send(task);
});

//POST Task API
app.post("/tasks/",authenticateToken, async (request, response) => {
    const taskDetails = request.body;
    const {
        title, 
        description, 
        status, 
        assignee_id, 
        created_at, 
        updated_at
    } = taskDetails;
    const addTaskQuery = `
      INSERT INTO
        Tasks ( title, description, status, assignee_id, created_at, updated_at)
      VALUES
        (  
           '${title}',
           '${description}',
           '${status}',
           ${assignee_id},
           '${created_at}',
           '${updated_at}'
        );`;
  
    const dbResponse = await db.run(addTaskQuery);
    const taskId = dbResponse.lastID;
    response.send({ taskId: taskId });
});

//PUT Task API
app.put("/tasks/:id/",authenticateToken, async (request, response) => {
    const { id } = request.params;
    const taskDetails = request.body;
    const {
        title, 
        description, 
        status, 
        assignee_id, 
        created_at, 
        updated_at
    } = taskDetails;
    const updateTaskQuery = `
      UPDATE
        Tasks
      SET
        id = ${id}, 
        title='${title}',
        description='${description}',
        status='${status}',
        assignee_id=${assignee_id}, 
        created_at='${created_at}', 
        updated_at='${updated_at}'
      WHERE
        id = ${id};`;
    await db.run(updateTaskQuery);
    response.send("Task Updated Successfully");
});

//DELETE Task API
app.delete("/tasks/:id/",authenticateToken, async (request, response) => {
    const { id } = request.params;
    const deleteTaskQuery = `
      DELETE FROM
        Tasks
      WHERE
        id = ${id};`;
    await db.run(deleteTaskQuery);
    response.send("Task Deleted Successfully");
});

