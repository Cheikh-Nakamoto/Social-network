package mapper

import (
	"backend/pkg/dto"
	"backend/pkg/models"
)

func UserToDTO(user *models.User) *dto.UserDTO {
	return &dto.UserDTO{
		ID:          user.ID,
		Email:       user.Email,
		Password:    user.Password,
		Firstname:   user.Firstname,
		Lastname:    user.Lastname,
		DateOfBirth: user.DateOfBirth,
		Avatar:      user.Avatar,
		Nickname:    user.Nickname,
		AboutMe:     user.AboutMe,
		IsPublic:    user.IsPublic,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}

func DTOToUser(userDTO *dto.UserDTO) *models.User {
	return &models.User{
		ID:          userDTO.ID,
		Email:       userDTO.Email,
		Password:    userDTO.Password,
		Firstname:   userDTO.Firstname,
		Lastname:    userDTO.Lastname,
		DateOfBirth: userDTO.DateOfBirth,
		Avatar:      userDTO.Avatar,
		Nickname:    userDTO.Nickname,
		AboutMe:     userDTO.AboutMe,
		IsPublic:    userDTO.IsPublic,
		CreatedAt:   userDTO.CreatedAt,
		UpdatedAt:   userDTO.UpdatedAt,
	}
}
