package sqlite

import (
	"backend/pkg/utils"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"

	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// Database struct
type Database struct {
	db *sql.DB
}

// GetDB function
func (d *Database) GetDB() *sql.DB {
	return d.db
}

// Close function
func (d *Database) Close() {
	err := d.GetDB().Close()
	if err != nil {
		log.Printf("Error closing database connection\nCaused by: %v", err)
		return
	}
}

// Connect function
func Connect() (*Database, error) {
	err1 := utils.Environment()
	db, err := sql.Open(os.Getenv("DB_DRIVER"), os.Getenv("DB_CONNECTION"))
	if err != nil || err1 != nil {
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		err := db.Close()
		if err != nil {
			log.Printf("Error closing database connection\nCaused by: %v", err)
		}
		return nil, err
	}
	log.Println("Connected to the database")
	return &Database{db: db}, nil
}

// Migrate function
func Migrate(db *sql.DB) error {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return err
	}

	fmt.Println("migration ditrectory :", os.Getenv("DB_MIGRATION_PATH"))
	m, err := migrate.NewWithDatabaseInstance("file://"+os.Getenv("DB_MIGRATION_PATH"), "sqlite3", driver)
	if err != nil {
		fmt.Println("error migration", err)
		return err
	}

	_, err = db.Exec("PRAGMA journal_mode=WAL")
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	// log.Println("Database migrated")
	return nil
}

func AddFollow(db *sql.DB, followerID, followeeID int, status string) error {
	query := `
    INSERT INTO follows (follower_id, followee_id, status)
    VALUES (?, ?, ?)
    `

	// Si aucun statut n'est spécifié, définir à "pending"
	if status == "" {
		status = "pending"
	}

	// Exécute la requête d'insertion
	_, err := db.Exec(query, followerID, followeeID, status)
	if err != nil {
		return fmt.Errorf("erreur lors de l'ajout du suivi : %v", err)
	}

	return nil
}
