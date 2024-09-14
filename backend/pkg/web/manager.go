package web

import (
	"backend/pkg/db/sqlite"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Configuration de l'upgrader WebSocket
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// TypingEvent représente un événement de saisie de message entre un expéditeur et un destinataire.
type TypingEvent struct {
	SenderId   int `json:"senderId"`
	ReceiverId int `json:"receiverId"`
}

// Manager gère les connexions WebSocket des clients et les événements associés.
type Manager struct {
	clients      ClientList              // Liste des clients connectés
	sync.RWMutex                         // Mutex pour gérer la concurrence
	handlers     map[string]EventHandler // Gestionnaires d'événements pour différents types d'événements
}

// NewManager crée une nouvelle instance de Manager avec une liste de clients vide et les gestionnaires d'événements configurés.

// routeEvent route l'événement vers le gestionnaire approprié en fonction de son type.
func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("there is no such event type")
	}
}

func NewManager() *Manager {
	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
	}

	m.setupEventHandlers()
	return m
}

// setupEventHandlers configure les gestionnaires d'événements pour différents types d'événements supportés.
func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = SendMessageHandler
	m.handlers[EventGetMessages] = GetMessagesHandler
	m.handlers[EventGetChatbarData] = GetChatbarDataHandler
	m.handlers[EventUpdateChatbarData] = UpdateChatbarData
	m.handlers[EventTypingStart] = TypingStartHandler
	m.handlers[EventTypingStop] = TypingStopHandler
	m.handlers[EventGetMessagesGroup] = GroupMessageHandler
	m.handlers[EventSendMessageGroup] = SendMessageGrouopHandler
	m.handlers[EventGetNotification] = SendNotificationHandler
	m.handlers[EventGroup] = SendGroupHandler
	m.handlers[EventPost] = SendPostHandler
	m.handlers[EventInvite] = SendInviteHandler
	m.handlers[EventNewFollowBack] = SendNewFollowHandler
	m.handlers[EventGetNotificationChat] = SendNotificationChatHandler
	m.handlers[EventGetNotificationChat] = SendNotificationChatHandler
}

func TypingStartHandler(event Event, c *Client) error {
	var typingEvent TypingEvent
	if err := json.Unmarshal(event.Payload, &typingEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Envoyer l'événement de saisie à tous les clients connectés sauf à l'expéditeur
	for client := range c.manager.clients {
		if client.userId == typingEvent.ReceiverId {
			client.egress <- event
		}
	}
	return nil
}

// TypingStopHandler gère l'événement d'arrêt de saisie.
func TypingStopHandler(event Event, c *Client) error {
	var typingEvent TypingEvent
	if err := json.Unmarshal(event.Payload, &typingEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Envoyer l'événement d'arrêt de saisie à tous les clients connectés sauf à l'expéditeur
	for client := range c.manager.clients {
		if client.userId == typingEvent.ReceiverId {
			client.egress <- event
		}
	}
	return nil
}

// SendMessageHandler gère l'événement d'envoi de message.
func SendMessageHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status
	idmsg, err := getLastMessageId()
	if err != nil {
		log.Print("error lors de la recuperation de l'id du dernier message")
		return err
	}
	returnMsg.MessageId = idmsg

	// Ajouter le message à une table ou base de données
	addMessageToTable(returnMsg)

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventNewMessage

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

func SendNotificationHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventGetNotification

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

func SendNewFollowHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventNewFollowBack

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

func SendInviteHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventInvite

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

func SendGroupHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventGroup

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		client.egress <- outgoingEvent
	}
	return nil
}
func SendPostHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventPost

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		client.egress <- outgoingEvent
	}
	return nil
}

func SendMessageGrouopHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	idmsg, err := getLastGrMessageId()
	if err != nil {
		log.Print("error lors de la recuperation de l'id du dernier message")
		return err
	}
	returnMsg.MessageId = idmsg

	// Ajouter le message à une table ou base de données
	addGrMessageToTable(returnMsg)

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGrNewMessage

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {

		client.egress <- outgoingEvent

	}
	return nil
}

func addMessageToTable(messageData ReturnMessageEvent) {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	statement, err := db.GetDB().Prepare("INSERT INTO messages (senderId, receiverId, sentDate, message, status) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(messageData.SenderId, messageData.ReceiverId, messageData.SentDate, messageData.Message, messageData.Status)
	if err != nil {
		log.Println(err)
		return
	}
}
func addGrMessageToTable(messageData ReturnMessageEvent) {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	statement, err := db.GetDB().Prepare("INSERT INTO groupmessages (senderId, groupId, sentDate, message) VALUES (?, ?, ?, ?)")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(messageData.SenderId, messageData.ReceiverId, messageData.SentDate, messageData.Message)
	if err != nil {
		log.Println(err)
		return
	}
}

// GetMessagesHandler gère l'événement de récupération de messages.
func GetMessagesHandler(event Event, c *Client) error {

	fmt.Println("contacct stablished...")
	var chatDataEvent SendChatDataEvent
	if err := json.Unmarshal(event.Payload, &chatDataEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Récupérer les données de chat entre deux utilisateurs
	data, err := json.Marshal(getChatData(chatDataEvent.CurrentChatterId, chatDataEvent.OtherChatterId, chatDataEvent.Amount))
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	fmt.Println("recup:::::::", string(data))

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGetMessages
	c.egress <- outgoingEvent

	return nil
}
func GroupMessageHandler(event Event, c *Client) error {

	fmt.Println("contacct stablished...")
	var chatDataEvent SendChatDataEvent
	if err := json.Unmarshal(event.Payload, &chatDataEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Récupérer les données de chat entre deux utilisateurs
	data, err := json.Marshal(getGroupChatData(chatDataEvent.CurrentChatterId, chatDataEvent.OtherChatterId, chatDataEvent.Amount))
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	fmt.Println("recup::::::::::::::::::::::::::::::::", string(data))

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGetMessagesGroup
	c.egress <- outgoingEvent

	return nil
}

func getNicknameById(userId int) string {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	var nickname string

	db.GetDB().QueryRow("SELECT nickname FROM users WHERE id = ?", userId).Scan(&nickname)
	return nickname
}

func getChatData(currentChatterId, otherChatterId, amount int) ReturnChatDataEvent {
	var returnChatData ReturnChatDataEvent
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	returnChatData.CurrentChatterNickname = getNicknameById(currentChatterId)
	returnChatData.OtherChatterNickname = getNicknameById(otherChatterId)

	rows, err := db.GetDB().Query(`
		SELECT messageId, senderId, receiverId, message, sentDate FROM messages 
		WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
		ORDER BY sentDate DESC LIMIT ?`, currentChatterId, otherChatterId, otherChatterId, currentChatterId, amount)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var messageData ReturnMessageEvent

		rows.Scan(&messageData.MessageId, &messageData.SenderId, &messageData.ReceiverId, &messageData.Message, &messageData.SentDate)
		returnChatData.Messages = append(returnChatData.Messages, messageData)
	}
	reverseSlice(returnChatData.Messages)

	return returnChatData
}
func getGroupChatData(currentChatterId, otherChatterId, amount int) ReturnChatDataEvent {
	var returnChatData ReturnChatDataEvent
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	returnChatData.CurrentChatterNickname = getNicknameById(currentChatterId)
	returnChatData.OtherChatterNickname = "group:" + strconv.Itoa(otherChatterId)

	rows, err := db.GetDB().Query(`
		SELECT messageId, senderId, groupId, message, sentDate 
		FROM groupmessages 
		ORDER BY sentDate DESC LIMIT ?`, amount)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var messageData ReturnMessageEvent

		rows.Scan(&messageData.MessageId, &messageData.SenderId, &messageData.ReceiverId, &messageData.Message, &messageData.SentDate)
		returnChatData.Messages = append(returnChatData.Messages, messageData)
	}
	reverseSlice(returnChatData.Messages)

	return returnChatData
}

func reverseSlice(s []ReturnMessageEvent) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}

// GetChatbarDataHandler gère l'événement de récupération des données de la barre de chat.
func GetChatbarDataHandler(event Event, c *Client) error {
	var userId int
	if err := json.Unmarshal(event.Payload, &userId); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Récupérer les données de la barre de chat pour l'utilisateur donné
	data, err := json.Marshal(getChatbarData(userId))
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGetChatbarData
	c.egress <- outgoingEvent

	return nil
}

func getChatbarData(currentUserId int) []UserDataEvent {
	var userDataSlc []UserDataEvent
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	rows, err := db.GetDB().Query(`SELECT id, nickname, online FROM users WHERE id != ? ORDER BY nickname COLLATE NOCASE ASC`, currentUserId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var userData UserDataEvent

		rows.Scan(&userData.UserId, &userData.Nickname, &userData.Online)
		userData.LastMsgData = getLastMsgData(currentUserId, userData.UserId)
		userDataSlc = append(userDataSlc, userData)
	}

	return userDataSlc
}

func getLastMsgData(currentUserId, senderId int) ReturnMessageEvent {
	var lastMsgData ReturnMessageEvent
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	err = db.GetDB().QueryRow(`
		SELECT message, senderId, receiverId, sentDate FROM messages
		WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
		ORDER BY sentDate DESC`, senderId, currentUserId, currentUserId, senderId).Scan(&lastMsgData.Message, &lastMsgData.SenderId, &lastMsgData.ReceiverId, &lastMsgData.SentDate)
	if err != nil {
		if err != sql.ErrNoRows {
			log.Println(err)
		}
	}

	return lastMsgData
}

// UpdateChatbarData gère l'événement de mise à jour des données de la barre de chat.
func UpdateChatbarData(event Event, c *Client) error {
	var msg string
	if err := json.Unmarshal(event.Payload, &msg); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	fmt.Println(msg) // Afficher le message reçu dans la console (à titre d'exemple)

	// Diffuser la mise à jour à tous les clients connectés
	return broadcastUpdate(c)
}

// broadcastUpdate diffuse les données mises à jour de la barre de chat à tous les clients connectés.
func broadcastUpdate(c *Client) error {
	for client := range c.manager.clients {
		data, err := json.Marshal(getChatbarData(client.userId))
		if err != nil {
			log.Printf("failed to marshal broadcast message: %v", err)
		}

		var outgoingEvent Event
		outgoingEvent.Payload = data
		outgoingEvent.Type = EventGetChatbarData
		client.egress <- outgoingEvent
	}
	return nil
}

// addClient ajoute un nouveau client à la liste des clients gérés par le Manager.
func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	//Créer un timer pour mettre à jour l'état en ligne de l'utilisateur après 3 secondes
	timer := time.NewTimer(3 * time.Second)

	go func() {
		<-timer.C
		if m.isClientOnline(client.userId) {
			updateUserStatus(true, client.userId)
			broadcastUpdate(client)
		}
	}()

	m.clients[client] = true

	test, error := CheckNotificationChats(client.userId)
	if error != nil {

		log.Fatal("error checking")
		return
	}

	if test {

		messages, err := getUnreadMessages(client.userId)
		if err != nil {
			log.Fatal(err)
		}

		SendNotificationChatHandler(messages, client)
	}

}

func updateUserStatus(newStatus bool, userId int) {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}
	statement, err := db.GetDB().Prepare("UPDATE users SET online = ? WHERE id = ?")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(newStatus, userId)
	if err != nil {
		log.Println(err)
		return
	}
}

func hasSession(userId int) bool {
	var exists bool
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	err = db.GetDB().QueryRow("SELECT EXISTS(SELECT 1 FROM sessions WHERE userId = ?)", userId).Scan(&exists)
	if err != nil {
		log.Println(err)
		return false
	}
	return exists
}

// removeClient supprime un client de la liste des clients gérés par le Manager.
func (m *Manager) removeClient(client *Client) {
	fmt.Println("hp call", m.isClientOnline(client.userId))
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		// Créer un timer pour vérifier l'état en ligne du client après 3 secondes
		timer := time.NewTimer(3 * time.Second)

		go func() {
			<-timer.C
			if !m.isClientOnline(client.userId) {
				updateUserStatus(false, client.userId)
				broadcastUpdate(client)
			}
		}()

		// Supprimer le client de la liste des clients gérés par le Manager
		delete(m.clients, client)
	}
}

// isClientOnline vérifie si un utilisateur est en ligne en parcourant la liste des clients gérés par le Manager.
func (m *Manager) isClientOnline(userId int) bool {
	m.Lock()
	defer m.Unlock()

	for client := range m.clients {
		if client.userId == userId {
			return true
		}
	}

	return false
}

func SendNotificationChatHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Construire l'événement de message à retourner
	var returnMsg ReturnMessageEvent
	returnMsg.SentDate = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Message = chatEvent.Message
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId
	returnMsg.Status = chatEvent.Status

	// Marshal l'événement à retourner en JSON
	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data

	outgoingEvent.Type = EventGetNotificationChat

	// Envoyer le message au client destinataire
	for client := range c.manager.clients {
		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}
	}
	return nil
}

type Message struct {
	MessageID  int
	SenderID   int
	ReceiverID int
	SentDate   string
	Message    string
	Status     bool
}

func getUnreadMessages(receiverID int) (Event, error) {

	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	query := `
		SELECT messageId, senderId, receiverId, sentDate, message, status
		FROM messages
		WHERE receiverId = ? AND status = 0;
	`

	rows, err := db.GetDB().Query(query, receiverID)
	if err != nil {
		return Event{}, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.SentDate, &msg.Message, &msg.Status)
		if err != nil {
			return Event{}, err
		}
		messages = append(messages, msg)
	}

	if err = rows.Err(); err != nil {
		return Event{}, err
	}

	// Sérialiser les messages en JSON pour les inclure dans l'Event
	payload, err := json.Marshal(messages)
	if err != nil {
		return Event{}, err
	}

	// Retourner les messages dans la structure Event
	event := Event{
		Type:    "unreadMessages",
		Payload: json.RawMessage(payload),
	}

	return event, nil
}

func CheckNotificationChats(receiverId int) (bool, error) {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	query := `SELECT COUNT(*) FROM messages WHERE receiverId = ? AND status = ?`
	var count int
	err = db.GetDB().QueryRow(query, receiverId, 0).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("CheckNotificationExists: %v", err)
	}
	fmt.Println("count: ", count)
	return count > 0, nil

}
func getLastGrMessageId() (int, error) {
	var messageId int
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	// Requête SQL pour récupérer le dernier messageId
	query := `SELECT messageId FROM groupmessages ORDER BY messageId DESC LIMIT 1`

	// Exécuter la requête et scanner le résultat dans la variable messageId
	err = db.GetDB().QueryRow(query).Scan(&messageId)
	if err != nil {
		if err == sql.ErrNoRows {
			// Si aucune ligne n'est trouvée
			return 0, nil
		}
		// Autres erreurs
		return 0, err
	}

	// Retourner le dernier messageId
	return messageId, nil
}

func getLastMessageId() (int, error) {
	var messageId int
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	// Requête SQL pour récupérer le dernier messageId
	query := `SELECT messageId FROM messages ORDER BY messageId DESC LIMIT 1`

	// Exécuter la requête et scanner le résultat dans la variable messageId
	err = db.GetDB().QueryRow(query).Scan(&messageId)
	if err != nil {
		if err == sql.ErrNoRows {
			// Si aucune ligne n'est trouvée
			return 0, nil
		}
		// Autres erreurs
		return 0, err
	}

	// Retourner le dernier messageId
	return messageId, nil
}
