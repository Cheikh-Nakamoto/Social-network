package web

import (
	"backend/pkg/dto"
	"backend/pkg/service"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type PostController struct {
	PostService service.PostService
}

func (c *PostController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}

	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/AllPost", c.getAllPostsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/CreatePost", c.createPostHandler)

	return mux

}

func (p *PostController) createPostHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("upp")
	var post dto.PostDTO
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		fmt.Println("error ",err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return 
	}
fmt.Println("post envoyer :",post)
	id, err := p.PostService.CreatePost(&post)
	if err != nil {
		fmt.Println("err")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	nbr, _ := strconv.Atoi(id)
	post.ID = int64(nbr)
	post.CreatedAt = time.Now()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (p *PostController) getAllPostsHandler(w http.ResponseWriter, r *http.Request) {
	posts, err := p.PostService.GetAllPosts()
	if err != nil {
		fmt.Println("Erreur lors de la recuperation des post !")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
