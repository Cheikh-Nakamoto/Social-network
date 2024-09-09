package repository

import (
	"backend/pkg/entity"
)

type PostRepo interface {
	CreatePost(userID string, title, content, Image string, IsPublic string,groupid int64,almost []int) (string, error)
	GetAllPosts() ([]entity.Post, error)
	DeletePostByID(id int) ([]entity.Post, error)
	GetAllPostsByGroupID(id  int) ([]entity.Post, error)
	GetAlmost(userID, postid string) ([]int, error) 
}
