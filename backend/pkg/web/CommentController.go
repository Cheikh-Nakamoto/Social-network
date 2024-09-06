package web

import (
	"backend/pkg/dto"
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/google/uuid"
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
	err := r.ParseMultipartForm(10 << 20) // Limite à 10MB
	if err != nil {
		http.Error(w, "Erreur lors du parsing du formulaire", http.StatusBadRequest)
		return
	}

	userIDStr := r.FormValue("user_id")
	targetIDStr := r.FormValue("target_id")
	content := r.FormValue("content")
	targetType := r.FormValue("target_type")

	if userIDStr == "" || targetIDStr == "" || content == "" || targetType == "" {
		http.Error(w, "Champs manquants", http.StatusBadRequest)
		return
	}
	log.Println("user_id:", userIDStr)
	log.Println("target_id:", targetIDStr)
	log.Println("content:", content)
	log.Println("target_type:", targetType)

	targetID, err := strconv.ParseInt(targetIDStr, 10, 64)
	if err != nil {
		http.Error(w, "target_id invalide", http.StatusBadRequest)
		return
	}

	// Gestion de l'image
	var imagePath string
	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		// Générer un nom de fichier unique pour l'image
		fileName := fmt.Sprintf("%s%s", uuid.New().String(), filepath.Ext(handler.Filename))
		imagePath = "./public/" + fileName

		f, err := os.Create(imagePath)
		if err != nil {
			http.Error(w, "Erreur lors de la sauvegarde de l'image", http.StatusInternalServerError)
			return
		}
		defer f.Close()
		_, err = io.Copy(f, file)
		if err != nil {
			http.Error(w, "Erreur lors de la sauvegarde de l'image", http.StatusInternalServerError)
			return
		}
	} else {
		// Si aucune image n'est fournie
		imagePath = ""
	}

	// Créer le DTO du commentaire
	comment := dto.CommentDTO{
		UserID:     userIDStr,
		TargetId:   targetID,
		Content:    content,
		TargetType: targetType,
		Image:      imagePath,
		CreatedAt:  time.Now(),
	}

	// Validation du type de target
	if comment.TargetType != "comment" && comment.TargetType != "post" {
		http.Error(w, "Le type de target ne peut être que 'comment' ou 'post'", http.StatusBadRequest)
		return
	}

	id, err := c.CommentService.CreateComment(&comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	comment.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

func (c *CommentController) getAllCommentsHandler(w http.ResponseWriter, r *http.Request) {
	comments, err := c.CommentService.GetAllComments()

	if err != nil {
		fmt.Println("error: ", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (c *CommentController) deleteCommentHandler(w http.ResponseWriter, r *http.Request) {
	// idStr := r.URL.Query().Get("id")
	// id, err := strconv.Atoi(idStr)
	// if err != nil {
	// 	http.Error(w, "Invalid comment ID", http.StatusBadRequest)
	// 	return
	// }

	// err = c.CommentService.DeleteComment(int64(id))
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	w.WriteHeader(http.StatusNoContent)
}
