#!/bin/bash
# Tester l'API chat
echo "=== Test API Chat ==="
curl -s http://localhost:3002/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"protection des données personnelles"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Réponse (extrait):')
print(data.get('answer','')[:500])
print()
print(f'Sources: {len(data.get(\"sources\",[]))}')
for s in data.get('sources',[])[:3]:
    print(f'  Art. {s[\"article\"]} — {s[\"livre\"][:50]}')
" 2>&1
echo "=== Fin ==="
