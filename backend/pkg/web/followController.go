package web

import (
	"backend/pkg/service/impl"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type FollowController struct {
	FollowService impl.FollowServiceImpl
}

func (c *FollowController) FollowUser(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/follow" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		FollowerID uint `json:"follower_id"`
		FolloweeID uint `json:"followee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.FollowerID == follow.FolloweeID {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "You cannot follow yourself",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	err = c.FollowService.FollowUser(follow.FollowerID, follow.FolloweeID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": err.Error(),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  http.StatusOK,
		"message": "Follow request sent",
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *FollowController) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodDelete {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/unfollow" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		FollowerID uint `json:"follower_id" db:"follower_id"`
		FolloweeID uint `json:"followee_id" db:"followee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.FollowerID == follow.FolloweeID {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "Cannot unfollow yourself",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	err = c.FollowService.UnfollowUser(follow.FollowerID, follow.FolloweeID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": err.Error(),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  http.StatusOK,
		"message": "Unfollow request sent",
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *FollowController) AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPut {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/accept" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		FollowerID uint `json:"follower_id"`
		FolloweeID uint `json:"followee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.FollowerID == follow.FolloweeID {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "You cannot accept your own request",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	check, err := c.FollowService.FindFollow(follow.FollowerID, follow.FolloweeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if check.Status != "pending" {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "Request is not pending",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	//err = c.FollowService.AcceptFollowRequest(follow.ID)
	err = c.FollowService.AcceptFollowRequest(check.ID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": err.Error(),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  http.StatusOK,
		"message": "Follow request accepted",
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *FollowController) DeclineFollowRequest(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPut {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/decline" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		FollowerID uint `json:"follower_id"`
		FolloweeID uint `json:"followee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.FollowerID == follow.FolloweeID {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "You cannot accept your own request",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	check, err := c.FollowService.FindFollow(follow.FollowerID, follow.FolloweeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if check.Status != "pending" {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "Request is not pending",
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	err = c.FollowService.DeclineFollowRequest(check.ID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": err.Error(),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  http.StatusOK,
		"message": "Follow request declined",
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *FollowController) CountAllFollows(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		fmt.Println("mimaod")
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/follow-count" {
		fmt.Println("mimaod1")
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	count, err := c.FollowService.CountAllFollows()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status": http.StatusOK,
		"count":  count,
	})
	if err != nil {
		return
	}
}

func (c *FollowController) AreFollowing(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/are-following" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		FollowerID uint `json:"follower_id"`
		FolloweeID uint `json:"followee_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.FollowerID == follow.FolloweeID {
		http.Error(w, "Cannot follow yourself", http.StatusBadRequest)
		return
	}

	isFollowing, err := c.FollowService.AreFollowing(follow.FollowerID, follow.FolloweeID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":        http.StatusNoContent,
			"are_following": isFollowing,
			"message":       err.Error(),
		})
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":        http.StatusOK,
		"are_following": isFollowing,
	})
	if err != nil {
		return
	}
}

func (c *FollowController) AreWeFriends(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/are-we-friends" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var follow struct {
		UserID   uint `json:"user_id"`
		FriendID uint `json:"friend_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&follow); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if follow.UserID == follow.FriendID {
		http.Error(w, "Cannot follow yourself", http.StatusBadRequest)
		return
	}

	isFriends, err := c.FollowService.AreWeFriends(follow.UserID, follow.FriendID)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":      http.StatusNoContent,
			"are_friends": isFriends,
			"message":     err.Error(),
		})
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      http.StatusOK,
		"are_friends": isFriends,
	})
	if err != nil {
		return
	}
}

func (c *FollowController) FollowsRoutes(routes *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		return routes
	}

	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/follow", c.FollowUser)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/unfollow", c.UnfollowUser)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/accept", c.AcceptFollowRequest)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/decline", c.DeclineFollowRequest)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/follow-count", c.CountAllFollows)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/are-following", c.AreFollowing)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/are-we-friends", c.AreWeFriends)

	return routes
}
