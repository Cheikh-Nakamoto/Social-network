CREATE TABLE IF NOT EXISTS almost_private
(
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id) ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
