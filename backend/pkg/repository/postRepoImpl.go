package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/entity"
	"fmt"
	"html"
	"log"
	"time"

	"github.com/google/uuid"
)

type PostRepoImpl struct {
	db *sqlite.Database
}

func NewPostRepoImpl(db sqlite.Database) *PostRepoImpl {
	return &PostRepoImpl{db: &db}
}
func generateUUID() string {
	return uuid.New().String()
}
func (p *PostRepoImpl) CreatePost(userID string, title, content, postImage string, privacy entity.PostPrivacy) (string, error) {
	id := generateUUID()
	stmt := `INSERT INTO posts (id, user_id, title, content, post_image, privacy, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	escapedTitle := html.EscapeString(title)
	escapedContent := html.EscapeString(content)
	escapedPostImage := html.EscapeString(postImage)
	log.Println(escapedTitle)
	_, err := p.db.GetDB().Exec(stmt, id, userID, escapedTitle, escapedContent, escapedPostImage, privacy, time.Now(), time.Now())
	if err != nil {
		fmt.Println("err create")
		return "", fmt.Errorf("CreatePost: %v", err)
	}
	return id, nil
}

func (p *PostRepoImpl) GetAllPosts() ([]entity.Post, error) {
	row, err := p.db.GetDB().Query(`SELECT id, user_id, title, content, post_image, privacy, created_at, updated_at FROM posts`)
	if err != nil {
		return nil, fmt.Errorf("GetAllPosts: %v", err)
	}
	defer row.Close()
	var posts []entity.Post
	for row.Next() {
		var post entity.Post
		err := row.Scan(
			&post.ID,
			&post.UserID,
			&post.Title,
			&post.Content,
			&post.PostImage,
			&post.Privacy,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("GetAllPosts: %v", err)
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func (p *PostRepoImpl) DeletePost() ([]entity.Post, error) {
	row, err := p.db.GetDB().Query(`DELETE FROM posts`)
	if err != nil {
		return nil, fmt.Errorf("DeletePost: %v", err)
	}
	defer row.Close()
	var posts []entity.Post
	for row.Next() {
		var post entity.Post
		err := row.Scan(
			&post.ID,
			&post.UserID,
			&post.Title,
			&post.Content,
			&post.PostImage,
			&post.Privacy,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("GetAllPosts: %v", err)
		}
		posts = append(posts, post)
	}
	return posts, nil
}
