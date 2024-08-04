package repository

import "backend/pkg/entity"

type LikeDislikeRepo interface {
	LikeTarget(likeDislike *entity.LikeDislike) error
	DislikeTarget(likeDislike *entity.LikeDislike) error
	GetLikes(targetID int64, targetType string) (int, error)
	GetDislikes(targetID int64, targetType string) (int, error)
}
