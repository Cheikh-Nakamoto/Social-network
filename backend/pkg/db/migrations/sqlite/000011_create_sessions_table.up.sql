-- Crée la table sessions avec les colonnes nécessaires
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,             -- Identifiant unique de la session
    user_id TEXT NOT NULL,           -- Identifiant de l'utilisateur
    token TEXT NOT NULL,             -- Token de session
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création de la session
    expires_at DATETIME,             -- Date d'expiration de la session
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Clé étrangère vers la table users
);
