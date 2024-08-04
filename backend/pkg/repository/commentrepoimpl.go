package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/entity"
	"fmt"
)

type CommentRepoImpl struct {
	db *sqlite.Database
}

func NewCommentRepoImpl(db sqlite.Database) *CommentRepoImpl {
	return &CommentRepoImpl{db: &db}
}

func (repo *CommentRepoImpl) CreateComment(comment *entity.Comment) (int64, error) {
	stmt := `INSERT INTO comments (user_id, content, likes, dislikes, created_at) VALUES (?, ?, ?, ?, ?)`
	result, err := repo.db.GetDB().Exec(stmt, comment.UserID, comment.Content, comment.CreatedAt)
	if err != nil {
		return 0, fmt.Errorf("CreateComment: %v", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("CreateComment: %v", err)
	}
	return id, nil
}

func (repo *CommentRepoImpl) GetAllComments() ([]entity.Comment, error) {
	stmt := `SELECT id, user_id, content, likes, dislikes, created_at FROM comments`
	rows, err := repo.db.GetDB().Query(stmt)
	if err != nil {
		return nil, fmt.Errorf("GetAllComments: %v", err)
	}
	defer rows.Close()

	var comments []entity.Comment
	for rows.Next() {
		var comment entity.Comment
		err := rows.Scan(&comment.ID, &comment.UserID, &comment.Content, &comment.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("GetAllComments: %v", err)
		}
		comments = append(comments, comment)
	}
	return comments, nil
}

func (repo *CommentRepoImpl) GetCommentByID(id int64) (entity.Comment, error) {
	stmt := `SELECT id, user_id, content, likes, dislikes, created_at FROM comments WHERE id = ?`
	row := repo.db.GetDB().QueryRow(stmt, id)

	var comment entity.Comment
	err := row.Scan(&comment.ID, &comment.UserID, &comment.Content, &comment.CreatedAt)
	if err != nil {
		return comment, fmt.Errorf("GetCommentByID: %v", err)
	}
	return comment, nil
}

func (repo *CommentRepoImpl) DeleteComment(id int64) error {
	stmt := `DELETE FROM comments WHERE id = ?`
	_, err := repo.db.GetDB().Exec(stmt, id)
	if err != nil {
		return fmt.Errorf("DeleteComment: %v", err)
	}
	return nil
}

func (repo *CommentRepoImpl) UpdateComment(comment *entity.Comment) error {
	stmt := `UPDATE comments SET content = ?, likes = ?, dislikes = ? WHERE id = ?`
	_, err := repo.db.GetDB().Exec(stmt, comment.Content, comment.ID)
	if err != nil {
		return fmt.Errorf("UpdateComment: %v", err)
	}
	return nil
}
