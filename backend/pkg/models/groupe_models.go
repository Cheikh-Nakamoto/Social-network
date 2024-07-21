package models

import "time"

type Group struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Owner       int       `json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type GroupMember struct {
	UserID   int       `json:"user_id"`
	GroupID  int       `json:"group_id"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}
