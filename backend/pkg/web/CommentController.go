package web

import (
	"backend/pkg/dto"
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
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
		fmt.Println("Invalid request payload",err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if comment.TargetType != "comment" && comment.TargetType != "post"{
		fmt.Println("Le type de target ne peut etre que comment")
        http.Error(w, "Le type de target ne peut etre que comment", http.StatusBadRequest)
        return
	}
	fmt.Println("target type controller :", comment.TargetType)
	id, err := c.CommentService.CreateComment(&comment)
	if err != nil {
		fmt.Println("Erreur lors de la creation du commentaire ,",err)
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
