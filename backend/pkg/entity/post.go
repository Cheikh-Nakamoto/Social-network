package entity

import (
	"time"
)

type PostPrivacy string
type Posts []Post

const (
	PublicPrivacy        PostPrivacy = "public"
	PrivatePrivacy       PostPrivacy = "private"
	AlmostPrivatePrivacy PostPrivacy = "almostPrivate"
)

type Post struct {
	ID        string      `json:"id" db:"type:string;primary key"`
	UserID    string      `json:"user_id" db:"type:string"`
	Title     string      `json:"title" db:"type:varchar(255)"`
	Content   string      `json:"content" db:"type:text"`
	PostImage string      `json:"post_image" db:"type:varchar(255)"`
	Privacy   PostPrivacy `json:"privacy"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}
