package dto

import (
	"time"
)

type GroupDTO struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Owner       string    `json:"owner"`
	Image       string    `json:"image"`
	CreatedAt   time.Time `json:"created_at"`
}

type Events struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description,omitempty"`
    Owner       string    `json:"owner"`
    Image       string    `json:"image"`
    GroupId     int       `json:"group_id"`
    UserID      int       `json:"user_id"`
    CreatedAt   time.Time `json:"created_at"`
}
