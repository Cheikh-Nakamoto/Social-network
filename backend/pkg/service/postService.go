package service

import (
	"backend/pkg/dto"
	"backend/pkg/entity"
)

type PostService interface {
	CreatePost(post *dto.PostDTO) (string, error)
	GetAllPosts(id int) ([]dto.PostDTO, error)
	GetAllPostsByGroupID(id int) ([]entity.Post, error)
}
