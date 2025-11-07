#!/bin/bash
echo "Yerel web sunucusu başlatılıyor..."
echo "Admin paneli: http://localhost:8000/admin.html"
python3 -m http.server 8000
