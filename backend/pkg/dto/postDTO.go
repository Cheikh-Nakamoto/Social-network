package dto

import (
	"backend/pkg/models"
	"time"

	"github.com/google/uuid"
)

type PostDTO struct {
	ID        uuid.UUID   `json:"id" db:"type:uuid;primary key"`
	UserID    uuid.UUID   `json:"user_id" db:"type:uuid"`
	Title     string      `json:"title" db:"type:varchar(255)"`
	Content   string      `json:"content" db:"type:text"`
	PostImage string      `json: "post_image" db:"type:varchar(255)"`
	Privacy   models.PostPrivacy `json:"privacy"`
	CreatedAt time.Time   `json:created_at`
	UpdatedAt time.Time   `json:updated_at`
}
