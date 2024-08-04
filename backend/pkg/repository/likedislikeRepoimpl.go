package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/entity"
	"fmt"
)

type LikeDislikeRepoImpl struct {
	db *sqlite.Database
}

func NewLikeDislikeRepoImpl(db sqlite.Database) *LikeDislikeRepoImpl {
	return &LikeDislikeRepoImpl{db: &db}
}

func (repo *LikeDislikeRepoImpl) LikeTarget(likeDislike *entity.LikeDislike) error {
	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, true)
	if err != nil {
		return fmt.Errorf("LikeTarget: %v", err)
	}
	return nil
}

func (repo *LikeDislikeRepoImpl) DislikeTarget(likeDislike *entity.LikeDislike) error {
	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, false)
	if err != nil {
		return fmt.Errorf("DislikeTarget: %v", err)
	}
	return nil
}

func (repo *LikeDislikeRepoImpl) GetLikes(targetID int64, targetType string) (int, error) {
	stmt := `SELECT COUNT(*) FROM likes_dislikes WHERE target_id = ? AND target_type = ? AND like = true`
	row := repo.db.GetDB().QueryRow(stmt, targetID, targetType)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetLikes: %v", err)
	}
	return count, nil
}

func (repo *LikeDislikeRepoImpl) GetDislikes(targetID int64, targetType string) (int, error) {
	stmt := `SELECT COUNT(*) FROM likes_dislikes WHERE target_id = ? AND target_type = ? AND like = false`
	row := repo.db.GetDB().QueryRow(stmt, targetID, targetType)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("GetDislikes: %v", err)
	}
	return count, nil
}
