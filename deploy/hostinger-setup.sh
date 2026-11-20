#!/bin/bash
# ==============================================================================
# Script Otomasi Instalasi Backend Prodil Studio di Hostinger VPS (Ubuntu 22/24)
# ==============================================================================

set -e

echo "🚀 [Prodil Studio] Memulai instalasi otomatis di VPS Hostinger..."

# 1. Update paket sistem
sudo apt update && sudo apt upgrade -y

# 2. Instal curl, git, build-essential
sudo apt install -y curl git ufw build-essential

# 3. Instal Node.js 22 LTS
if ! command -v node &> /dev/null; then
    echo "📦 Menginstal Node.js 22 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "✅ Node.js: $(node -v) & NPM: $(npm -v)"

# 4. Instal PM2 untuk daemon process manager
echo "📦 Menginstal PM2..."
sudo npm install -g pm2

# 5. Instal PostgreSQL
echo "🐘 Menginstal PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# 6. Setup PostgreSQL Database & User
sudo systemctl start postgresql
sudo systemctl enable postgresql

DB_NAME="prodil_studio"
DB_USER="prodil_user"
DB_PASS="ProdilSecurePass2026!"

echo "⚙️ Menyiapkan Database PostgreSQL: $DB_NAME ..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true

# 7. Instal Nginx
echo "🌐 Menginstal Nginx Web Server..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 8. Firewall Configuration (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000/tcp
echo "y" | sudo ufw enable || true

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Fondasi VPS Hostinger Selesai!"
echo "Database URL PostgreSQL Anda:"
echo "postgres://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo ""
echo "Langkah selanjutnya:"
echo "1. Salin folder backend ke: /var/www/prodil-studio/backend"
echo "2. Konfigurasi file .env dengan DATABASE_URL dan GEMINI_API_KEY"
echo "3. Jalankan: npm run db:migrate"
echo "4. Jalankan: pm2 start src/server.js --name prodil-backend"
echo "5. Jalankan: pm2 save && pm2 startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
