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

func (s *GroupServiceImpl) AddMember(userID, groupID int, role string) error {
	return s.Repository.AddMember(userID, groupID, role)
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
