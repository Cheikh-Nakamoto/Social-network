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
		PostImage: post.PostImage,
		Privacy:   post.Privacy,
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt,
	}
}

func DTOToPost(postDTO *dto.PostDTO) *entity.Post {
	return &entity.Post{
        ID:        postDTO.ID,
        UserID:    postDTO.UserID,
        Title:     postDTO.Title,
        Content:   postDTO.Content,
        PostImage: postDTO.PostImage,
        Privacy:   postDTO.Privacy,
        CreatedAt: postDTO.CreatedAt,
        UpdatedAt: postDTO.UpdatedAt,
    }
}