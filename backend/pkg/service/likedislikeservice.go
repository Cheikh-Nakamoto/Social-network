package service

import "backend/pkg/dto"

type LikeDislikeService interface {
	LikeTarget(likeDislike *dto.LikeDislikeDTO) error
	DislikeTarget(likeDislike *dto.LikeDislikeDTO) error
	GetLikes(targetID int64, targetType string) (int, error)
	GetDislikes(targetID int64, targetType string) (int, error)
}
