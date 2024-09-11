CREATE TABLE group_members
(
    user_id   INTEGER NOT NULL,
    group_id  INTEGER NOT NULL,
    role      TEXT    NOT NULL,
    status    BOOLEAN NOT NULL DEFAULT false,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (group_id) REFERENCES groups (id)
);
