#!/bin/bash

# Assurez-vous que le script s'arrête en cas d'erreur
set -e

# Nettoyer les conteneurs existants
echo "Arrêt et suppression des conteneurs existants..."
docker system prune --all

clear

# Construire les images
echo "Construction des images Docker..."
docker-compose build --no-cache

clear

# Lancer les conteneurs
echo "Lancement des conteneurs..."
docker-compose up
