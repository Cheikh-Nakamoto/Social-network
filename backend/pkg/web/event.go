package web

import "encoding/json"

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

type SendMessageEvent struct {
	Message    string `json:"message"`
	SenderId   int    `json:"senderId"`
	ReceiverId int    `json:"receiverId"`
	Status	bool 	`json:status`
}

type ReturnMessageEvent struct {
	MessageId int `json:"messageId"`
	SendMessageEvent
	SentDate string `json:"sentDate"`
	Status bool	`json:status`
}

type ReturnChatDataEvent struct {
	CurrentChatterNickname string               `json:"currentChatterNickname"`
	OtherChatterNickname   string               `json:"otherChatterNickname"`
	Messages               []ReturnMessageEvent `json:"messages"`
}

type SendChatDataEvent struct {
	CurrentChatterId int `json:"currentChatterId"`
	OtherChatterId   int `json:"otherChatterId"`
	Amount           int `json:"amount"`
}

type UserDataEvent struct {
	UserId      int                `json:"userId"`
	Nickname    string             `json:"nickname"`
	Online      bool               `json:"online"`
	LastMsgData ReturnMessageEvent `json:"lastMsgData"`
}

const (
	EventSendMessage       = "send_message"
	EventNewMessage        = "new_message"
	EventGrNewMessage        = "new_message_group"
	EventGetMessages       = "get_messages"
	EventGetChatbarData    = "get_chatbar_data"
	EventUpdateChatbarData = "update_chatbar_data"
	EventTypingStart = "typing_start"
	EventTypingStop  = "typing_stop"
	EventGetMessagesGroup="get_messages_groupes"
	EventSendMessageGroup="send_message_groupes"
	EventGetNotification="new_notification"
	EventGetNotificationChat="new_notification_chat"
	EventGroup="new_group"
	EventPost="new_post"
	EventInvite="new_invitation"
	EventNewFollowBack="new_follow"

)
