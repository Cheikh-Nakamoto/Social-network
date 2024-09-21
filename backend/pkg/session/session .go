package session

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/dto"
	"backend/pkg/utils"
	"errors"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"
)

type Session struct {
	UserID    uint
	ExpiresAt time.Time
}

var (
	sessionStore    = map[string]*Session{}
	mutex           = &sync.Mutex{}
	sessionDuration = 24 * time.Hour
)

type StoreSessions struct {
	session map[string]uint
	mu      sync.Mutex
}

const sessionName = "session_token"

func NewSessionStore() *StoreSessions {
	return &StoreSessions{
		session: make(map[string]uint),
	}
}

func (s *StoreSessions) StoreSession(token string, userID uint) {
	s.mu.Lock()
	s.session[token] = userID
	s.mu.Unlock()

	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	_, err = db.GetDB().Exec("INSERT INTO sessions (sessionId, userId) VALUES (?, ?)", token, int(userID))
	if err != nil {

		// Gérer l'erreur d'insertion dans la base de données

		panic(err) // Vous pouvez gérer l'erreur différemment selon votre besoin
	}
}

func CreateSession(user dto.UserDTO) (string, error) {
	err := utils.Environment()
	if err != nil {
		return "", err
	}

	sessionToken := generateJWT(os.Getenv("SECRET_KEY"), user)
	expiresAt := time.Now().Add(sessionDuration)

	mutex.Lock()
	sessionStore[sessionToken] = &Session{
		UserID:    user.ID,
		ExpiresAt: expiresAt,
	}
	mutex.Unlock()

	return sessionToken, nil
}

func GetSession(token string) (*Session, error) {
	mutex.Lock()
	session, exists := sessionStore[token]
	mutex.Unlock()

	if !exists {
		return nil, errors.New("session not found")
	}
	if session.ExpiresAt.Before(time.Now()) {
		err := DeleteSession(token)
		if err != nil {
			return nil, err
		}
		return nil, errors.New("session expired")
	}

	return session, nil
}

func DeleteSession(token string) error {
	if _, exists := sessionStore[token]; !exists {
		return errors.New("session not found")
	}
	mutex.Lock()
	delete(sessionStore, token)
	mutex.Unlock()
	return nil
}

func (s *StoreSessions) GetUserID(token string) (uint, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	userID, exists := s.session[token]
	return userID, exists
}
func (s *StoreSessions) GetTokenByID(id uint) (string, bool) {
	fmt.Println("iiiiiiiiiiiiiii",s.session)


	// Parcourir la map pour trouver le token correspondant à l'id utilisateur
	for token, userID := range s.session {
		if userID == id {
			fmt.Println("gggggg", token)
			return token, true
		}
	}
	return "", false // Si aucun token n'est trouvé
}

func GetTokenByUserID(userID uint) (string, error) {
	mutex.Lock()
	defer mutex.Unlock()

	for token, session := range sessionStore {
		if session.UserID == userID {
			return token, nil
		}
	}
	return "", errors.New("session not found")
}

func (s *StoreSessions) ClearSession(token string) {
	s.mu.Lock()
	fmt.Println(s.session)
	defer s.mu.Unlock()
	delete(s.session, token)
}

func SetSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  time.Now().Add(sessionDuration),
		HttpOnly: true,
	})
}

func GetSessionTokenFromRequest(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}
