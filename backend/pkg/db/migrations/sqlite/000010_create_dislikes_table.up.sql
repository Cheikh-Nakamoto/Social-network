-- Crée la table dislikes avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS dislikes (
    id TEXT PRIMARY KEY,             -- Identifiant unique du dislike
    user_id TEXT NOT NULL,           -- Identifiant de l'utilisateur ayant disliké
    post_id TEXT NOT NULL,           -- Identifiant du post disliké
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du dislike
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Clé étrangère vers la table users
    FOREIGN KEY (post_id) REFERENCES posts(id)   -- Clé étrangère vers la table posts
);
