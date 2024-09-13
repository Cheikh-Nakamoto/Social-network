package dto

import "time"

type CommentDTO struct {
	ID         int64     `json:"id"`
	UserID     string    `json:"user_id"`
	TargetId   int64     `json:"target_id"`
	Content    string    `json:"content"`
	Image      string    `json:"image"`
	TargetType string    `json:"target_type"`
	CreatedAt  time.Time `json:"created_at"`
}

type SendCommentDTO struct {
	Comments       map[int][]CommentDTO
	CommentsLength map[int]int
}
