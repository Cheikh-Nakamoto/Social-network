package service

import "backend/pkg/dto"

type CommentService interface {
	CreateComment(comment *dto.CommentDTO) (int64, error)
	GetAllComments() ([]dto.CommentDTO, error)
	GetCommentByID(id int) (dto.CommentDTO, error)
	DeleteComment(id int) error
	UpdateComment(comment *dto.CommentDTO) error
}
