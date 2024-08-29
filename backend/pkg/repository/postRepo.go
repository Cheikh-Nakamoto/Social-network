package repository

import (
	"backend/pkg/entity"
)

type PostRepo interface {
	CreatePost(userID string, title, content, Image string, IsPublic string) (string, error)
	GetAllPosts() ([]entity.Post, error)
	DeletePostByID(id int) ([]entity.Post, error)
}
