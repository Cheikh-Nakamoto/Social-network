# Variables pour les répertoires
FRONTEND_DIR=frontend
BACKEND_DIR=backend

# Détection de l'OS
UNAME_S := $(shell uname -s)

# Commande pour démarrer le backend
start-backend:
ifeq ($(UNAME_S),Linux)
	@gnome-terminal -- bash -c "cd $(BACKEND_DIR) && go run . || { echo 'Erreur: Impossible de démarrer le backend'; exit 1; }" || "{ echo 'Erreur avec gnome-terminal. Essai avec tmux...'; tmux new-session -d -s backend 'cd $(BACKEND_DIR) && go run .' }"
else ifeq ($(UNAME_S),Darwin)
	@osascript -e 'tell app "Terminal" to do script "cd $(BACKEND_DIR) && go run ."' || { echo 'Erreur avec osascript. Essai avec tmux...'; tmux new-session -d -s backend 'cd $(BACKEND_DIR) && go run .' }
else ifeq ($(OS),Windows_NT)
	@start cmd /c "cd $(BACKEND_DIR) && go run ." || echo 'Erreur: Impossible de démarrer le backend'
endif

# Commande pour démarrer le frontend
start-frontend:
ifeq ($(UNAME_S),Linux)
	@gnome-terminal -- bash -c "cd $(FRONTEND_DIR) && npm run start || { echo 'Erreur: Impossible de démarrer le frontend'; exit 1; }" || "{ echo 'Erreur avec gnome-terminal. Essai avec tmux...'; tmux new-session -d -s frontend 'cd $(FRONTEND_DIR) && npm run start' }"
else ifeq ($(UNAME_S),Darwin)
	@osascript -e 'tell app "Terminal" to do script "cd $(FRONTEND_DIR) && npm run start"' || { echo 'Erreur avec osascript. Essai avec tmux...'; tmux new-session -d -s frontend 'cd $(FRONTEND_DIR) && npm run start' }
else ifeq ($(OS),Windows_NT)
	@start cmd /c "cd $(FRONTEND_DIR) && npm run start" || echo 'Erreur: Impossible de démarrer le frontend'
endif

i-dep:
ifeq ($(UNAME_S),Linux)
	@gnome-terminal -- bash -c "cd $(FRONTEND_DIR) && npm i || { echo 'Erreur: Impossible de démarrer le frontend'; exit 1; }" || "{ echo 'Erreur avec gnome-terminal. Essai avec tmux...'; tmux new-session -d -s frontend 'cd $(FRONTEND_DIR) && npm run start' }"
else ifeq ($(UNAME_S),Darwin)
	@osascript -e 'tell app "Terminal" to do script "cd $(FRONTEND_DIR) && npm i"' || { echo 'Erreur avec osascript. Essai avec tmux...'; tmux new-session -d -s frontend 'cd $(FRONTEND_DIR) && npm run start' }
else ifeq ($(OS),Windows_NT)
	@start cmd /c "cd $(FRONTEND_DIR) && npm i" || echo 'Erreur: Impossible de démarrer le frontend'
endif


# Commande pour démarrer les deux serveurs
start-all: start-backend start-frontend
	@echo "Les serveurs backend et frontend ont démarré."

.PHONY: start-backend start-frontend start-all
