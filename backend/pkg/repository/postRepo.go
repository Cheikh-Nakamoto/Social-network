package repository

import (
	"backend/pkg/models"

	"github.com/google/uuid"
)

type PostRepo interface {
	CreatePost(userID uuid.UUID, title, content, postImage string, privacy models.PostPrivacy) (uuid.UUID, error)
}
