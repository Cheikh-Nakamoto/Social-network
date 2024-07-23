package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/models"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type PostRepoImpl struct {
	db *sqlite.Database
}

func NewPostRepoImpl(db *sqlite.Database) *PostRepoImpl {
	return &PostRepoImpl{db: db}
}
func (p *PostRepoImpl) CreatePost(userID uuid.UUID, title, content, postImage string, privacy models.PostPrivacy) (uuid.UUID, error) {
	stmt := `INSERT INTO posts (user_id, title, content, post_image, privacy, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
	var id uuid.UUID
	err := p.db.GetDB().QueryRow(stmt, userID, title, content, postImage, privacy, time.Now(), time.Now()).Scan(&id)
	if err != nil {
		return uuid.Nil, fmt.Errorf("CreatePost: %v", err)
	}
	return id, nil

}
