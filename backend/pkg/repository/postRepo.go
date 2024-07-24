package repository

import (
	"backend/pkg/entity"

	"github.com/google/uuid"
)

type PostRepo interface {
	CreatePost(userID uuid.UUID, title, content, postImage string, privacy entity.PostPrivacy) (uuid.UUID, error)
}
