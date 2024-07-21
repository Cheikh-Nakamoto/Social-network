package contollers

import (
	"backend/pkg/db"
	"backend/pkg/db/sqlite"
	"backend/pkg/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	var group models.Group
	_ = json.NewDecoder(r.Body).Decode(&group)
	group.CreatedAt = time.Now()
	DB, _ := sqlite.Connect()
	err := DB.GetDB().QueryRow(db.CreateGroup, group.Name, group.Description, group.CreatedAt).Scan(&group.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(group)
}

func GetGroup(w http.ResponseWriter, r *http.Request) {
	params := "12"
	id, _ := strconv.Atoi(params)
	var group models.Group
	DB, _ := sqlite.Connect()
	err := DB.GetDB().QueryRow(db.GetGroupByID, id).Scan(
		&group.ID, &group.Name, &group.Description, &group.CreatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(group)
}

func UpdateGroup(w http.ResponseWriter, r *http.Request) {
	params := "12"
	id, _ := strconv.Atoi(params)
	var group models.Group
	_ = json.NewDecoder(r.Body).Decode(&group)
	DB, _ := sqlite.Connect()
	_, err := DB.GetDB().Exec(db.UpdateGroup, group.Name, group.Description, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	group.ID = id
	json.NewEncoder(w).Encode(group)
}

func DeleteGroup(w http.ResponseWriter, r *http.Request) {
	params := "12"
	id, _ := strconv.Atoi(params)
	DB, _ := sqlite.Connect()
	_, err := DB.GetDB().Exec(db.DeleteGroup, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
