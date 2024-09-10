package repository

import "backend/pkg/dto"

type GroupRepo interface {
	CreateGroup(name, description, owner, image string) (int, error)
	AddMember(userID, groupID, targetID int, role, name string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
	GetGroupByID(id int) (*Group, error)
	GetAllGroups() ([]Group, error)
	GetAllJoinGroupByID(userID int) (map[int]bool, error)
	CreateEventsInGroup(event dto.Events) error
	NotificationExists(userID int) ([]dto.Notification, error)
	CheckNotificationExists(userID, groupID, targetID int, message string) (bool, error)
	GetNotificationsByUserID(userID int) ([]dto.Notification, error)
	FetchAllEvents(id int) ([]dto.Events, error)
	AddMemberBasedOnNotification(notif dto.Notification) error
	DeclineNotification(notif dto.Notification) error
	ItsGroupMember(data dto.Data)(bool, error)
	GetUsersInGroup(groupID int) (map[int]bool, error)
}
