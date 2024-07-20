package db

const (
	// Requêtes SQL pour la table users
	CreateUser  = `INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, $4) RETURNING id`
	GetUserByID = `SELECT id, username, email, created_at FROM users WHERE id = $1`
	UpdateUser  = `UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4`
	DeleteUser  = `DELETE FROM users WHERE id = $1`

	// Requêtes SQL pour la table groups
	CreateGroup  = `INSERT INTO groups (name, description, created_at) VALUES ($1, $2, $3) RETURNING id`
	GetGroupByID = `SELECT id, name, description, created_at FROM groups WHERE id = $1`
	UpdateGroup  = `UPDATE groups SET name = $1, description = $2 WHERE id = $3`
	DeleteGroup  = `DELETE FROM groups WHERE id = $1`

	// Requêtes SQL pour la table group_members
	AddGroupMember    = `INSERT INTO group_members (user_id, group_id, role, joined_at) VALUES ($1, $2, $3, $4)`
	RemoveGroupMember = `DELETE FROM group_members WHERE user_id = $1 AND group_id = $2`
	GetGroupMembers   = `SELECT u.id, u.username, gm.role, gm.joined_at
                       FROM users u
                       JOIN group_members gm ON u.id = gm.user_id
                       WHERE gm.group_id = $1`
)
