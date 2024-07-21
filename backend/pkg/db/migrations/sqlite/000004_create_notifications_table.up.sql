-- Crée la table notifications avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,             -- Identifiant unique de la notification
    user_id TEXT NOT NULL,           -- Identifiant de l'utilisateur recevant la notification
    type TEXT NOT NULL,              -- Type de la notification (ex: "comment", "like", "follow")
    content TEXT NOT NULL,           -- Contenu de la notification
    read BOOLEAN NOT NULL DEFAULT 0, -- Indicateur si la notification a été lue (0 pour non lu, 1 pour lu)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date de création de la notification
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Clé étrangère vers la table users
);
