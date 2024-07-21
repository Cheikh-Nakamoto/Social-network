-- Crée la table comments avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,             -- Identifiant unique du commentaire
    post_id TEXT NOT NULL,           -- Identifiant du post commenté
    user_id TEXT NOT NULL,           -- Identifiant de l'utilisateur ayant commenté
    content TEXT NOT NULL,           -- Contenu du commentaire
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du commentaire
    FOREIGN KEY (post_id) REFERENCES posts(id),  -- Clé étrangère vers la table posts
    FOREIGN KEY (user_id) REFERENCES users(id)   -- Clé étrangère vers la table users
);
