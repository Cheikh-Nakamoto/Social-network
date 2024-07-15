-- Crée la table followers avec les colonnes nécessaires
CREATE TABLE followers (
    id TEXT PRIMARY KEY,             -- Identifiant unique de la relation de suivi
    follower_id TEXT NOT NULL,       -- Identifiant de l'utilisateur suivant
    followed_id TEXT NOT NULL,       -- Identifiant de l'utilisateur suivi
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création de la relation de suivi
    FOREIGN KEY (follower_id) REFERENCES users(id),  -- Clé étrangère vers la table users
    FOREIGN KEY (followed_id) REFERENCES users(id)   -- Clé étrangère vers la table users
);
