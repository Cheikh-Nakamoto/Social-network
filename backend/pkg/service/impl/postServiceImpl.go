package impl

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/dto"
	"backend/pkg/entity"
	"backend/pkg/repository"
	"fmt"
	"strconv"
)

type PostServiceImpl struct {
	Repository repository.PostRepo
}

func (p *PostServiceImpl) CreatePost(post *dto.PostDTO) (string, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return "", err
	}
	defer db.Close()
	userservice := repository.NewUserRepoImpl(*db)
	nbr, err := strconv.Atoi(post.UserID)
	if err != nil {
		return "", nil
	}
	allfriends, err := userservice.GetFriends(uint(nbr))
	if err != nil {
		return "", nil
	}
	var li []int
	for _, almost := range post.AlmostUser {
		for _, user := range allfriends {
			if int(user.ID) == almost {
				li = append(li, almost)
				break
			}
		}
	}
	fmt.Println("voicci les almost selectionner :", li)
	if len(li) == 0 && post.IsPublic == "almost private" {
		post.IsPublic = "public"
	}
	return p.Repository.CreatePost(post.UserID, post.Title, post.Content, post.Image, post.IsPublic, post.GroupID, post.AlmostUser)
}

// GetAllPosts...
func (p *PostServiceImpl) GetAllPosts(id int) ([]dto.PostDTO, error) {
	db, _ := sqlite.Connect()

	defer db.Close()
	posts, err := p.Repository.GetAllPosts()
	if err != nil {
		return nil, err
	}

	var postDTOs []dto.PostDTO
	for _, post := range posts {
		bools := false
		if post.IsPublic == "almost private"{
			almost,_ := p.Repository.GetAlmost(post.UserID, strconv.Itoa(int(post.ID)))
			fmt.Println("Almost private: ",almost)
			for _, v := range almost {
				if v == int(id){
					bools = true
					break
				}
			}
			if !bools{
				continue
			}
		}else if  post.IsPublic == "private"{
			userService := repository.NewUserRepoImpl(*db)
			user, err := userService.GetFriends(uint(id))
			if err!= nil{
                return nil, err
            }
			for _, v := range user{
				if v.ID == uint(id){
                    bools = true
                    break
                }
			}
			if !bools{
				continue
			}
		}
		postDTOs = append(postDTOs, dto.PostDTO{
			ID:        post.ID,
			UserID:    post.UserID,
			Title:     post.Title,
			Content:   post.Content,
			Image:     post.Image,
			GroupID:   post.GroupID,
			IsPublic:  post.IsPublic,
			CreatedAt: post.CreatedAt,
		})
	}

	return postDTOs, nil
}

func (p *PostServiceImpl) GetAllPostsByGroupID(id int) ([]entity.Post, error) {
	return p.Repository.GetAllPostsByGroupID(id)
}
