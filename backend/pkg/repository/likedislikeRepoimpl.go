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

func (repo *LikeDislikeRepoImpl) IsUniqueLikeOrDislike(likeDislike *entity.LikeDislike) bool {
	if likeDislike.TargetType != "post" && likeDislike.TargetType != "comment"{
		fmt.Println("Tu veux nous fail ou quoi ! Calm down ceci n'est pas autoriser !")
		return true
	}
	stmp := `SELECT * FROM likes_dislikes WHERE target_type =?`
	row, err := repo.db.GetDB().Query(stmp, likeDislike.TargetType)
	if err != nil {
		fmt.Println("Erreur lors de l'execution de la requette de verification des like")
		return true
	}
	
	defer row.Close()
	var tmp entity.LikeDislike
	var created_at, updateçat string
	for row.Next() {
		err := row.Scan(&tmp.ID, &tmp.UserID, &tmp.TargetID, &tmp.TargetType, &tmp.Like, &created_at, &updateçat)
		if err != nil {
			fmt.Println("Echecs lors du transfere des donne a la variable", err)
			return true
		}
		if likeDislike.UserID == tmp.UserID && likeDislike.TargetID == tmp.TargetID && likeDislike.TargetType == tmp.TargetType {
			break
		}
	}
	if likeDislike.Like != tmp.Like {
		_, err := repo.db.GetDB().Exec("UPDATE likes_dislikes SET like = ?  WHERE id=?", likeDislike.Like, tmp.ID)
		if err != nil {
			fmt.Println("Erreur lor de l'update de l'etat de la table likes_dislikes", err)
		}
		return true
	}
	return false
}

func (repo *LikeDislikeRepoImpl) LikeTarget(likeDislike *entity.LikeDislike) error {
	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	if !repo.IsUniqueLikeOrDislike(likeDislike) {
		_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, true)
		if err != nil {
			return fmt.Errorf("LikeTarget: %v", err)
		}
	}
	return nil
}

func (repo *LikeDislikeRepoImpl) DislikeTarget(likeDislike *entity.LikeDislike) error {
	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	if !repo.IsUniqueLikeOrDislike(likeDislike) {
		_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, false)
		if err != nil {
			return fmt.Errorf("DislikeTarget: %v", err)
		}
	}
	return nil
}

func (repo *LikeDislikeRepoImpl) GetLikes(targetType string) (map[int]int, error) {
	postquery := `SELECT target_id FROM likes_dislikes WHERE like =? `
	rows, err := repo.db.GetDB().Query(postquery, 1)
	if err != nil {
		return nil, fmt.Errorf("GetLikes: %v", err)
	}
	defer rows.Close()
	var count []int
	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return nil, fmt.Errorf("GetLikes: %v", err)
		}
		count = append(count, int(id))
	}
	stmt := `SELECT COUNT(*) FROM likes_dislikes WHERE target_id = ? AND target_type = ? AND like = true`
	var likemap = make(map[int]int)
	for _, postid := range count {

		row := repo.db.GetDB().QueryRow(stmt, postid, targetType)

		var count int
		err := row.Scan(&count)
		if err != nil {
			return nil, fmt.Errorf("GetLikes: %v", err)
		}
		likemap[postid] = count
	}
	
	return likemap, nil
}

func (repo *LikeDislikeRepoImpl) GetDislikes(targetType string) (map[int]int, error) {
	stmt := `SELECT COUNT(*) FROM likes_dislikes WHERE target_id = ? AND target_type = ? AND like = false`
	postquery := `SELECT target_id FROM likes_dislikes WHERE like =? `
	rows, err := repo.db.GetDB().Query(postquery, 0)
	if err != nil {
		return nil, fmt.Errorf("GetLikes: %v", err)
	}
	defer rows.Close()
	var count []int
	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return nil, fmt.Errorf("GetDisLikes: %v", err)
		}
		count = append(count, int(id))
	}
	var likemap = make(map[int]int)

	for _, postid := range count {
		row := repo.db.GetDB().QueryRow(stmt, postid, targetType)
		var count int
		err := row.Scan(&count)
		if err != nil {
			return nil, fmt.Errorf("GetDisLikes: %v", err)
		}
		likemap[postid] = count
	}
	return likemap, nil
}
