package web

import (
	"backend/pkg/service/impl"
	"backend/pkg/utils"
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
	log.Println("new connection")

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Récupérer l'ID utilisateur à partir des paramètres de requête
	userId, err := strconv.Atoi(r.URL.Query().Get("userId"))
	fmt.Println("premier utilisateur")
	if (err!=nil){
		fmt.Println("eeeeeeeeeeeeeee", err)
	}
	client := NewClient(conn, m, userId)

	

	// Ajouter le client à la liste des clients gérés par le Manager
	 m.addClient(client)
	// Démarrer les goroutines pour la lecture et l'écriture des messages
	go client.readMessages()
	go client.writeMessages()
}


