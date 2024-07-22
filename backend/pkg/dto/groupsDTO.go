package dto


import (
    "time"
)

type GroupDTO struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Owner 		string 	  `json:"owner"`
	CreatedAt   time.Time `json:"created_at"`

}
