CREATE TABLE IF NOT EXISTS messages (
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
	senderId INTEGER NOT NULL,
	receiverId INTEGER NOT NULL,
	sentDate TEXT NOT NULL,
	message TEXT NOT NULL,
	status BOOLEAN NOT NULL default FALSE,
    FOREIGN KEY (senderId) REFERENCES users (id),
    FOREIGN KEY (receiverId) REFERENCES users (id)
);