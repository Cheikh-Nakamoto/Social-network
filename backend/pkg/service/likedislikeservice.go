package service

import "backend/pkg/dto"

type LikeDislikeService interface {
	LikeTarget(likeDislike *dto.LikeDislikeDTO) error
	DislikeTarget(likeDislike *dto.LikeDislikeDTO) error
	GetLikes(targetType string) (map[int]int, error)
	GetDislikes(targetType string) (map[int]int, error)
}
