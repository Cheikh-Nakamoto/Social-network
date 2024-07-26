package web

import (
	"backend/pkg/dto"
	"backend/pkg/service"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PostController struct {
	PostService service.PostService
}

func (p *PostController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	mux.HandleFunc("/posts", p.handlePosts)
	return mux
}

func (p *PostController) handlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		p.getAllPostsHandler(w, r)
	case http.MethodPost:
		p.createPostHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func (p *PostController) createPostHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("upp")
	var post dto.PostDTO
	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	id, err := p.PostService.CreatePost(&post)
	if err != nil {
		fmt.Println("err")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	post.ID = id
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	json.NewEncoder(w).Encode(post)
	w.WriteHeader(http.StatusCreated)
}

func (p *PostController) getAllPostsHandler(w http.ResponseWriter, r *http.Request) {
	_ = r
	posts, err := p.PostService.GetAllPosts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
