package entity

import "time"

type Notification struct {
	ID        int       `json:"id"`         // Clé primaire
	Content   string    `json:"content"`    // Contenu de la notification
	UserID    int       `json:"user_id"`    // Référence à l'utilisateur
	GroupID   int       `json:"group_id"`   // Référence au groupe (nullable si non applicable)
	IsRead    bool      `json:"is_read"`    // Indique si la notification a été lue
	Role      string    `json:"role"`      // Rôle de l'utilisateur dans la notification (admin, member)
	CreatedAt time.Time `json:"created_at"` // Date et heure de création
}
