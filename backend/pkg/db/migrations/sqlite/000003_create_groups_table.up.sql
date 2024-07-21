-- Crée la table groups avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,             -- Identifiant unique du groupe
    name TEXT NOT NULL,              -- Nom du groupe
    description TEXT,                -- Description du groupe
    owner_id TEXT NOT NULL,          -- Identifiant de l'utilisateur propriétaire du groupe
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du groupe
    FOREIGN KEY (owner_id) REFERENCES users(id)  -- Clé étrangère vers la table users
);
