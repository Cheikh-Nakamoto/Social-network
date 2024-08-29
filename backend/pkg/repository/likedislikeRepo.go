package repository

import "backend/pkg/entity"

type LikeDislikeRepo interface {
	LikeTarget(likeDislike *entity.LikeDislike) error
	DislikeTarget(likeDislike *entity.LikeDislike) error
	GetLikes(targetType string) (map[int]int, error)
	GetDislikes(targetType string) (map[int]int, error)
}
