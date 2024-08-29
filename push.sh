#!/bin/bash

while true; do
    git add -u
    git commit -m "we can merge"
    git push

    # Attendre 30 minutes (1800 secondes) avant de répéter
    sleep 1800
done
