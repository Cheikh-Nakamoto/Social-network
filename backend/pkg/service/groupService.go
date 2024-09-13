package service

import "backend/pkg/dto"

type GroupService interface {
	CreateGroup(group *dto.GroupDTO) (int, error)
	AddMember(userID, groupID,targetID int, role string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
	GetAllJoinGroupByID(userID int) (map[int]bool, error)
	CreateEventsInGroup(event dto.Events) error
	NotificationExists(userID int) ([]dto.Notification, error)
	GetNotificationsByUserID(userID int) ([]dto.Notification, error)
	GetAllEventsByGroup() ([]dto.Events, error)
	AddMemberBasedOnNotification(notif dto.Notification) error
	DeclineNotification(notif dto.Notification) error
	ItsGroupMember(data dto.Data)bool
	GetUsersInGroup(groupID int) (map[int]bool, error)
}
