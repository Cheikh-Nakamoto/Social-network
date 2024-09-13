package repository

import (
	"backend/pkg/db/sqlite"
)

// GroupRepoImpl is the implementation of GroupRepo
type ChatRepoImpl struct {
	db *sqlite.Database
}

// NewManager crée une nouvelle instance de Manager avec une liste de clients vide et les gestionnaires d'événements configurés.
type ChatRepo interface {
}
