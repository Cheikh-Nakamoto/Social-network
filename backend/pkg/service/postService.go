package service

type PostService interface {
	CreatePost()
	PostPrivacyFromString()
	GetPost()
	UpdatePost()
	DeletePost()
	GetUserPosts()
	GetAllPosts()
	GetAvailablePostsForUser()
	GetPostFromQuery()
}