package service

import "backend/pkg/dto"

type PostService interface {
	CreatePost(post *dto.PostDTO) (int, error)
}