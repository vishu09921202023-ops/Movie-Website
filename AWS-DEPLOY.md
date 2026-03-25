# 🚀 AWS Deployment Guide - VN Movies HD
## (All-in-One: MongoDB + Backend + Frontend on single EC2)

## Architecture
```
Internet → EC2 (Nginx Port 80/443)
                ├── Frontend Next.js  (Port 3000)
                ├── Backend Node.js   (Port 5000)
                └── MongoDB Community (Port 27017, local only)
```
**No Atlas needed. Sab kuch ek hi EC2 pe!**

---

## STEP 1 — Launch EC2 Instance on AWS

1. Go to **https://aws.amazon.com** → Sign in → EC2
2. Click **Launch Instance**
3. Settings:
   - **Name:** vnmovies-server
   - **OS:** Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance type:** t3.small (Recommended — $15/month) or t2.micro (Free 12 months — may be slow)
   - **Storage:** 20 GB (default 8 GB kam padega MongoDB ke liye, 20 karo)
   - **Key pair:** Create new → download `.pem` file → **SAVE IT SAFELY (yahi tumhara password hai)**
   - **Security Group (Firewall):** Add these rules:
     | Type       | Port | Source     |
     |------------|------|------------|
     | SSH        | 22   | My IP      |
     | HTTP       | 80   | 0.0.0.0/0  |
     | HTTPS      | 443  | 0.0.0.0/0  |
4. Click **Launch Instance**
5. Note your **Public IPv4 address** (e.g. `13.201.45.67`)

> ⚠️ **MongoDB port 27017 ko Security Group mein ADD MAT KARO** — woh sirf localhost pe hona chahiye (security ke liye)

---

## STEP 2 — Connect to EC2 (Windows se)

PowerShell open karo jahan `.pem` file save hai:
```powershell
# .pem file ko sahi permission do (Windows)
icacls "your-key.pem" /inheritance:r /grant:r "%username%:R"

# Connect karo
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

---

## STEP 3 — Install Everything on EC2

EC2 pe connect hone ke baad yeh sab run karo **ek ek karke**:

### 3a. System Update
```bash
sudo apt update && sudo apt upgrade -y
```

### 3b. Node.js 20 Install
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x.x dikhna chahiye
```

### 3c. MongoDB 7 Install
```bash
# MongoDB GPG key aur repo add karo
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install karo
sudo apt update
sudo apt install -y mongodb-org

# Start aur enable karo
sudo systemctl start mongod
sudo systemctl enable mongod

# Check karo — "Active: active (running)" dikhna chahiye
sudo systemctl status mongod
```

### 3d. Nginx + PM2 + Git
```bash
sudo apt install -y nginx git
sudo npm install -g pm2
nginx -v && pm2 -v && git --version
```

---

## STEP 4 — Clone Project from GitHub

```bash
cd ~
git clone https://github.com/vishu09921202023-ops/Movie-Website.git
cd Movie-Website
```

---

## STEP 5 — Data Import: Local MongoDB → EC2 MongoDB

**Pehle local PC (Windows) pe** database export karo:
```powershell
# Windows PowerShell mein (local machine pe)
cd C:\Users\nawar\Downloads\Movie-Website\backend
mongodump --uri="mongodb://localhost:27017/vegamovies" --out=./backup
```

Agar `mongodump` command nahi mili toh MongoDB tools install karo:
- Download: https://www.mongodb.com/try/download/database-tools
- Install karke PATH mein add karo

**Phir backup ko EC2 pe bhejo:**
```powershell
# Windows PowerShell mein (local machine pe)
# backup folder EC2 pe copy karo
scp -i "your-key.pem" -r C:\Users\nawar\Downloads\Movie-Website\backend\backup ubuntu@YOUR_EC2_IP:~/
```

**EC2 pe restore karo:**
```bash
# EC2 pe (SSH session mein)
mongorestore --uri="mongodb://localhost:27017/vegamovies" --dir=~/backup/vegamovies --db=vegamovies
# Verify: sab data aa gaya?
mongosh --eval "use vegamovies; db.movies.countDocuments()"
```

---

## STEP 6 — Backend Setup

```bash
cd ~/Movie-Website/backend
npm install

# .env file banao
nano .env
```

Yeh paste karo (Ctrl+X, Y, Enter se save karo):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vegamovies
JWT_SECRET=vnmovies_production_secret_change_this_to_random_64char_string_abc123
CORS_ORIGIN=http://YOUR_EC2_IP
NODE_ENV=production
```

---

## STEP 7 — Frontend Setup

```bash
cd ~/Movie-Website/frontend
npm install

# .env.local file banao
nano .env.local
```

Yeh paste karo:
```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP/api
NEXT_PUBLIC_SITE_NAME=VN Movies HD
NEXT_PUBLIC_SITE_URL=http://YOUR_EC2_IP
NODE_ENV=production
```

```bash
# Build karo (5-10 min lagega)
npm run build
```

---

## STEP 8 — PM2 se Start Karo

```bash
cd ~/Movie-Website

# Dono start karo
pm2 start ecosystem.config.js

# Status check karo
pm2 list
# "online" dikhna chahiye dono ke liye

# Auto-restart on server reboot
pm2 save
pm2 startup
# Jo command output mein aaye woh COPY karke run karo (sudo env PATH=... wali)
```

---

## STEP 9 — Nginx Setup

```bash
sudo cp ~/Movie-Website/nginx.conf /etc/nginx/sites-available/vnmovies
sudo ln -s /etc/nginx/sites-available/vnmovies /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t        # "syntax is ok" aana chahiye
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## STEP 10 — Test Karo! 🎉

Browser mein open karo:
```
http://YOUR_EC2_IP              → Main website
http://YOUR_EC2_IP/api/health   → API check
```

**Phone pe bhi khologe toh chalega!** Kisi ko bhi link share karo! 📱

---

## STEP 11 (Optional) — Free Custom Domain + HTTPS

### Domain lao (~₹500/year):
1. GoDaddy ya Namecheap se domain kharido
2. DNS mein **A Record** add karo: `@` → `YOUR_EC2_IP`
3. 10-30 min wait karo

### Nginx config update karo:
```bash
sudo nano /etc/nginx/sites-available/vnmovies
# server_name _ ;  ko  server_name yourdomain.com;  se replace karo
sudo systemctl restart nginx
```

### Backend/Frontend env update karo:
```bash
# Backend .env
nano ~/Movie-Website/backend/.env
# CORS_ORIGIN=https://yourdomain.com

# Frontend .env.local
nano ~/Movie-Website/frontend/.env.local
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Rebuild frontend
cd ~/Movie-Website/frontend && npm run build
pm2 restart all
```

### Free HTTPS/SSL:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Email dalo, agree karo — done!
```

---

## Website Update karna (Baad mein code changes ke liye)

**Local machine pe pehle push karo:**
```powershell
cd C:\Users\nawar\Downloads\Movie-Website
git add -A
git commit -m "update"
git push
```

**EC2 pe pull karo:**
```bash
cd ~/Movie-Website
git pull origin master

# Agar backend changed:
pm2 restart backend

# Agar frontend changed:
cd frontend && npm run build && pm2 restart frontend
```

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| EC2 t2.micro | Free Tier (12 months) | **FREE** |
| EC2 t3.small (after free tier) | On-demand | ~$15/month |
| MongoDB (on EC2) | Self-hosted | **FREE** |
| Nginx + PM2 | Open source | **FREE** |
| Domain (optional) | Annual | ~₹500/year |

**Pehle 12 mahine: BILKUL FREE** 🎉

---

## Troubleshooting

```bash
# Processes running hain?
pm2 list

# Logs dekho
pm2 logs backend --lines 50
pm2 logs frontend --lines 50

# MongoDB chal raha hai?
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"

# Sab restart karo
pm2 restart all
sudo systemctl restart nginx

# Ports check karo
sudo ss -tlnp | grep -E "80|3000|5000|27017"
```
