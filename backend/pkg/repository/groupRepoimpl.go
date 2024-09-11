package repository

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/dto"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

// Group represents the group entity
type Group struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Owner       string    `json:"owner"`
	Image       string    `json:"image"`
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
func (repo *GroupRepoImpl) CreateGroup(name, description, owner, image string) (int, error) {
	stmt := `INSERT INTO groups (name, description, owner,image, created_at) VALUES (?, ?, ?, ?,?) RETURNING id`
	var id int
	err := repo.db.GetDB().QueryRow(stmt, name, description, owner, image, time.Now()).Scan(&id)
	if err != nil {
		fmt.Printf("CreateGroup: %v", err)
		return 0, fmt.Errorf("CreateGroup: %v", err)
	}
	return id, nil
}

// AddMember adds a member to a group
func (repo *GroupRepoImpl) AddMember(userID, groupID, targetID int, role, name string) error {
	message := ""
	if role == "member" {
		message = name + " want to join your group . Can you accept ?"
	} else if role == "admin" {
		message = name + " want to insert her group . Can you accept ?"
	} else {
		return fmt.Errorf("role : %s not allowed !", role)
	}
	check, erro := repo.CheckNotificationExists(userID, groupID, targetID, message)
	if erro != nil {
		return fmt.Errorf("Notification existe verify: %v", erro)
	}
	if check {
		return fmt.Errorf("Notification existe : %v", check)
	}

	stmt := `INSERT INTO notifications (user_id, group_id, target_id, message, is_read, created_at,role)
	VALUES (?, ?, ?,?,?,?,?);`
	_, err := repo.db.GetDB().Exec(stmt, userID, groupID, targetID, message, false, time.Now(), role)
	if err != nil {
		return fmt.Errorf("Add Notification: %v", err)
	}
	return nil
}

// CheckNotificationExists vérifie si une notification avec les mêmes userID, targetID, et message existe déjà
func (repo *GroupRepoImpl) CheckNotificationExists(userID, GroupID, targetID int, message string) (bool, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = ? AND group_id = ? AND message = ? AND target_id =?`
	var count int
	err := repo.db.GetDB().QueryRow(query, userID, GroupID, message, targetID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("CheckNotificationExists: %v", err)
	}
	fmt.Println("count: ", count)
	return count > 0, nil
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
	err := repo.db.GetDB().QueryRow("SELECT id, name, description, owner, image,created_at FROM groups WHERE id = ?", id).Scan(&group.ID, &group.Name, &group.Description, &group.Owner, &group.Image, &group.CreatedAt)
	return group, err
}

func (repo *GroupRepoImpl) GetAllGroups() ([]Group, error) {
	rows, err := repo.db.GetDB().Query(`SELECT id, name, description, owner,image, created_at FROM groups`)
	if err != nil {
		return nil, fmt.Errorf("GetAllGroups: %v", err)
	}
	defer rows.Close()

	var groups []Group
	for rows.Next() {
		var group Group
		if err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.Owner, &group.Image, &group.CreatedAt); err != nil {
			return nil, fmt.Errorf("GetAllGroups: %v", err)
		}
		groups = append(groups, group)
	}

	return groups, nil
}

// GetAllJoinGroupByID renvoie une map d'IDs de groupes associés à un booléen indiquant si l'utilisateur les a rejoints
func (repo *GroupRepoImpl) GetAllJoinGroupByID(userID int) (map[int]bool, error) {
	// Initialisation de la map
	groupsJoined := make(map[int]bool)

	// Requête pour obtenir les IDs des groupes auxquels l'utilisateur a rejoint
	stm := `SELECT group_id FROM group_members`
	stmt := `SELECT group_id FROM group_members WHERE user_id = ?`
	rows, err := repo.db.GetDB().Query(stmt, userID)
	if err != nil {
		return nil, fmt.Errorf("GetAllJoinGroupByID: %v", err)
	}
	defer rows.Close()

	// Remplir la map avec les IDs des groupes rejoints
	for rows.Next() {
		var groupID int
		if err := rows.Scan(&groupID); err != nil {
			return nil, fmt.Errorf("GetAllJoinGroupByID: %v", err)
		}
		groupsJoined[groupID] = true
	}
	rows, err = repo.db.GetDB().Query(stm)
	if err != nil {
		return nil, fmt.Errorf("GetAllJoinGroupByID: %v", err)
	}
	defer rows.Close()
	// Remplir la map avec les IDs des groupes rejoints
	for rows.Next() {
		var groupID int
		if err := rows.Scan(&groupID); err != nil {
			return nil, fmt.Errorf("GetAllJoinGroupByID: %v", err)
		}
		if !groupsJoined[groupID] {
			groupsJoined[groupID] = false
		}
	}
	// Vérification d'erreurs lors de l'itération des lignes
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("GetAllJoinGroupByID: %v", err)
	}

	return groupsJoined, nil
}

// create Events in group by ID
func (repo *GroupRepoImpl) CreateEventsInGroup(event dto.Events) error {
	// SQL query to insert an event into the database
	query := "INSERT INTO events (name, description, group_id, user_id, hour_start,hour_end) VALUES (?, ?, ?, ?, ?, ?)"

	// Execute the query
	_, err := repo.db.GetDB().Exec(query, event.Name, event.Description, event.GroupId, event.UserID, event.HourStart, event.HourEnd)
	if err != nil {
		fmt.Println("failed to create event", err)
		return errors.New("failed to create event: " + err.Error())
	}

	return nil
}

// FetchAllEvents retrieves all events from the database
func (repo *GroupRepoImpl) FetchAllEvents(id int) ([]dto.Events, error) {
	// Définir la requête SQL pour sélectionner tous les événements
	query := `SELECT id, name, description, group_id, user_id,  hour_start,hour_end FROM events WHERE group_id=?`

	// Exécuter la requête pour récupérer les lignes de la table "events"
	rows, err := repo.db.GetDB().Query(query, id)
	if err != nil {
		return nil, fmt.Errorf("FetchAllEvents: %v", err)
	}
	defer rows.Close()

	// Initialiser un tableau pour stocker tous les événements
	var events []dto.Events

	// Parcourir chaque ligne renvoyée par la requête
	for rows.Next() {
		var event dto.Events
		// Scanner les valeurs de chaque colonne dans la structure de l'événement
		err := rows.Scan(&event.ID, &event.Name, &event.Description, &event.GroupId, &event.UserID, &event.HourStart, &event.HourEnd)
		if err != nil {
			return nil, fmt.Errorf("FetchAllEvents: %v", err)
		}
		// Ajouter l'événement à la liste des événements
		events = append(events, event)
	}

	// Vérifier les erreurs potentielles rencontrées lors de l'itération sur les lignes
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("FetchAllEvents: %v", err)
	}

	// Retourner la liste des événements et une valeur d'erreur nulle
	return events, nil
}

// NotificationExists vérifie si une notification existe dans la base de données pour un user_id, target_id et/ou group_id spécifique
func (repo *GroupRepoImpl) NotificationExists(userID int) ([]dto.Notification, error) {
	var notification []dto.Notification
	query := `SELECT id, user_id, target_id, group_id, message, is_read, created_at 
	          FROM notifications 
	          WHERE user_id = ?`
	rows, err := repo.db.GetDB().Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("NotificationExists: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var notif dto.Notification
		var groupID sql.NullInt64 // Pour gérer les valeurs NULL
		var targetID sql.NullInt64
		err := rows.Scan(&notif.ID, &notif.UserID, &targetID, &groupID, &notif.Message, &notif.IsRead, &notif.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("NotificationExists: %v", err)
		}

		if groupID.Valid {
			gid := int(groupID.Int64)
			notif.GroupID = gid
		} else if targetID.Valid {
			tid := int(targetID.Int64)
			notif.TargetID = tid
		}
		notification = append(notification, notif)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("NotificationExists: %v", err)
	}

	return notification, nil
}

func (repo *GroupRepoImpl) GetNotificationsByUserID(userID int) ([]dto.Notification, error) {
	query := `
        SELECT *
        FROM notifications 
        WHERE target_id = ?
        ORDER BY created_at DESC;
    `

	rows, err := repo.db.GetDB().Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("GetNotificationsByUserID: %v", err)
	}
	defer rows.Close()

	var notifications []dto.Notification
	for rows.Next() {
		var notif dto.Notification
		var groupID sql.NullInt64  // Pour gérer les valeurs NULL de group_id
		var targetID sql.NullInt64 // Pour gérer les valeurs NULL de target_id

		err := rows.Scan(&notif.ID, &notif.UserID, &groupID, &targetID, &notif.Message, &notif.IsRead, &notif.Role, &notif.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("GetNotificationsByUserID: %v", err)
		}

		// Assigner les valeurs de groupID et targetID seulement si elles sont valides
		if groupID.Valid {
			notif.GroupID = int(groupID.Int64)
		} else {
			notif.GroupID = 0
		}
		if targetID.Valid {
			notif.TargetID = int(targetID.Int64)
		} else {
			notif.TargetID = 0
		}
		fmt.Println("notif", notif)
		notifications = append(notifications, notif)
	}

	// Vérification des erreurs potentielles lors de l'itération des lignes
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("GetNotificationsByUserID: %v", err)
	}

	return notifications, nil
}

// / AddMemberBasedOnNotification vérifie la notification et ajoute le membre au groupe si l'utilisateur accepte, puis supprime la notification
func (repo *GroupRepoImpl) AddMemberBasedOnNotification(notif dto.Notification) error {
    var data dto.Notification
   
    // Requête SQL pour vérifier l'existence de la notification
    query := `SELECT group_id, user_id FROM notifications WHERE id = ? AND group_id = ? AND user_id = ?`
    err := repo.db.GetDB().QueryRow(query, notif.ID, notif.GroupID, notif.UserID).Scan(&data.GroupID, &data.UserID)

    if err != nil {
        if err == sql.ErrNoRows {
            fmt.Println("Notification non trouvée :", notif.ID, notif.GroupID, notif.UserID) // Affichage pour le débogage
            return errors.New("notification non trouvée")
        }
        return err
    }

    var insertQuery string
    if notif.Role == "member" {
        // Utiliser UserID si le rôle est "member"
		fmt.Println("Les données avant acceptation :", notif)
        insertQuery = `INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`
        _, err = repo.db.GetDB().Exec(insertQuery, notif.GroupID, notif.UserID, "member", time.Now())
    } else if notif.Role == "admin" {
		fmt.Println("Les données avant acceptation :", notif)
        // Utiliser TargetID si le rôle est "admin"
        insertQuery = `INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`
        _, err = repo.db.GetDB().Exec(insertQuery, notif.GroupID, notif.TargetID, "admin", time.Now())
    }

    if err != nil {
        return err
    }

    // Supprimer la notification après avoir ajouté l'utilisateur au groupe
    deleteQuery := `DELETE FROM notifications WHERE id = ?`
    _, err = repo.db.GetDB().Exec(deleteQuery, notif.ID)
    if err != nil {
        return err
    }

    return nil
}


func (repo *GroupRepoImpl) DeclineNotification(notif dto.Notification) error {
	var data dto.Notification

	// Requête SQL pour vérifier l'existence de la notification
	query := `SELECT group_id, user_id FROM notifications WHERE id = ? AND group_id = ? AND user_id = ?`
	err := repo.db.GetDB().QueryRow(query, notif.ID, notif.GroupID, notif.UserID).Scan(&data.GroupID, &data.UserID)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("Notification non trouvée :", notif.ID, notif.GroupID, notif.UserID) // Affichage pour le débogage
			return errors.New("notification non trouvée")
		}
		return err
	}
	// Supprimer la notification après avoir ajouté l'utilisateur au groupe
	deleteQuery := `DELETE FROM notifications WHERE id = ?`
	_, err = repo.db.GetDB().Exec(deleteQuery, notif.ID)
	if err != nil {
		return err
	}

	return nil
}

func (repo *GroupRepoImpl) ItsGroupMember(data dto.Data) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ?`
	err := repo.db.GetDB().QueryRow(query, data.GroupID, data.UserID).Scan(&count)
	if err != nil {
		fmt.Println("error lors de la requete ")
		return false, err
	}
	return count > 0, nil
}

// GetUsersInGroup renvoie une map des IDs des utilisateurs présents dans un groupe spécifique, avec une valeur booléenne indiquant leur statut d'adhésion
func (repo *GroupRepoImpl) GetUsersInGroup(groupID int) (map[int]bool, error) {
	// Initialisation de la map qui stockera les utilisateurs et leur statut d'adhésion
	usersInGroup := make(map[int]bool)

	// Requête SQL pour sélectionner tous les utilisateurs appartenant au groupe donné
	query := `SELECT user_id FROM group_members WHERE group_id = ?`

	// Exécution de la requête
	rows, err := repo.db.GetDB().Query(query, groupID)
	if err != nil {
		return nil, fmt.Errorf("GetUsersInGroup: %v", err)
	}
	defer rows.Close()

	// Remplir la map avec les IDs des utilisateurs et leur statut d'adhésion
	for rows.Next() {
		var userID int
		if err := rows.Scan(&userID); err != nil {
			return nil, fmt.Errorf("GetUsersInGroup: %v", err)
		}
		usersInGroup[userID] = true
	}

	// Vérification des erreurs potentielles lors de l'itération des lignes
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("GetUsersInGroup: %v", err)
	}

	return usersInGroup, nil
}
