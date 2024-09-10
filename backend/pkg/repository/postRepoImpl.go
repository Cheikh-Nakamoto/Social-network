package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/entity"
	"fmt"
	"html"
	"log"
	"strconv"
	"strings"
	"time"
)

type PostRepoImpl struct {
	db *sqlite.Database
}

func NewPostRepoImpl(db sqlite.Database) *PostRepoImpl {
	return &PostRepoImpl{db: &db}
}

func (p *PostRepoImpl) Almost(userID string, postid string, almost []int) error {
	var str []string
	for _, v := range almost {
		str = append(str, strconv.Itoa(v))
	}
	userchain := strings.Join(str, ".")
	userchain += "." + userID
	stmt := `INSERT INTO almost_private ( owner, views ,post_id,created_at) VALUES ( ?, ?, ?,?)`
	_, err := p.db.GetDB().Exec(stmt, userID, userchain, postid, time.Now())
	if err != nil {
		fmt.Println("err create", err)
		return fmt.Errorf("CreatePost: %v", err)
	}
	return nil
}
func (repo *PostRepoImpl) GetAlmost(userID, postid string) ([]int, error) {
	stmt := `SELECT views FROM almost_private WHERE post_id = ? AND owner = ?`
	var liststring string
	err := repo.db.GetDB().QueryRow(stmt, postid, userID).Scan(&liststring)
	if err != nil {
		fmt.Println("error getting list", err)
		return nil, nil
	}

	var users []int
	list := strings.Split(liststring, ".")
	for _, v := range list {
		nbr, err := strconv.Atoi(v)
		if err != nil {
			return nil, fmt.Errorf("GetAlmost: %v", err)
		}
		users = append(users, nbr)
	}
	return users, nil
}

func (p *PostRepoImpl) CreatePost(userID string, title, content, Image string, IsPublic string, Groupid int64, almost []int) (string, error) {
	stmt := `INSERT INTO posts ( user_id, title, content,post_image, privacy, group_id,created_at) VALUES ( ?, ?, ?, ?,?, ?,?)`
	escapedTitle := html.EscapeString(title)
	escapedContent := html.EscapeString(content)
	// escapedImage := html.EscapeString(Image)
	log.Println(escapedTitle)
	id, err := p.db.GetDB().Exec(stmt, userID, escapedTitle, escapedContent, Image, IsPublic, Groupid, time.Now())
	if err != nil {
		fmt.Println("err create", err)
		return "", fmt.Errorf("CreatePost: %v", err)
	}
	nbr, _ := id.LastInsertId()
	fmt.Println("verify : ", IsPublic == "almost private", IsPublic, "almost private")
	if IsPublic == "almost private" {
		p.Almost(userID, strconv.Itoa(int(nbr)), almost)
	}
	return strconv.Itoa(int(nbr)), nil
}

func (p *PostRepoImpl) GetAllPosts() ([]entity.Post, error) {
	row, err := p.db.GetDB().Query(`SELECT * FROM posts WHERE group_id=? ORDER BY created_at DESC`, 0)
	if err != nil {
		fmt.Println("erreur lors de la recuperation des post")
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
			&post.Image,
			&post.GroupID,
			&post.IsPublic,
			&post.CreatedAt,
		)
		if err != nil {
			fmt.Println("erreur lor de l'affectation des donnés !", err)
			return nil, fmt.Errorf("GetAllPosts: %v", err)
		}
		posts = append(posts, post)
	}
	return posts, nil
}
func (p *PostRepoImpl) GetAllPostsByGroupID(id int) ([]entity.Post, error) {
	row, err := p.db.GetDB().Query(`SELECT * FROM posts WHERE group_id=? ORDER BY created_at DESC`, id)
	if err != nil {
		fmt.Println("erreur lors de la recuperation des post")
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
			&post.Image,
			&post.GroupID,
			&post.IsPublic,
			&post.CreatedAt,
		)
		if err != nil {
			fmt.Println("erreur lor de l'affectation des donnés !", err)
			return nil, fmt.Errorf("GetAllPosts: %v", err)
		}
		posts = append(posts, post)
	}
	return posts, nil
}

// DeletePostByID deletes a post by ID and returns the remaining posts.
func (p *PostRepoImpl) DeletePostByID(id int) ([]entity.Post, error) {
	// Exécution de la requête de suppression
	result, err := p.db.GetDB().Exec(`DELETE FROM posts WHERE id=?`, id)
	if err != nil {
		return nil, fmt.Errorf("DeletePost: %v", err)
	}

	// Vérification si la suppression a affecté une ligne
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("DeletePost: %v", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("DeletePost: no post found with id %d", id)
	}

	// Récupération de tous les posts restants après suppression
	rows, err := p.db.GetDB().Query(`SELECT id, userID, title, content, post_Image, privacy, createdAt FROM posts`)
	if err != nil {
		return nil, fmt.Errorf("GetAllPosts: %v", err)
	}
	defer rows.Close()

	var posts []entity.Post
	for rows.Next() {
		var post entity.Post
		err := rows.Scan(
			&post.ID,
			&post.UserID,
			&post.Title,
			&post.Content,
			&post.Image,
			&post.GroupID,
			&post.IsPublic,
			&post.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("GetAllPosts: %v", err)
		}
		posts = append(posts, post)
	}

	// Vérifier les erreurs de la boucle de récupération
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetAllPosts: %v", err)
	}

	return posts, nil
}
