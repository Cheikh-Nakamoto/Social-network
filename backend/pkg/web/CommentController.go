package web

import (
	"backend/pkg/dto"
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type CommentController struct {
	CommentService impl.CommentServiceImpl
}

func (c *CommentController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}

	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/AllComments", c.getAllCommentsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/CreateComment", c.createCommentHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/DeleteComment", c.deleteCommentHandler)

	return mux
}

func (c *CommentController) createCommentHandler(w http.ResponseWriter, r *http.Request) {
	var comment dto.CommentDTO
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	id, err := c.CommentService.CreateComment(&comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	comment.ID = id
	comment.CreatedAt = time.Now()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

func (c *CommentController) getAllCommentsHandler(w http.ResponseWriter, r *http.Request) {
	comments, err := c.CommentService.GetAllComments()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (c *CommentController) deleteCommentHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid comment ID", http.StatusBadRequest)
		return
	}

	err = c.CommentService.DeleteComment(int64(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
