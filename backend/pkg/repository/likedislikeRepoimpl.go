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
	if likeDislike.TargetType != "post" && likeDislike.TargetType != "comment" && likeDislike.TargetType != "event"  {
		fmt.Println("Tu veux nous fail ou quoi ! Calm down ceci n'est pas autorisé !")
		return true
	}
	query := `SELECT id, user_id, target_id, target_type, like, created_at, updated_at FROM likes_dislikes WHERE target_type = ?`
	rows, err := repo.db.GetDB().Query(query, likeDislike.TargetType)
	if err != nil {
		fmt.Println("Erreur lors de l'exécution de la requête de vérification des likes/dislikes:", err)
		return true
	}
	defer rows.Close()
	var CreatedAt,UpdatedAt string
	var existingLikeDislike entity.LikeDislike
	for rows.Next() {
		err := rows.Scan(&existingLikeDislike.ID, &existingLikeDislike.UserID, &existingLikeDislike.TargetID, &existingLikeDislike.TargetType, &existingLikeDislike.Like, &CreatedAt, &UpdatedAt)
		if err != nil {
			fmt.Println("Échec lors du transfert des données à la variable:", err)
			return true
		}
		if likeDislike.UserID == existingLikeDislike.UserID && likeDislike.TargetID == existingLikeDislike.TargetID && likeDislike.TargetType == existingLikeDislike.TargetType {
			if likeDislike.Like != existingLikeDislike.Like {
				_, err := repo.db.GetDB().Exec("UPDATE likes_dislikes SET like = ? WHERE id = ?", likeDislike.Like, existingLikeDislike.ID)
				if err != nil {
					fmt.Println("Erreur lors de la mise à jour de l'état de la table likes_dislikes:", err)
				}
				return true
			}
			return true
		}
	}

	return false
}

func (repo *LikeDislikeRepoImpl) LikeTarget(likeDislike *entity.LikeDislike) error {
	if repo.IsUniqueLikeOrDislike(likeDislike) {
		return nil
	}

	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, true)
	if err != nil {
		return fmt.Errorf("LikeTarget: %v", err)
	}
	return nil
}

func (repo *LikeDislikeRepoImpl) DislikeTarget(likeDislike *entity.LikeDislike) error {
	if repo.IsUniqueLikeOrDislike(likeDislike) {
		return nil
	}

	stmt := `INSERT INTO likes_dislikes (user_id, target_id, target_type, like) VALUES (?, ?, ?, ?)`
	_, err := repo.db.GetDB().Exec(stmt, likeDislike.UserID, likeDislike.TargetID, likeDislike.TargetType, false)
	if err != nil {
		return fmt.Errorf("DislikeTarget: %v", err)
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
