package mapper

import (
	"backend/pkg/dto"
	"backend/pkg/entity"
)

func PostToDTO(post *entity.Post) *dto.PostDTO {
	return &dto.PostDTO{
		ID:        post.ID,
		UserID:    post.UserID,
		Title:     post.Title,
		Content:   post.Content,
		Image: post.Image,
		IsPublic:   post.IsPublic,
		CreatedAt: post.CreatedAt,
		
	}
}

func DTOToPost(postDTO *dto.PostDTO) *entity.Post {
	return &entity.Post{
		ID:        postDTO.ID,
		UserID:    postDTO.UserID,
		Title:     postDTO.Title,
		Content:   postDTO.Content,
		Image: postDTO.Image,
		IsPublic:   postDTO.IsPublic,
		CreatedAt: postDTO.CreatedAt,
	}
}
