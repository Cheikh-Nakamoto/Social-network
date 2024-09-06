package dto

import (
	"time"
)

type PostDTO struct {
	ID         int64     `json:"id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	Image      string    `json:"image"`
	Categories string    `json:"categories"`
	GroupID 	int64     `json:"groupid"`
	IsPublic   string      `json:"ispublic"`
	UserID     string    `json:"user_id"` // Change this to int64 if you're sending a number
	CreatedAt  time.Time `json:"created_at"`
}
