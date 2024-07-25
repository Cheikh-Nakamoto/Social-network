package repository

import (
	"backend/pkg/models"
)

type PostRepo interface {
	CreatePost(userID string, title, content, postImage string, privacy models.PostPrivacy) (string, error)
	GetAllPosts() ([]models.Post, error)
	DeletePost() ([]models.Post, error)
}
