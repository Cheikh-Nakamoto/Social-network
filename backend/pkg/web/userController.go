package web

import (
	"backend/pkg/dto"
	"backend/pkg/service/impl"
	"backend/pkg/session"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type UserController struct {
	UserService impl.UserServiceImpl
}

// route : nature-profil

func (c *UserController) ChangeNatureProfile(w http.ResponseWriter, r *http.Request) {
	type UserProfile struct {
		Nature bool `json:"nature"`
		UserId int  `json:"user_id"`
	}
	var natureProfile UserProfile
	if err := json.NewDecoder(r.Body).Decode(&natureProfile); err != nil {
		fmt.Println("error de decodage : ", err, r.Body)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	bools, err := c.UserService.ChangeNatureProfile(natureProfile.Nature, natureProfile.UserId)
	if err != nil {
		fmt.Println("error in user service: ", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(bools)

}

// Register Create new user controller
func (c *UserController) Register(w http.ResponseWriter, r *http.Request) {

	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/register" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var userDTO dto.UserDTO
	if err := json.NewDecoder(r.Body).Decode(&userDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = c.UserService.CreateUser(&userDTO)
	if err != nil {
		fmt.Println("error :", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("ici !!!")
	w.WriteHeader(http.StatusCreated)
}

func (c *UserController) Login(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/login" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var credentials struct {
		Identifiant string `json:"email" db:"credential"`
		Password    string `json:"password" db:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userDTO, err := c.UserService.Connection(credentials.Identifiant, credentials.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// I will add the token generation here
	sessionToken, err := c.UserService.CreateSession(userDTO)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	session.SetSessionCookie(w, sessionToken)
	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	// json.NewEncoder(w).Encode(userDTO)
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"token":  sessionToken,
		"user":   userDTO,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *UserController) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPut {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/profile-update/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	id, err := utils.ExtractIDFromRequest(r)
	fmt.Println("upd")
	if err != nil {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	limit, err := c.UserService.CountUsers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if id > limit {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	var userDTO dto.UserDTO
	if err := json.NewDecoder(r.Body).Decode(&userDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = c.UserService.UpdateProfile(id, &userDTO)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (c *UserController) GetProfile(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/profile/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	id, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userDTO, err := c.UserService.GetProfile(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	//err = json.NewEncoder(w).Encode(userDTO)
	if userDTO != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status": http.StatusOK,
			"user":   userDTO,
		})
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "No user found",
		})
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *UserController) IsUserOnline(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/is_online" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var token struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&token); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	/*token, err := session.GetSessionTokenFromRequest(r)
	if err != nil {
		utils.LoggerError.Println(utils.Error, http.StatusUnauthorized, "-", "Unauthorized"+utils.Reset)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}*/

	isOnline, err := c.UserService.IsUserOnline(token.Token)
	if err != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "offline",
			"is_online": isOnline,
			"message":   err.Error(),
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "online",
		"is_online": isOnline,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *UserController) Logout(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/logout" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	var token struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&token); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = c.UserService.Logout(token.Token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Clear the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Unix(0, 0), // Expire the cookie immediately
		HttpOnly: true,
	})

	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Logged out successfully",
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *UserController) Users(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/users" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	users, err := c.UserService.GetAllUsers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	// err = json.NewEncoder(w).Encode(users)
	if len(users) != 0 {
		err = json.NewEncoder(w).Encode(users)
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "empty",
			"message": "No users found",
		})
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *UserController) GetAllUsers(w http.ResponseWriter, r *http.Request) {

	fmt.Println("sear")
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Path != os.Getenv("DEFAULT_API_LINK")+"/allusers" {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	users, err := c.UserService.AllUsers()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println(users)

	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	if users != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status": http.StatusOK,
			"users":  users,
		})
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "No Users",
		})
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

func (c *UserController) GetFollowers(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/followers/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	followers, err := c.UserService.GetFollowers(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	if followers != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    http.StatusOK,
			"followers": followers,
		})
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "No followers",
		})
	}
	if err != nil {
		return
	}
}

func (c *UserController) GetFollowings(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/followings/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	followings, err := c.UserService.GetFollowings(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	if followings != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":     http.StatusOK,
			"followings": followings,
		})
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "No followings",
		})
	}
	if err != nil {
		return
	}
}

func (c *UserController) GetFriends(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/friends/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	friends, err := c.UserService.GetFriends(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	w.WriteHeader(http.StatusOK)
	if friends != nil {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusOK,
			"friends": friends,
		})
	} else {
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  http.StatusNoContent,
			"message": "No friends",
		})
	}
	if err != nil {
		return
	}
}

func (c *UserController) GetFollowerCount(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	fmt.Println()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/follower-count/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	count, err := c.UserService.GetFollowerCount(userID)
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

func (c *UserController) GetFollowingCount(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/following-count/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	count, err := c.UserService.GetFollowingCount(userID)
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

func (c *UserController) GetFriendCount(w http.ResponseWriter, r *http.Request) {
	err := utils.Environment()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/friend-count/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	userID, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, os.Getenv("USER_ID_REQUIRED"), http.StatusBadRequest)
		return
	}

	count, err := c.UserService.GetFriendsCount(userID)
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
func (c *UserController) GetRecentPosts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("postProfil")
	err := utils.Environment()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, os.Getenv("METHOD_NOT_ALLOWED"), http.StatusMethodNotAllowed)
		return
	}

	if !strings.HasPrefix(r.URL.Path, os.Getenv("DEFAULT_API_LINK")+"/post-profile/") {
		http.Error(w, os.Getenv("NOT_FOUND"), http.StatusNotFound)
		return
	}

	// Extraire l'ID de l'utilisateur à partir de l'URL
	id, err := utils.ExtractIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Récupérer les publications récentes de l'utilisateur
	posts, err := c.UserService.GetRecentPosts(uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Envoyer les publications en réponse
	w.WriteHeader(http.StatusOK)
	w.Header().Set(os.Getenv("CONTENT_TYPE"), os.Getenv("APPLICATION_JSON"))
	err = json.NewEncoder(w).Encode(posts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// UsersRoutes Register routes
func (c *UserController) UsersRoutes(routes *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		return routes
	}

	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/register", c.Register)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/login", c.Login)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/users", c.Users)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/logout", c.Logout)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/is_online", c.IsUserOnline)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/profile/", c.GetProfile)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/profile-update/", c.UpdateProfile)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/allusers", c.GetAllUsers)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/followers/", c.GetFollowers)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/followings/", c.GetFollowings)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/follower-count/", c.GetFollowerCount)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/following-count/", c.GetFollowingCount)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/friend-count/", c.GetFriendCount)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/friends/", c.GetFriends)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/post-profile/", c.GetRecentPosts)
	routes.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/nature-profil/", c.ChangeNatureProfile)

	return routes
}
