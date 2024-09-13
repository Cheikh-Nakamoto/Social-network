CREATE TABLE IF NOT EXISTS almost_private
(
    post_id INTEGER REFERENCES posts(id),
    owner INTEGER REFERENCES users(id) ,
	views TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
