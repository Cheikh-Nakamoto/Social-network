package entity

import "time"

// Comment represents a comment on a post
type Comment struct {
	ID        int64     `json:"id"`
	UserID    string    `json:"user_id"`
	TargetId  int64 	`json:"target_id"`
	Content   string    `json:"content"`
	TargetType string `json:"target_type"`
	CreatedAt time.Time `json:"created_at"`
}
