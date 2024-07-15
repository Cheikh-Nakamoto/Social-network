-- Crée la table chats avec les colonnes nécessaires
CREATE TABLE chats (
    id TEXT PRIMARY KEY,             -- Identifiant unique du chat
    user1_id TEXT NOT NULL,          -- Identifiant du premier utilisateur
    user2_id TEXT NOT NULL,          -- Identifiant du second utilisateur
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du chat
    FOREIGN KEY (user1_id) REFERENCES users(id),  -- Clé étrangère vers la table users
    FOREIGN KEY (user2_id) REFERENCES users(id)   -- Clé étrangère vers la table users
);
