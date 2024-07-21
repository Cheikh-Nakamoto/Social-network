-- Crée la table likes avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,             -- Identifiant unique du like
    user_id TEXT NOT NULL,           -- Identifiant de l'utilisateur ayant aimé
    post_id TEXT NOT NULL,           -- Identifiant du post aimé
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du like
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Clé étrangère vers la table users
    FOREIGN KEY (post_id) REFERENCES posts(id)   -- Clé étrangère vers la table posts
);
