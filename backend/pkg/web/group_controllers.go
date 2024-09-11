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

// GroupController defines the controller for group operations
type GroupController struct {
	GroupService impl.GroupServiceImpl
}

func (gc *GroupController) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/create", gc.CreateGroupHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/joined/groups/", gc.GetAllJoinGroupsByUserIDHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/add_member", gc.AddMemberHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/eject_member", gc.EjectMemberHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/events/create", gc.CreateEventsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/events/", gc.FetchAllEventsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/delete", gc.DeleteGroupHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups", gc.GetAllGroupsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/", gc.GetGroupByIDHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/notification", gc.NotificationExists)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/notification/", gc.NotificationsByUserID)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/accept-request", gc.AddMemberBasedOnNotification)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/decline-request", gc.DeclineNotification)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/group-member", gc.ItsGroupMemberhandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/member", gc.GetUsersInGroup)

	return mux
}

// CreateGroupHandler handles the creation of a new group
func (gc *GroupController) CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	var group dto.GroupDTO

	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		fmt.Println("error: ", err, r.Body)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := gc.GroupService.CreateGroup(&group)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	group.ID = id
	group.CreatedAt = time.Now()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}

// AddMemberHandler handles adding a member to a group
func (gc *GroupController) AddMemberHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		GroupID  int    `json:"group_id"`
		UserID   int    `json:"user_id"`
		TargetID int    `json:"target_id"`
		Role     string `json:"role"`
		Username string `json : "username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("data:", data.GroupID, data.UserID, data.Role, data.Username)
	if err := gc.GroupService.AddMember(data.UserID, data.GroupID, data.TargetID, data.Role, data.Username); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// EjectMemberHandler handles ejecting a member from a group
func (gc *GroupController) EjectMemberHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		UserID  int `json:"user_id"`
		GroupID int `json:"group_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := gc.GroupService.EjectMember(data.UserID, data.GroupID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteGroupHandler handles deleting a group
func (gc *GroupController) DeleteGroupHandler(w http.ResponseWriter, r *http.Request) {
	groupID, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	if err := gc.GroupService.DeleteGroup(groupID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetAllGroupsHandler handles retrieving all groups
func (gc *GroupController) GetAllGroupsHandler(w http.ResponseWriter, r *http.Request) {
	groups, err := gc.GroupService.GetAllGroups()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// GetGroupByIDHandler handles retrieving a group by its ID
func (gc *GroupController) GetGroupByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/groups/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	group, err := gc.GroupService.GetGroupByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}

// GetAllJoinGroupsByUserIDHandler handles retrieving all groups that a user has joined
func (gc *GroupController) GetAllJoinGroupsByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	// Récupérer l'ID de l'utilisateur à partir de la requête
	fmt.Println("ici la fonction de l'utilisateur	")

	userIDStr := r.URL.Query().Get("user_id")
	fmt.Println("ici userid ___", userIDStr)
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Appeler le service pour obtenir la map des groupes que l'utilisateur a rejoints
	groupMap, err := gc.GroupService.GetAllJoinGroupByID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Envoyer la réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groupMap)
}

// CreateEventsHandler handles the creation of a new event in a group
func (gc *GroupController) CreateEventsHandler(w http.ResponseWriter, r *http.Request) {
	var event dto.Events

	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		fmt.Println("error: ", err, r.Body)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("event received: ", event)
	err := gc.GroupService.CreateEventsInGroup(event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// FetchAllEventsHandler handles retrieving all events
func (gc *GroupController) FetchAllEventsHandler(w http.ResponseWriter, r *http.Request) {

	id := r.URL.Query().Get("groupid")
	ID, err := strconv.Atoi(id)
	if err != nil || r.Method != http.MethodGet {
		http.Error(w, err.Error(), http.StatusMethodNotAllowed)
		return
	}
	events, err := gc.GroupService.GetAllEventsByGroup(ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func (gc *GroupController) NotificationExists(w http.ResponseWriter, r *http.Request) {
	type data struct {
		UserId int `json:"user_id"`
	}
	var Data data
	if err := json.NewDecoder(r.Body).Decode(&Data); err != nil {
		fmt.Println("error: ", err, r.Body)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	IsIn, err := gc.GroupService.NotificationExists(Data.UserId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(IsIn)
}

func (gc *GroupController) NotificationsByUserID(w http.ResponseWriter, r *http.Request) {
	Id ,err:= strconv.Atoi(r.URL.Query().Get("user_id"))
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	notif, err := gc.GroupService.GetNotificationsByUserID(Id)

	if err != nil {
		fmt.Println("error", err)
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notif)

}

func (gc *GroupController) AddMemberBasedOnNotification(w http.ResponseWriter, r *http.Request) {
	var notif dto.Notification
	if err := json.NewDecoder(r.Body).Decode(&notif); err != nil {
		fmt.Println("error de decodage: ", err)
		http.Error(w,  "error de decodage ", http.StatusBadRequest)
		return
	}
	fmt.Println("notification   ",notif)
	err := gc.GroupService.AddMemberBasedOnNotification(notif); 
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func (gc *GroupController) DeclineNotification(w http.ResponseWriter, r *http.Request) {
	var notif dto.Notification
	if err := json.NewDecoder(r.Body).Decode(&notif); err != nil {
		fmt.Println("error de decodage: ", err)
		http.Error(w,  "error de decodage ", http.StatusBadRequest)
		return
	}
	
	err := gc.GroupService.DeclineNotification(notif); 
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func (gc *GroupController) ItsGroupMemberhandler(w http.ResponseWriter, r *http.Request) {
	var inf dto.Data
	if err := json.NewDecoder(r.Body).Decode(&inf); err != nil {
		http.Error(w,  "error de decodage ", http.StatusBadRequest)
		return
	}
	bools,err := gc.GroupService.ItsGroupMember(inf);
	if err != nil {
		fmt.Println("error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bools)
}





func (s GroupController) GetUsersInGroup(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("group_id")
    idInt, err := strconv.Atoi(id)
    if err!= nil || r.Method!= http.MethodGet {
        http.Error(w, err.Error(), http.StatusMethodNotAllowed)
        return
    }

    users, _ := s.GroupService.GetUsersInGroup(idInt)
    if err!= nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}