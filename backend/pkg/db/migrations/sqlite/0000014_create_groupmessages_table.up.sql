CREATE TABLE IF NOT EXISTS groupmessages (
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
	senderId INTEGER NOT NULL,
	groupId INTEGER NOT NULL,
	sentDate TEXT NOT NULL,
	message TEXT NOT NULL,
    FOREIGN KEY (senderId) REFERENCES users (id),
    FOREIGN KEY (groupId) REFERENCES groups (id)
);