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
	GroupId     int       `json:"group_id"`
	UserID      int       `json:"user_id"`
	HourStart   time.Time `json:"hour_start"`
    HourEnd     time.Time `json:"hour_end"`
}

type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	GroupID   int       `json:"group_id"`  // omitempty pour ignorer si vide
	TargetID  int       `json:"target_id"` // omitempty pour ignorer si vide
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
	Role string `json:"role"` 
}

type Data struct{
	UserID int `json:"user_id"`
	GroupID int `json:"group_id"`
}