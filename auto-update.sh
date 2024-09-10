#!/bin/bash

# Fonction pour mettre à jour et pousser
update_and_push() {
    # Stasher les modifications locales
    git stash save "Préparation de la mise à jour"

    # Mise à jour de la branche master
    git checkout master
    git pull origin master

    # Appliquer le stash et ajouter les modifications
    git stash apply
    git add .
    git commit -m "Janel has pushed at $(date)"
    
    # Pousser les modifications
    git push origin master

    # Rebrancher sur la branche actuelle
    git checkout $(git rev-parse --abbrev-ref HEAD)

    echo "\n\nJanel has pushed at $(date)\n\n"
}

# Boucle infinie
while true; do
    update_and_push
    sleep 900
done
