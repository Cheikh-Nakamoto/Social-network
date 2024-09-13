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
		UserID:     comment.UserID,
		TargetId:   comment.TargetId,
		Content:    comment.Content,
		Image: 		comment.Image,
		TargetType: comment.TargetType,
		CreatedAt:  comment.CreatedAt,
	}
	return s.Repository.CreateComment(entity)
}

func (s *CommentServiceImpl) GetAllComments() (dto.SendCommentDTO, error) {
	comments, err := s.Repository.GetAllComments()
	if err != nil {
		return dto.SendCommentDTO{}, err
	}

	var commentDTOs = make(map[int][]dto.CommentDTO)
	var sendcomments dto.SendCommentDTO
	var commentLength = make(map[int]int)
	for cle, comment := range comments {
		for _, v := range comment {
			commentDTO := dto.CommentDTO{
				ID:         v.ID,
				UserID:     v.UserID,
				TargetId:   v.TargetId,
				TargetType: v.TargetType,
				Image:		v.Image,
				Content:    v.Content,
				CreatedAt:  v.CreatedAt,
			}
			commentDTOs[cle] = append(commentDTOs[cle], commentDTO)
		}
		if len(commentDTOs[cle]) != 0 {
			commentLength[cle] =len(commentDTOs[cle])
		}else {
			commentLength[cle] = 0
		}
	}
	sendcomments.Comments = commentDTOs
	sendcomments.CommentsLength = commentLength
	return sendcomments, nil
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
		Image:	   comment.Image,
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
		Image:	   comment.Image,
		CreatedAt: comment.CreatedAt,
	}
	return s.Repository.UpdateComment(entity)
}
