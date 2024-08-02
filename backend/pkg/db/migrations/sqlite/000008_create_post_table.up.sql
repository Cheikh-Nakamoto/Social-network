CREATE TABLE IF NOT EXISTS posts
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    title TEXT,
    content TEXT,
    post_image TEXT,
    IsPublic TEXT CHECK(
        IsPublic = 'public'
        OR IsPublic = 'private'
        OR IsPublic = 'almost private'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
