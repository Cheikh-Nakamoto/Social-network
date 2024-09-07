#!/bin/bash

while true; do
    git add -u
    git commit -m "we can merge"
    git pull
    git push
    # Attendre 30 minutes (1800 secondes) avant de répéter
    sleep 1200
done
