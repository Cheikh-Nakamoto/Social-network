package service

import "backend/pkg/dto"

type GroupService interface {
	CreateGroup(group *dto.GroupDTO) (int, error)
	AddMember(userID, groupID int, role string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
	GetAllJoinGroupByID(userID int) (map[int]bool, error)
	CreateEventsInGroup(event dto.Events) error
	NotificationExists(userID int) ([]dto.Notification, error)
}
