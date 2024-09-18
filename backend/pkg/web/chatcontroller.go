package web

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/service/impl"
	"backend/pkg/session"
	"backend/pkg/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

type ChatControler struct {
	ChatService impl.ChatServiceImpl
}

// Client représente un client WebSocket.

// TypingStartHandler gère l'événement de début de saisie.
func (ch *ChatControler) RegisterRoutes(mux *http.ServeMux) *http.ServeMux {
	err := utils.Environment()
	if err != nil {
		log.Println(err)
		return mux
	}
	mux.HandleFunc("/ws", NewManager().ServeWS)
	return mux
}

func (m *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	

	
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	
	// Récupérer l'ID utilisateur à partir des paramètres de requête
	userId, err := strconv.Atoi(r.URL.Query().Get("userId"))
	sessionToken, err := GetSessionTokenByUserID(uint(userId))

	if (err!=nil){
		fmt.Println("non autorisé")
		return
	}

	_, err10:=session.GetSession(sessionToken)
	if err10!=nil{
		fmt.Println("denied")
		return

		
	}

	log.Println("new connection")



	
	
	client := NewClient(conn, m, userId)

	// Ajouter le client à la liste des clients gérés par le Manager
	m.addClient(client)
	// Démarrer les goroutines pour la lecture et l'écriture des messages
	go client.readMessages()
	go client.writeMessages()
}

func GetSessionTokenByUserID(userID uint) (string, error) {
	// Se connecter à la base de données SQLite
	db, err := sqlite.Connect()
	if err != nil {
		// Gérer l'erreur de connexion
		return "", fmt.Errorf("unable to connect to the database: %v", err)
	}

	// Préparer la requête pour récupérer le token en fonction de l'userID
	var token string
	err = db.GetDB().QueryRow("SELECT sessionId FROM sessions WHERE userId = ?", int(userID)).Scan(&token)
	if err != nil {
		// Gérer l'erreur si le token n'est pas trouvé ou si une autre erreur survient
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("no session found for userID: %d", userID)
		}
		return "", fmt.Errorf("unable to retrieve session token: %v", err)
	}

	// Retourner le token si trouvé
	return token, nil
}
