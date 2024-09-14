package service

import "backend/pkg/dto"

type UserServcie interface {
	GetUserById(id uint) (*dto.UserDTO, error)
	CreateUser(user *dto.UserDTO) error
	Connection(email, password string) (*dto.UserDTO, error)
	UpdateProfile(id uint, userDTO *dto.UserDTO) error
	GetFollowers(userID uint) ([]*dto.UserDTO, error)
	CreateSession(user *dto.UserDTO) (string, error)
	ChangeNatureProfile(nature bool, userid int) (bool, error)
	GetPendingRequest(userID uint) ([]*dto.UserDTO, error)
}
