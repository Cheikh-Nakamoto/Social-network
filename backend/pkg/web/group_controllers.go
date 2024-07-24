package web

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/pkg/dto"
	"backend/pkg/service/impl"
	"backend/pkg/utils"
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
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/add_member", gc.AddMemberHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/eject_member", gc.EjectMemberHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/delete", gc.DeleteGroupHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups", gc.GetAllGroupsHandler)
	mux.HandleFunc(os.Getenv("DEFAULT_API_LINK")+"/groups/", gc.GetGroupByIDHandler)
	return mux
}

// CreateGroupHandler handles the creation of a new group
func (gc *GroupController) CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	var group dto.GroupDTO

	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		fmt.Println("error: ", err,r.Body)
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
		UserID  int    `json:"user_id"`
		GroupID int    `json:"group_id"`
		Role    string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := gc.GroupService.AddMember(data.UserID, data.GroupID, data.Role); err != nil {
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
