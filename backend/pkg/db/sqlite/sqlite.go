package sqlite

import (
	"backend/pkg"
	"bufio"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Database struct {
	db *sql.DB
}

type Migration struct {
	FileName string
	Content  string
}

func (d *Database) GetDB() *sql.DB {
	return d.db
}

func (d *Database) Close() {
	err := d.GetDB().Close()
	if err != nil {
		log.Printf("Error closing database connection\nCaused by: %v", err)
		return
	}
}

func Connect() (*Database, error) {
	args := os.Args
	err1 := pkg.Environment()
	if err1 != nil {
		return nil, err1
	}
	db, err := sql.Open(os.Getenv("DB_DRIVER"), os.Getenv("DB_CONNECTION"))
	fmt.Println(os.Getenv("DB_CONNECTION"))
	if err != nil {
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

	if len(args) < 2 {
		fmt.Println("Lancement sans modification de la base de données", args)
	} else {
		fmt.Printf("Lancement avec modification de la base de données: %s\n", args[1])
		opt := Option(args[1])
		path := os.Getenv("MIGRATION")
		files, err := readMigrations(path, opt)
		if err != nil {
			fmt.Println("erreur sur le chemin du dossier")
			return nil, err
		}
		err = executeMigrations(db, files)
		if err != nil {
			fmt.Println("erreur sur la migration de la base de données")
			return nil, err
		}
	}

	log.Println("Connected to the database")
	return &Database{db: db}, nil
}

func readMigrations(dir string, suffix string) ([]Migration, error) {
	var migrations []Migration
	currentDir, _ := os.Getwd()
	files, err := os.ReadDir(filepath.Join(currentDir, dir))

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	for _, file := range files {
		if !file.IsDir() && useopt(file.Name(), suffix) {
			content, err := readFile(filepath.Join(dir, file.Name()))
		
			if err != nil {
				return nil, err
			}
			migrations = append(migrations, Migration{FileName: file.Name(), Content: content})
		}
	}

	return migrations, nil
}

func Option(str string) string {
	if str == "up" {
		return str
	} else if str == "down" {
		return str
	}
	return "up"
}

// readFile reads the content of a file
func readFile(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	var content strings.Builder
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		content.WriteString(scanner.Text() + "\n")
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return content.String(), nil
}

func useopt(str, opt string) bool {
	li := strings.Split(str, ".")
	if len(li) == 3 {
		if li[1] == opt {
			return true
		}
	}
	return false
}

// executeMigrations executes the content of the migration files in the database
func executeMigrations(db *sql.DB, migrations []Migration) error {
	if len(migrations) == 0 {
		fmt.Println("No migrations found")
		return nil
	}
	for _, migration := range migrations {
		fmt.Printf("Executing migration: %s\n", migration.FileName)
		_, err := db.Exec(migration.Content)
		if err != nil {
			fmt.Println("error executing migration %s: %v", migration.FileName, err)
			return fmt.Errorf("error executing migration %s: %v", migration.FileName, err)
		}
	}
	return nil
}
