package impl

import (
	"backend/pkg/models"
	"database/sql"
	"fmt"
	"html"
	"time"

	"github.com/google/uuid"
)

type PostServiceImpl struct {
	PostServ models.Post
}

func (p *PostServiceImpl) IsPublic() bool {
	return p.PostServ.Privacy == models.PublicPrivacy
}

func (p *PostServiceImpl) IsPrivate() bool {
	return p.PostServ.Privacy == models.PrivatePrivacy
}
func (p *PostServiceImpl) IsAlmostPrivate() bool {
	return p.PostServ.Privacy == models.AlmostPrivatePrivacy
}

func PostPrivacyFromString(s string) (models.PostPrivacy, error) {
	switch s {
	case "public":
		return models.PublicPrivacy, nil
	case "private":
		return models.PrivatePrivacy, nil
	case "almost_private":
		return models.AlmostPrivatePrivacy, nil
	default:
		return "", fmt.Errorf("invalid privacy level: %s", s)
	}
}

func (p *PostServiceImpl) CreatePost(db *sql.DB) error {
	p.PostServ.ID = uuid.New()
	p.PostServ.CreatedAt = time.Now()
	p.PostServ.UpdatedAt = time.Now()

	query := `INSERT INTO posts (id, user_id, title, content, post_image, privacy, created_at, updated_at) VALUES (?, ?, ?, ?,?,?,?,?)`

	stmt, err := db.Prepare(query)
	if err != nil {
		return fmt.Errorf("unable to prepare the query: %v", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		p.PostServ.ID,
		p.PostServ.UserID.String(),
		html.EscapeString(p.PostServ.Title),
		html.EscapeString(p.PostServ.Content),
		html.EscapeString(p.PostServ.PostImage),
		p.PostServ.Privacy,
		p.PostServ.CreatedAt,
		p.PostServ.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("error inserting post: %v", err)
	}
	return nil
}
