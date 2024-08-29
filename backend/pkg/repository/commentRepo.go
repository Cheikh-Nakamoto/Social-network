package repository

import "backend/pkg/entity"

type CommentRepo interface {
	CreateComment(comment *entity.Comment) (int64, error)
	GetAllComments() (map[int][]entity.Comment, error)
	GetCommentByID(id int64) (entity.Comment, error)
	DeleteComment(id int64) error
	UpdateComment(comment *entity.Comment) error
}
