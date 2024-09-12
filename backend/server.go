package main

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/global"
	"backend/pkg/middleware"
	"backend/pkg/repository"
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"backend/pkg/web"
	"errors"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Start the server
	err := StartServer(os.Args[1:])
	if err != nil {
		log.Println(err)
		return
	}
}

func StartServer(tab []string) error {
	// Check arguments
	if len(tab) != 0 {
		return errors.New("too many arguments")
	}

	// Check if the .env file exists
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		return errors.New("the .env file does not exist")
	}

	// Read the .env file
	err := utils.Environment()
	if err != nil {
		return err
	}

	global.DBGlobal, err = sqlite.Connect()
	if err != nil {
		return err
	}
	defer global.DBGlobal.Close()

	if err := sqlite.Migrate(global.DBGlobal.GetDB()); err != nil {
		return err
	}

	// Create a new ServerMux
	mux := http.NewServeMux()

	// Initializing repositories
	userRepo := repository.NewUserRepoImpl(*global.DBGlobal)
	// followRepo := repository.NewFollowRepoImpl(*global.DBGlobal)
	groupRepo := repository.NewGroupRepoImpl(*global.DBGlobal)
	postRepo := repository.NewPostRepoImpl(*global.DBGlobal)
	commentRepo := repository.NewCommentRepoImpl(*global.DBGlobal)
	likeDislikeRepo := repository.NewLikeDislikeRepoImpl(*global.DBGlobal)
	followRepo := repository.NewFollowRepoImpl(*global.DBGlobal)

	// Initializing services
	userService := impl.UserServiceImpl{
		Repository: userRepo,
	}
	// followService := impl.FollowServiceImpl{Repository: followRepo}
	groupService := impl.GroupServiceImpl{
		Repository: groupRepo,
	}
	postService := impl.PostServiceImpl{
		Repository: postRepo,
	}
	followService := impl.FollowServiceImpl{Repository: followRepo}
	commentService := impl.CommentServiceImpl{
		Repository: commentRepo,
	}
	likeDislikeService := impl.LikeDislikeServiceImpl{
		Repository: likeDislikeRepo,
	}
	chatControler := web.ChatControler{}

	// Initializing controllers
	userController := web.UserController{
		UserService: userService,
	}
	// followController := web.FollowController{FollowService: followService}
	groupController := web.GroupController{
		GroupService: groupService,
	}
	postController := web.PostController{
		PostService: &postService,
	}
	commentController := web.CommentController{
		CommentService: commentService,
	}
	likedislikeController := web.LikeDislikeController{
		LikeDislikeService: likeDislikeService,
	}
	followController := web.FollowController{FollowService: followService}

	// Routes
	mux = userController.UsersRoutes(mux)
	mux = followController.FollowsRoutes(mux)
	mux = groupController.RegisterRoutes(mux)
	mux = postController.RegisterRoutes(mux)
	mux = web.RegisterRoutes(mux)
	mux = commentController.RegisterRoutes(mux)
	mux = likedislikeController.RegisterRoutes(mux)
	mux = chatControler.RegisterRoutes(mux)
	// Serve static files from the public directory
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("./public"))))
	mux.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))
	// Create a new handler
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		_, err := w.Write([]byte("Hello Janel"))
		if err != nil {
			return
		}
	})

	// Add the middleware
	wrappedMux := middleware.LoggingMiddleware(mux)
	wrappedMux = middleware.CORSMiddleware(wrappedMux)
	// wrappedMux = pkg.AuthMiddleware(wrappedMux)
	wrappedMux = middleware.ErrorMiddleware(wrappedMux)

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
