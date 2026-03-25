# 🚀 AWS Deployment Guide - VN Movies HD

## Architecture
```
Internet → EC2 (Nginx Port 80) → Frontend (Port 3000) + Backend (Port 5000)
                                → MongoDB Atlas (Cloud DB)
```

---

## STEP 1 — MongoDB Atlas Setup (Free Cloud Database)

1. Go to **https://www.mongodb.com/atlas** → Sign up free
2. Create a new **Cluster** → Choose FREE tier (M0)
3. Choose region: **Mumbai (ap-south-1)** for best India speed
4. Click **Connect** → **Connect your application**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vegamovies
   ```
6. Under **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0)

### Migrate your local data to Atlas:
Run this on your local machine (replace YOUR_ATLAS_URI):
```bash
cd C:\Users\nawar\Downloads\Movie-Website\backend
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/vegamovies" --out=./backup

# Import to Atlas
mongorestore --uri="YOUR_ATLAS_URI" --dir=./backup/vegamovies --db=vegamovies
```

---

## STEP 2 — Launch EC2 Instance on AWS

1. Go to **https://aws.amazon.com** → Sign in → EC2
2. Click **Launch Instance**
3. Settings:
   - **Name:** vnmovies-server
   - **OS:** Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance type:** t2.micro (FREE for 12 months)
   - **Key pair:** Create new → download `.pem` file → SAVE IT SAFELY
   - **Security Group (Firewall):** Add these rules:
     | Type | Port | Source |
     |------|------|--------|
     | SSH  | 22   | My IP  |
     | HTTP | 80   | 0.0.0.0/0 |
     | HTTPS| 443  | 0.0.0.0/0 |
     | Custom TCP | 5000 | 0.0.0.0/0 |
4. Click **Launch Instance**
5. Note your **Public IPv4 address** (e.g. `13.201.45.67`)

---

## STEP 3 — Connect to EC2

On Windows, open PowerShell:
```powershell
# Move to where you saved the .pem file, then:
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# If permission error on .pem file:
icacls "your-key.pem" /inheritance:r /grant:r "%username%:R"
```

---

## STEP 4 — Install Dependencies on EC2

Run these commands on the EC2 server (after SSH):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node installed
node -v   # Should show v20.x.x
npm -v

# Install PM2 (keeps app running forever)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify all
nginx -v && pm2 -v && git --version
```

---

## STEP 5 — Clone Your Project from GitHub

```bash
# On EC2 server:
cd ~
git clone https://github.com/vishu09921202023-ops/Movie-Website.git
cd Movie-Website
```

---

## STEP 6 — Setup Backend

```bash
cd ~/Movie-Website/backend

# Install dependencies
npm install

# Create environment file
nano .env
```

Paste this into the file (press Ctrl+X, Y, Enter to save):
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vegamovies
JWT_SECRET=vegamovies_super_secret_jwt_key_2024_change_in_production_64chars_long_xyz
CORS_ORIGIN=http://YOUR_EC2_IP,https://yourdomain.com
NODE_ENV=production
```

---

## STEP 7 — Setup Frontend

```bash
cd ~/Movie-Website/frontend

# Install dependencies
npm install

# Create environment file
nano .env.local
```

Paste this:
```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP/api
NEXT_PUBLIC_SITE_NAME=VN Movies HD
NEXT_PUBLIC_SITE_URL=http://YOUR_EC2_IP
NODE_ENV=production
```

```bash
# Build the frontend
npm run build
```

---

## STEP 8 — Setup PM2 (Auto-restart processes)

```bash
cd ~/Movie-Website

# Copy the ecosystem config
cp ecosystem.config.js ~/

cd ~

# Start both backend and frontend
pm2 start ecosystem.config.js

# Save so they restart on server reboot
pm2 save
pm2 startup
# Run the command it outputs (starts with: sudo env PATH=...)
```

Check everything is running:
```bash
pm2 list
pm2 logs
```

---

## STEP 9 — Setup Nginx (Reverse Proxy)

```bash
# Copy Nginx config
sudo cp ~/Movie-Website/nginx.conf /etc/nginx/sites-available/vnmovies
sudo ln -s /etc/nginx/sites-available/vnmovies /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## STEP 10 — Test Your Website

Open in browser:
```
http://YOUR_EC2_IP        → Website (phone pe bhi open hoga)
http://YOUR_EC2_IP/api/health → API test
```

Share this IP with anyone and they can access the site! 🎉

---

## STEP 11 (Optional) — Custom Domain Name

1. Buy a domain from **GoDaddy/Namecheap** (~₹500/year)
2. In DNS settings → Add **A Record**:
   - Name: `@`
   - Value: `YOUR_EC2_IP`
3. Wait 10-30 minutes for DNS to propagate
4. Update `NEXT_PUBLIC_API_URL` and `CORS_ORIGIN` to use your domain
5. Rebuild frontend: `cd ~/Movie-Website/frontend && npm run build && pm2 restart frontend`

---

## STEP 12 (Optional) — Free HTTPS/SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## Updating Website Later (After Code Changes)

```bash
# SSH into EC2, then:
cd ~/Movie-Website
git pull origin master

# If backend changed:
pm2 restart backend

# If frontend changed:
cd frontend && npm run build && pm2 restart frontend
```

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| EC2 t2.micro | Free Tier (12 months) | FREE |
| MongoDB Atlas M0 | Free forever | FREE |
| EC2 after 12 months | On-demand | ~$8-10/month |
| Domain name (optional) | Annual | ~₹500-1000/year |

**Total for first year: FREE** 🎉

---

## Troubleshooting

```bash
# Check if processes are running
pm2 list

# View logs
pm2 logs backend
pm2 logs frontend

# Restart everything
pm2 restart all

# Check Nginx errors
sudo journalctl -u nginx -n 50

# Check ports
sudo netstat -tlnp
```
