package repository

import (
	"backend/pkg/db/sqlite"
	"fmt"
	"time"
)

// Group represents the group entity
type Group struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Owner       string    `json:"owner"`
	CreatedAt   time.Time `json:"created_at"`
}

// GroupRepoImpl is the implementation of GroupRepo
type GroupRepoImpl struct {
	db *sqlite.Database
}

// NewGroupRepoImpl creates a new instance of GroupRepoImpl
func NewGroupRepoImpl(db sqlite.Database) *GroupRepoImpl {
	return &GroupRepoImpl{db: &db}
}

// CreateGroup creates a new group in the database
func (repo *GroupRepoImpl) CreateGroup(name, description, owner string) (int, error) {
	stmt := `INSERT INTO groups (name, description, owner, created_at) VALUES (?, ?, ?, ?) RETURNING id`
	var id int
	err := repo.db.GetDB().QueryRow(stmt, name, description, owner, time.Now()).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("CreateGroup: %v", err)
	}
	return id, nil
}

// AddMember adds a member to a group
func (repo *GroupRepoImpl) AddMember(userID, groupID int, role string) error {
	stmt := `INSERT INTO group_members (user_id, group_id, role, joined_at) VALUES (?, ?, ?, ?)`
	_, err := repo.db.GetDB().Exec(stmt, userID, groupID, role, time.Now())
	if err != nil {
		return fmt.Errorf("AddMember: %v", err)
	}
	return nil
}

// EjectMember removes a member from a group
func (repo *GroupRepoImpl) EjectMember(userID, groupID int) error {
	stmt := `DELETE FROM group_members WHERE user_id = ? AND group_id = ?`
	_, err := repo.db.GetDB().Exec(stmt, userID, groupID)
	if err != nil {
		return fmt.Errorf("EjectMember: %v", err)
	}
	return nil
}

// DeleteGroup deletes a group and its members from the database
func (repo *GroupRepoImpl) DeleteGroup(groupID int) error {
	// Supprimer les membres du groupe
	stmt := `DELETE FROM group_members WHERE group_id = ?`
	_, err := repo.db.GetDB().Exec(stmt, groupID)
	if err != nil {
		return fmt.Errorf("DeleteGroup members: %v", err)
	}

	// Supprimer le groupe
	stmt = `DELETE FROM groups WHERE id = ?`
	_, err = repo.db.GetDB().Exec(stmt, groupID)
	if err != nil {
		return fmt.Errorf("DeleteGroup: %v", err)
	}
	return nil
}

// GetGroupByID retrieves a group by its ID
func (repo *GroupRepoImpl) GetGroupByID(id int) (*Group, error) {
	group := new(Group)
	err := repo.db.GetDB().QueryRow("SELECT id, name, description, owner, created_at FROM groups WHERE id = ?", id).Scan(&group.ID, &group.Name, &group.Description, &group.Owner, &group.CreatedAt)
	return group, err
}

func (repo *GroupRepoImpl) GetAllGroups() ([]Group, error) {
	rows, err := repo.db.GetDB().Query(`SELECT id, name, description, owner, created_at FROM groups`)
	if err != nil {
		return nil, fmt.Errorf("GetAllGroups: %v", err)
	}
	defer rows.Close()

	var groups []Group
	for rows.Next() {
		var group Group
		if err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.Owner, &group.CreatedAt); err != nil {
			return nil, fmt.Errorf("GetAllGroups: %v", err)
		}
		groups = append(groups, group)
	}

	return groups, nil
}
