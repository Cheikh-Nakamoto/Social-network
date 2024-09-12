package impl

import (
	"backend/pkg/dto"
	"backend/pkg/entity"
	"backend/pkg/mapper"
	"backend/pkg/repository"
	"backend/pkg/session"
	"backend/pkg/utils"
	"errors"
	"fmt"
	"strconv"
)

type UserServiceImpl struct {
	Repository repository.UserRepo
}

func (s *UserServiceImpl) GetUserById(id uint) (*dto.UserDTO, error) {
	user, err := s.Repository.FindByID(id)
	if err != nil {
		return nil, err
	}
	return mapper.UserToDTO(user), nil
}

func (s *UserServiceImpl) ChangeNatureProfile(nature bool, userid int) (bool, error) {
	user, err := s.Repository.FindByID(uint(userid))
	if err != nil {
		fmt.Println("get user", err)
		return false, err
	}
	if user == nil {
		return false, errors.New("user not found")
	}
	bools, err := s.Repository.ChangeNatureProfile(nature, userid)
	if err != nil {
		fmt.Println("error repository in service", err)
		return false, err
	}
	return bools, nil
}

func (s *UserServiceImpl) CreateUser(user *dto.UserDTO) error {
	if user.Email == "" || user.Password == "" || user.Firstname == "" || user.Lastname == "" || user.DateOfBirth == "" {
		fmt.Println("missing required fields")
		return errors.New("missing required fields")
	}

	isExisted, err := s.Repository.FindByEmailOrUsername(user.Email, user.Nickname)
	if err != nil {
		fmt.Println("Erreur findbyemail")
		return err
	}

	if isExisted != nil {
		fmt.Println("user already existed")
		return errors.New("user already existed")
	}

	hashedPassword, err := utils.Encrypt(user.Password)
	if err != nil {
		fmt.Println("Encrypte password")
		return err
	}
	user.Password = hashedPassword
	return s.Repository.Save(mapper.DTOToUser(user))
}

func (s *UserServiceImpl) Connection(Identifiant, password string) (*dto.UserDTO, error) {
	user, err := s.Repository.FindByEmailOrUsername(Identifiant, Identifiant)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = utils.Compare(user.Password, password)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	user.Password = ""

	return mapper.UserToDTO(user), nil
}

func (s *UserServiceImpl) GetAllUsers() (map[string]*entity.User, error) {
	users, err := s.Repository.FindAllUsers()
	if err != nil {
		return nil, err
	}

	var userDTOs = make(map[string]*entity.User)
	for _, user := range users {
		user.Password = ""
		if user.Avatar == "" {
			user.Avatar = "female.svg"
		}
		userDTOs[strconv.Itoa(int(user.ID))] = user
	}

	return userDTOs, nil
}

func (s *UserServiceImpl) UpdateProfile(id uint, userDTO *dto.UserDTO) error {
	user := mapper.DTOToUser(userDTO)
	user.ID = id
	return s.Repository.Update(user)
}

func (s *UserServiceImpl) GetProfile(id uint) (*dto.UserDTO, error) {
	user, err := s.Repository.FindByID(id)

	return mapper.UserToDTO(user), err
}

func (s *UserServiceImpl) CountUsers() (uint, error) {
	return s.Repository.CountUsers()
}

func (s *UserServiceImpl) CreateSession(user *dto.UserDTO) (string, error) {
	return session.CreateSession(*user)
}

func (s *UserServiceImpl) Logout(token string) error {
	err := session.DeleteSession(token)
	if err != nil {
		return err
	}
	return nil
}

func (s *UserServiceImpl) IsUserOnline(token string) (bool, error) {
	_, err := session.GetSession(token)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (s *UserServiceImpl) AllUsers() ([]*dto.UserDTO, error) {
	users, err := s.Repository.GetAllUsers()
	if err != nil {
		return nil, err

	}
	var userDTOs []*dto.UserDTO
	for _, user := range users {
		if user != nil {

			userDTOs = append(userDTOs, mapper.UserToDTO(user))
		}
	}

	return userDTOs, nil

}

func (s *UserServiceImpl) GetFollowers(userID uint) ([]*dto.UserDTO, error) {
	users, err := s.Repository.GetFollowers(userID)
	if err != nil {
		return nil, err
	}
	var userDTOs []*dto.UserDTO
	for _, user := range users {
		userDTOs = append(userDTOs, mapper.UserToDTO(user))
	}

	return userDTOs, nil
}

func (s *UserServiceImpl) GetFollowings(userID uint) ([]*dto.UserDTO, error) {
	users, err := s.Repository.GetFollowings(userID)
	if err != nil {
		return nil, err
	}
	var userDTOs []*dto.UserDTO
	for _, user := range users {
		userDTOs = append(userDTOs, mapper.UserToDTO(user))
	}
	return userDTOs, nil
}

func (s *UserServiceImpl) GetFriends(userID uint) ([]*dto.UserDTO, error) {
	users, err := s.Repository.GetFriends(userID)
	if err != nil {
		return nil, err
	}
	var userDTOs []*dto.UserDTO
	for _, user := range users {
		userDTOs = append(userDTOs, mapper.UserToDTO(user))
	}
	return userDTOs, nil
}

func (s *UserServiceImpl) GetFriendsCount(userID uint) (uint, error) {
	return s.Repository.GetFriendsCount(userID)
}

func (s *UserServiceImpl) GetFollowerCount(userID uint) (uint, error) {
	return s.Repository.GetFollowerCount(userID)
}

func (s *UserServiceImpl) GetFollowingCount(userID uint) (uint, error) {
	return s.Repository.GetFollowingCount(userID)
}
func (s *UserServiceImpl) GetRecentPosts(userID uint) ([]dto.PostDTO, error) {
	// Utilisation du repository pour obtenir les publications récentes
	posts, err := s.Repository.GetPostsByUserID(userID)
	if err != nil {
		return nil, err
	}

	postDTOs := make([]dto.PostDTO, len(posts))
	for i, post := range posts {
		postDTOs[i] = *mapper.PostToDTO(post)
	}

	return postDTOs, nil
}
