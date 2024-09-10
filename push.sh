#!/bin/bash

while true; do
    git stash
    git pull
    git stash apply
    git add .
    git commit -m "we can merge"
    git pull
    git push
    # Attendre 30 minutes (1800 secondes) avant de répéter
    sleep 1200
done
