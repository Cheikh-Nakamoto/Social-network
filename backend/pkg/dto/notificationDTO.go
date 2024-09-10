package dto

type NotificationDto struct {
    ID        int    `json:"id"`
    UserID    int    `json:"user_id"`
    GroupID   *int   `json:"group_id,omitempty"` // Optional, use pointer to indicate null
    TargetID  *int   `json:"target_id,omitempty"` // Optional, use pointer to indicate null
    Message   string `json:"message"`
    IsRead    bool   `json:"is_read"`
    Role      string `json:"role"`  // role of the user in the notification (admin, member)
    CreatedAt string `json:"created_at"` 
}
