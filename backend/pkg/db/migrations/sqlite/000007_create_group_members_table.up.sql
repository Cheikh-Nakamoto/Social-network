CREATE TABLE group_members
(
    user_id   INTEGER NOT NULL,
    group_id  INTEGER NOT NULL,
    role      TEXT    NOT NULL,
    status an NOT NULL DEFAULT false,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
);
