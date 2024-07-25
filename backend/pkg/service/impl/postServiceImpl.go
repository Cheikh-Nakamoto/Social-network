package impl

import (
	"backend/pkg/dto"
	"backend/pkg/repository"
)

type PostServiceImpl struct {
	Repository repository.PostRepo
}

func (p *PostServiceImpl) CreatePost(post *dto.PostDTO) (string, error) {
	return p.Repository.CreatePost(post.UserID, post.Title, post.Content, post.PostImage, post.Privacy)
}

// GetAllPosts...
func (p *PostServiceImpl) GetAllPosts() ([]dto.PostDTO, error) {
	posts, err := p.Repository.GetAllPosts()
	if err != nil {
		return nil, err
	}

	var postDTOs []dto.PostDTO
	for _, post := range posts {
		postDTOs = append(postDTOs, dto.PostDTO{
			ID:        post.ID,
			UserID:    post.UserID,
			Title:     post.Title,
			Content:   post.Content,
			PostImage: post.PostImage,
			Privacy:   post.Privacy,
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		})
	}

	return postDTOs, nil
}
