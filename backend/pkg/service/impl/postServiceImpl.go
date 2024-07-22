package impl

import (
	"backend/pkg/models"
	"fmt"
)

type PostServiceImpl struct {
	PostServ models.Post
}

func (p *PostServiceImpl) IsPublic() bool {
	return p.PostServ.Privacy == models.PublicPrivacy
}

func (p *PostServiceImpl) IsPrivate() bool {
	return p.PostServ.Privacy == models.PrivatePrivacy
}
func (p *PostServiceImpl) IsAlmostPrivate() bool {
	return p.PostServ.Privacy == models.AlmostPrivatePrivacy
}

func PostPrivacyFromString(s string) (models.PostPrivacy, error) {
	switch s {
	case "public":
		return models.PublicPrivacy, nil
	case "private":
		return models.PrivatePrivacy, nil
	case "almost_private":
		return models.AlmostPrivatePrivacy, nil
	default:
		return "", fmt.Errorf("invalid privacy level: %s", s)
	}
}
