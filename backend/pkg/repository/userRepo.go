package repository

import "backend/pkg/models"

type UserRepo interface {
	FindByID(id uint) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	Save(user *models.User) error
	Update(user *models.User) error
	Follow(followerID, followingID uint) error
	Unfollow(followerID, followingID uint) error
	GetFollowers(userID uint) ([]*models.User, error)
	StoreSession(token string, userID uint)
	GetUserID(token string) (uint, bool)
	ClearSession(token string)
}
