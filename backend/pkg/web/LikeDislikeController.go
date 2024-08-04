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
	targetIDStr := r.URL.Query().Get("target_id")
	targetType := r.URL.Query().Get("target_type")
	targetID, err := strconv.ParseInt(targetIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid target ID", http.StatusBadRequest)
		return
	}

	likes, err := c.LikeDislikeService.GetLikes(targetID, targetType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(likes)
}

func (c *LikeDislikeController) getTargetDislikesHandler(w http.ResponseWriter, r *http.Request) {
	targetIDStr := r.URL.Query().Get("target_id")
	targetType := r.URL.Query().Get("target_type")
	targetID, err := strconv.ParseInt(targetIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid target ID", http.StatusBadRequest)
		return
	}

	dislikes, err := c.LikeDislikeService.GetDislikes(targetID, targetType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dislikes)
}
