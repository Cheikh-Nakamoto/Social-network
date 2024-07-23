package impl

import (
	"backend/pkg/dto"
	"backend/pkg/repository"

	"github.com/google/uuid"
)

type PostServiceImpl struct {
	Repository repository.PostRepo
}

func (p *PostServiceImpl) CreatePost(post *dto.PostDTO) (uuid.UUID, error) {
	return p.Repository.CreatePost(post.UserID, post.Title, post.Content, post.PostImage, post.Privacy)

}
