package impl

import (
	"backend/pkg/dto"
	"backend/pkg/entity"
	"backend/pkg/repository"
)

type CommentServiceImpl struct {
	Repository repository.CommentRepo
}

func NewCommentServiceImpl(repo repository.CommentRepo) *CommentServiceImpl {
	return &CommentServiceImpl{Repository: repo}
}

func (s *CommentServiceImpl) CreateComment(comment *dto.CommentDTO) (int64, error) {
	entity := &entity.Comment{
		UserID:    comment.UserID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
	}
	return s.Repository.CreateComment(entity)
}

func (s *CommentServiceImpl) GetAllComments() ([]dto.CommentDTO, error) {
	comments, err := s.Repository.GetAllComments()
	if err != nil {
		return nil, err
	}

	var commentDTOs []dto.CommentDTO
	for _, comment := range comments {
		commentDTO := dto.CommentDTO{
			ID:        comment.ID,
			UserID:    comment.UserID,
			Content:   comment.Content,
			CreatedAt: comment.CreatedAt,
		}
		commentDTOs = append(commentDTOs, commentDTO)
	}
	return commentDTOs, nil
}

func (s *CommentServiceImpl) GetCommentByID(id int64) (dto.CommentDTO, error) {
	comment, err := s.Repository.GetCommentByID(id)
	if err != nil {
		return dto.CommentDTO{}, err
	}
	return dto.CommentDTO{
		ID:        comment.ID,
		UserID:    comment.UserID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
	}, nil
}

func (s *CommentServiceImpl) DeleteComment(id int64) error {
	return s.Repository.DeleteComment(id)
}

func (s *CommentServiceImpl) UpdateComment(comment *dto.CommentDTO) error {
	entity := &entity.Comment{
		ID:        comment.ID,
		UserID:    comment.UserID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
	}
	return s.Repository.UpdateComment(entity)
}
