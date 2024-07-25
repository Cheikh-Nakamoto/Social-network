package service

import (
	"backend/pkg/dto"
)

type PostService interface {
	CreatePost(post *dto.PostDTO) (string, error)
	GetAllPosts() ([]dto.PostDTO, error)
}
