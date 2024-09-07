CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT ,
	user_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	hour_start DATETIME NOT NULL,
    hour_end DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (group_id) REFERENCES groups (id)
);