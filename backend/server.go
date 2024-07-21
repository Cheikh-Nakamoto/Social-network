package main

import (
	"backend/pkg"
	"backend/pkg/contollers"
	"backend/pkg/db/sqlite"
	"errors"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
	"os"
)

// Route defines a single route, e.g. a human readable name, HTTP method and the pattern the function to execute
type Route struct {
	Name    string
	Method  string
	Pattern string
	Handler http.HandlerFunc
}

// Routes is a slice of Route
type Routes []Route

// routes contains the list of routes and methods
var routes = Routes{
	Route{"Index", "GET", "/", indexHandler},
	Route{"Posts", "GET", "/posts", postsHandler},
	Route{"Create_groupe", "POST", "/create_post", create_group},
}

func main() {
	// Start the server
	err := StartServer(os.Args[1:])
	if err != nil {
		log.Println(err)
		return
	}
}

func StartServer(args []string) error {

	// Check if the .env file exists
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		return errors.New("the .env file does not exist")
	}

	// Read the .env file
	err := pkg.Environment()
	if err != nil {
		return err
	}

	_, err = sqlite.Connect()
	if err != nil {
		return err
	}

	// Create a new ServerMux
	mux := http.NewServeMux()

	// Register routes
	for _, route := range routes {
		mux.HandleFunc(route.Pattern, route.Handler)
	}

	// Add the middleware
	wrappedMux := pkg.LoggingMiddleware(mux)
	wrappedMux = pkg.CORSMiddleware(wrappedMux)
	wrappedMux = pkg.ErrorMiddleware(wrappedMux)

	// Set the server structure
	server := &http.Server{
		Addr:    ":" + os.Getenv("PORT"),
		Handler: wrappedMux,
	}

	// Start the server
	log.Println("The server is listening at http://localhost:" + os.Getenv("PORT"))
	err = server.ListenAndServe()
	return err
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	_, err := w.Write([]byte("Hello Janel"))
	if err != nil {
		return
	}
}

func postsHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/posts" {
		http.NotFound(w, r)
		return
	}

	_, err := w.Write([]byte("Posts here"))
	if err != nil {
		return
	}
}

func create_group(w http.ResponseWriter, r *http.Request) {
	contollers.CreateGroup(w, r)
}
