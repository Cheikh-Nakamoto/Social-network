package impl

import (
	"backend/pkg/dto"
	"backend/pkg/repository"
)

type GroupServiceImpl struct {
	Repository repository.GroupRepo
}

func (s *GroupServiceImpl) CreateGroup(group *dto.GroupDTO) (int, error) {
	return s.Repository.CreateGroup(group.Name, group.Description, group.Owner, group.Image)
}

func (s *GroupServiceImpl) AddMember(userID, groupID,targetID int, role, name string) error {
	return s.Repository.AddMember(userID, groupID,targetID, role, name)
}

func (s *GroupServiceImpl) EjectMember(userID, groupID int) error {
	return s.Repository.EjectMember(userID, groupID)
}

func (s *GroupServiceImpl) DeleteGroup(groupID int) error {
	return s.Repository.DeleteGroup(groupID)
}

func (s *GroupServiceImpl) GetGroupByID(id int) (*dto.GroupDTO, error) {
	group, err := s.Repository.GetGroupByID(id)
	if err != nil {
		return nil, err
	}

	return (*dto.GroupDTO)(group), nil
}

func (s *GroupServiceImpl) GetAllGroups() ([]*dto.GroupDTO, error) {
	groups, err := s.Repository.GetAllGroups()
	if err != nil {
		return nil, err
	}

	dtos := make([]*dto.GroupDTO, len(groups))
	for i, group := range groups {
		dtos[i] = (*dto.GroupDTO)(&group)
	}

	return dtos, nil
}

// GetAllJoinGroupByID renvoie une map d'IDs de groupes associés à un booléen indiquant si l'utilisateur les a rejoints
func (s *GroupServiceImpl) GetAllJoinGroupByID(userID int) (map[int]bool, error) {
	return s.Repository.GetAllJoinGroupByID(userID)
}

// CreateEventsInGroup crée un nouvel événement dans un groupe
func (s *GroupServiceImpl) CreateEventsInGroup(event dto.Events) error {
	return s.Repository.CreateEventsInGroup(event)
}

func (s GroupServiceImpl) NotificationExists(userID int) ([]dto.Notification, error) {
	return s.Repository.NotificationExists(userID)
}


func (s GroupServiceImpl) GetNotificationsByUserID(userID int) ([]dto.Notification, error){
	return s.Repository.GetNotificationsByUserID(userID)
}

func (s GroupServiceImpl) GetAllEventsByGroup(id int) ([]dto.Events, error) {
    return s.Repository.FetchAllEvents(id)
}

func (s GroupServiceImpl) AddMemberBasedOnNotification(notif dto.Notification) error {
	return s.Repository.AddMemberBasedOnNotification(notif)
} 

func (s GroupServiceImpl) DeclineNotification(notif dto.Notification) error {
	return s.Repository.DeclineNotification(notif)
} 

func (s GroupServiceImpl)  ItsGroupMember(data dto.Data)(bool, error) {
	return s.Repository.ItsGroupMember(data)
}

func (s GroupServiceImpl)GetUsersInGroup(groupID int) (map[int]bool, error){
	return s.Repository.GetUsersInGroup(groupID)
}