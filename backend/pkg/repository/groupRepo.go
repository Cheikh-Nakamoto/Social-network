package repository

type GroupRepo interface {
	CreateGroup(name, description, owner string) (int, error)
	AddMember(userID, groupID int, role string) error
	EjectMember(userID, groupID int) error
	DeleteGroup(groupID int) error
	GetGroupByID(id int) (*Group, error)
	GetAllGroups() ([]Group, error)
}