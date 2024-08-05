package dto

import "time"

type CommentDTO struct {
	ID        int64     `json:"id"`
	UserID    string    `json:"user_id"`
	TargetId  int64 	`json:"target_id"`
	Content   string    `json:"content"`
	TargetType string `json:"target_type"`
	CreatedAt time.Time `json:"created_at"`
}

