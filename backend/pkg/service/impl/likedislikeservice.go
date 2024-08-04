package impl

import (
	"backend/pkg/dto"
	"backend/pkg/entity"
	"backend/pkg/repository"
)

type LikeDislikeServiceImpl struct {
	Repository repository.LikeDislikeRepo
}

func NewLikeDislikeServiceImpl(repo repository.LikeDislikeRepo) *LikeDislikeServiceImpl {
	return &LikeDislikeServiceImpl{Repository: repo}
}

func (s *LikeDislikeServiceImpl) LikeTarget(likeDislike *dto.LikeDislikeDTO) error {
	entity := &entity.LikeDislike{
		UserID:     likeDislike.UserID,
		TargetID:   likeDislike.TargetID,
		TargetType: likeDislike.TargetType,
		Like:       true,
	}
	return s.Repository.LikeTarget(entity)
}

func (s *LikeDislikeServiceImpl) DislikeTarget(likeDislike *dto.LikeDislikeDTO) error {
	entity := &entity.LikeDislike{
		UserID:     likeDislike.UserID,
		TargetID:   likeDislike.TargetID,
		TargetType: likeDislike.TargetType,
		Like:       false,
	}
	return s.Repository.DislikeTarget(entity)
}

func (s *LikeDislikeServiceImpl) GetLikes(targetID int64, targetType string) (int, error) {
	return s.Repository.GetLikes(targetID, targetType)
}

func (s *LikeDislikeServiceImpl) GetDislikes(targetID int64, targetType string) (int, error) {
	return s.Repository.GetDislikes(targetID, targetType)
}
