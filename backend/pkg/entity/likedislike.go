package entity

type LikeDislike struct {
	ID        int64  `json:"id" db:"id"`
	UserID    string `json:"user_id" db:user_id"`
	TargetID  int64  `json:"target_id" db:"target_id"` // Can be either post ID or comment ID
	TargetType string `json:"target_type" db:"target_type"` // "post" or "comment"
	Like      bool   `json:"like"` // true for like, false for dislike
}
