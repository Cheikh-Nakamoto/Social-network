-- Crée la table messages avec les colonnes nécessaires
CREATE TABLE messages (
    id TEXT PRIMARY KEY,             -- Identifiant unique du message
    chat_id TEXT NOT NULL,           -- Identifiant du chat auquel le message appartient
    sender_id TEXT NOT NULL,         -- Identifiant de l'utilisateur ayant envoyé le message
    content TEXT NOT NULL,           -- Contenu du message
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création du message
    FOREIGN KEY (chat_id) REFERENCES chats(id),  -- Clé étrangère vers la table chats
    FOREIGN KEY (sender_id) REFERENCES users(id) -- Clé étrangère vers la table users
);
