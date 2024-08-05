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
)

type LikeDislikeController struct {
	LikeDislikeService impl.LikeDislikeServiceImpl
}

func (c *LikeDislikeController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}

	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/likeTarget", c.likeTargetHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/dislikeTarget", c.dislikeTargetHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/targetLikes", c.getTargetLikesHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/targetDislikes", c.getTargetDislikesHandler)

	return mux
}

func (c *LikeDislikeController) likeTargetHandler(w http.ResponseWriter, r *http.Request) {
	var likeDislike dto.LikeDislikeDTO
	err := json.NewDecoder(r.Body).Decode(&likeDislike)
	if err != nil {
		fmt.Println("Invalid request payload", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err = c.LikeDislikeService.LikeTarget(&likeDislike)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (c *LikeDislikeController) dislikeTargetHandler(w http.ResponseWriter, r *http.Request) {
	var likeDislike dto.LikeDislikeDTO
	err := json.NewDecoder(r.Body).Decode(&likeDislike)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err = c.LikeDislikeService.DislikeTarget(&likeDislike)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (c *LikeDislikeController) getTargetLikesHandler(w http.ResponseWriter, r *http.Request) {
	targetType := r.URL.Query().Get("target_type")

	likes, err := c.LikeDislikeService.GetLikes(targetType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(likes)
}

func (c *LikeDislikeController) getTargetDislikesHandler(w http.ResponseWriter, r *http.Request) {
	targetType := r.URL.Query().Get("target_type")
	dislikes, err := c.LikeDislikeService.GetDislikes(targetType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dislikes)
}
