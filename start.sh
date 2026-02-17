#!/bin/bash
# Lancer le serveur de dev
cd /Applications/MAMP/htdocs/code-numerique-bj
kill $(lsof -ti:3002) 2>/dev/null
npx next dev -p 3002
