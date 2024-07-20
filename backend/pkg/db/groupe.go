package db

import (
	"backend/pkg/db/sqlite"
)

func (db *sqlite.Database) Creategroupe(name string, person_to_add []int) {
	db.GetDB().Exec("")
}
