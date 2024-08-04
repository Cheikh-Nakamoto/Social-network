package dto

import "time"

type CommentDTO struct {
	ID        int64     `json:"id"`
	UserID    string    `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

