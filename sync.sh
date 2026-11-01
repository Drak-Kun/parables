#!/data/data/com.termux/files/usr/bin/bash

cd ~/parables || exit 1

while true; do
    git pull --ff-only --quiet
    sleep 10
done
