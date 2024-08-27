package repository

import "backend/pkg/dto"

type GroupRepo interface {
	CreateGroup(name, description, owner, image string) (int, error)
	AddMember(userID, groupID int, role, name string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
	GetGroupByID(id int) (*Group, error)
	GetAllGroups() ([]Group, error)
	GetAllJoinGroupByID(userID int) (map[int]bool, error)
	CreateEventsInGroup(event dto.Events) error
	NotificationExists(userID int) (map[int]dto.Notification, error)
	CheckNotificationExists(userID, targetID int, message string) (bool, error)
}
