--CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password_hash TEXT);

--CREATE TABLE Tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, assignee_id INTEGER, created_at DATETIME, updated_at DATETIME, FOREIGN KEY(assignee_id) REFERENCES Users(id));


--select * from Users;
