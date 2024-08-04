package dto

type LikeDislikeDTO struct {
	ID         int64  `json:"id"`
	UserID     string `json:"user_id"`
	TargetID   int64  `json:"target_id"` // Can be either post ID or comment ID
	TargetType string `json:"target_type"` // "post" or "comment"
	Like       bool   `json:"like"` // true for like, false for dislike
}
