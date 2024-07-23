package handlers

import (
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"log"
	"net/http"
	"os"
)

type PostController struct {
	PostService impl.PostServiceImpl
}

func (p *PostController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/posts/create", p.CreatePostHandler)
	return mux
}
func (pc *PostController) CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	// Implement creating a new post

}
