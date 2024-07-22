package service

import "backend/pkg/dto"

type GroupService interface{
	CreateGroup(group *dto.GroupDTO) (int, error)
	AddMember(userID, groupID int, role string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
}