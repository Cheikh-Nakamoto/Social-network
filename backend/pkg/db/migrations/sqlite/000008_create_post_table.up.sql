CREATE TABLE IF NOT EXISTS posts
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_image TEXT DEFAULT "",
    group_id INTEGER REFERENCES groups(id),
    privacy TEXT CHECK(
        privacy = 'public'
        OR privacy = 'private'
        OR privacy = 'almost private'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
