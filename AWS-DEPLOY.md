# 🚀 AWS Deployment Guide - VN Movies HD
## (Pure AWS: DynamoDB + EC2 — No MongoDB!)

## Architecture
```
Internet → EC2 (Nginx Port 80/443)
                ├── Frontend Next.js  (Port 3000)
                └── Backend Node.js   (Port 5000)
                         ↓
              AWS DynamoDB (Managed, Serverless)
              ├── vnmovies-movies
              ├── vnmovies-admins
              ├── vnmovies-analytics
              └── vnmovies-sitelinks
```
**No MongoDB. No Atlas. Pure AWS!**
- Database: **Amazon DynamoDB** (Serverless, auto-scaling, free tier 25 GB)
- Compute: **Amazon EC2** (Ubuntu, Node.js + Nginx + PM2)

---

## STEP 1 — Create DynamoDB Tables

> DynamoDB ek serverless AWS database hai — koi server install nahi karna, koi port nahi, koi maintenance nahi.

1. AWS Console → Search: **DynamoDB** → Click **Tables** → **Create table**
2. **4 tables** banaao (ek ek kar ke):

| Table Name | Partition Key | Type |
|------------|--------------|------|
| `vnmovies-movies` | `id` | String |
| `vnmovies-admins` | `id` | String |
| `vnmovies-analytics` | `pk` | String |
| `vnmovies-sitelinks` | `id` | String |

**Har table ke liye settings:**
- Capacity mode: **On-demand** (Pay per request — saste mein)
- Baaki sab default

Ya AWS CLI se ek command mein sab bana lo (EC2 pe baad mein bhi kar sakte ho):
```bash
node backend/db/setup-tables.js
```

---

## STEP 2 — Create IAM Role for EC2

EC2 ko DynamoDB access chahiye. IAM Role se credentials manage hoti hain automatically.

1. AWS Console → **IAM** → **Roles** → **Create role**
2. Trusted entity: **AWS service** → **EC2** → Next
3. Permissions: Search `AmazonDynamoDBFullAccess` → Select it → Next
4. Role name: `vnmovies-ec2-role` → **Create role**

Yeh role EC2 pe attach karoge Step 3 mein.

---

## STEP 3 — Launch EC2 Instance

1. AWS Console → **EC2** → **Launch Instance**
2. Settings:
   - **Name:** vnmovies-server
   - **OS:** Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance type:** t2.micro (Free 12 months) ya t3.small (better performance, ~$15/month)
   - **Storage:** 10 GB (DynamoDB ke liye extra storage nahi chahiye!)
   - **Key pair:** Create new → download `.pem` file → **SAVE IT SAFELY**
   - **Security Group:** Add these rules:
     | Type  | Port | Source    |
     |-------|------|-----------|
     | SSH   | 22   | My IP     |
     | HTTP  | 80   | 0.0.0.0/0 |
     | HTTPS | 443  | 0.0.0.0/0 |
3. **Advanced details** → **IAM instance profile** → Select `vnmovies-ec2-role`
4. **Launch Instance**
5. Note your **Public IPv4 address**

---

## STEP 4 — Connect to EC2 (Windows se)

```powershell
# Windows PowerShell mein — jahan .pem file save hai
icacls "your-key.pem" /inheritance:r /grant:r "%username%:R"
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

---

## STEP 5 — Install Node.js, Nginx, PM2 on EC2

```bash
# System update
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x.x dikhna chahiye

# Nginx + Git + PM2
sudo apt install -y nginx git
sudo npm install -g pm2

# Verify
nginx -v && pm2 -v && git --version
```

> **Note:** MongoDB install NAHI karna — DynamoDB AWS pe directly hoga!

---

## STEP 6 — Clone Project + Install Dependencies

```bash
cd ~
git clone https://github.com/vishu09921202023-ops/Movie-Website.git
cd Movie-Website

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies + build
cd frontend && npm install && npm run build && cd ..
```

---

## STEP 7 — Create DynamoDB Tables (from EC2)

```bash
cd ~/Movie-Website
node backend/db/setup-tables.js
# Output: ✓ Created: vnmovies-movies etc.
```

---

## STEP 8 — Configure Environment Files

### Backend `.env`:
```bash
nano ~/Movie-Website/backend/.env
```
Paste karo:
```env
PORT=5000
JWT_SECRET=CHANGE_THIS_TO_64_CHAR_RANDOM_STRING_abc123xyz
CORS_ORIGIN=http://YOUR_EC2_IP
NODE_ENV=production
AWS_REGION=ap-south-1
DYNAMO_TABLE_MOVIES=vnmovies-movies
DYNAMO_TABLE_ADMINS=vnmovies-admins
DYNAMO_TABLE_ANALYTICS=vnmovies-analytics
DYNAMO_TABLE_SITELINKS=vnmovies-sitelinks
```
> **`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` mat daalo** — EC2 IAM Role automatically credentials provide karta hai!

### Frontend `.env.local`:
```bash
nano ~/Movie-Website/frontend/.env.local
```
Paste karo:
```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP/api
NEXT_PUBLIC_SITE_NAME=VN Movies HD
NEXT_PUBLIC_SITE_URL=http://YOUR_EC2_IP
NODE_ENV=production
```

---

## STEP 9 — Migrate Data: Local MongoDB → DynamoDB

**Pehle local PC (Windows) pe** yeh run karo:
```powershell
# Windows PowerShell mein
cd C:\Users\nawar\Downloads\Movie-Website\backend

# AWS credentials temporarily set karo (local PC pe sirf)
$env:AWS_ACCESS_KEY_ID="your_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret"
$env:AWS_REGION="ap-south-1"

# Migrate karo
npm install
node db/migrate.js
```

Migration script:
- Local MongoDB se sabhi movies, admins, analytics, sitelinks padta hai
- DynamoDB mein seedta hai
- Output mein progress dikhta hai

> Agar MongoDB local pe nahi hai ya fresh start chahte ho, admin panel se manually movies add karo ya seed script se.

---

## STEP 10 — Start with PM2 + Configure Nginx

```bash
cd ~/Movie-Website
pm2 start ecosystem.config.js
pm2 list   # "online" dikhna chahiye

# Auto-start on reboot
pm2 save
pm2 startup
# Jo command output mein aaye woh run karo (sudo env PATH=... wali)

# Nginx setup
sudo cp nginx.conf /etc/nginx/sites-available/vnmovies
sudo ln -s /etc/nginx/sites-available/vnmovies /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t   # "syntax is ok"
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## STEP 11 — Create Admin User

```bash
cd ~/Movie-Website/backend
node -e "
const Admin = require('./models/Admin');
const a = new Admin({ username: 'admin', email: 'admin@vnmovies.com', passwordHash: 'YOUR_PASSWORD', role: 'admin' });
a.save().then(() => { console.log('✅ Admin created!'); process.exit(0); }).catch(e => { console.error(e.message); process.exit(1); });
"
```

---

## STEP 12 — Test! 🎉

```
http://YOUR_EC2_IP        → Main website
http://YOUR_EC2_IP/api/health → API check (should return {"status":"OK"})
```

**Phone pe bhi kholega! Kisi ko bhi link share karo!** 📱

---

## STEP 13 (Optional) — Free Domain + HTTPS

```bash
# Domain: GoDaddy/Namecheap se kharido, DNS A Record → YOUR_EC2_IP

# Nginx config update:
sudo nano /etc/nginx/sites-available/vnmovies
# server_name _; → server_name yourdomain.com;
sudo systemctl restart nginx

# Free SSL:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Update env files with domain name, then:
pm2 restart all
```

---

## Update Website (Later Code Changes)

```powershell
# Local PC pe — push to GitHub
cd C:\Users\nawar\Downloads\Movie-Website
git add -A; git commit -m "update"; git push
```

```bash
# EC2 pe — pull latest
cd ~/Movie-Website && git pull origin master
# If backend changed: pm2 restart backend
# If frontend changed: cd frontend && npm run build && pm2 restart frontend
```

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| EC2 t2.micro | Free Tier (12 months) | **FREE** |
| EC2 t3.small (after free tier) | On-demand | ~$15/month |
| **DynamoDB** | Free tier: 25 GB, 200M requests/month | **FREE** |
| Nginx + PM2 | Open source | **FREE** |
| Domain (optional) | Annual | ~₹500/year |

**Pehle 12 mahine: BILKUL FREE** 🎉  
**DynamoDB: Hamesha Free (25 GB tak)** ✅

---

## Troubleshooting

```bash
# PM2 logs
pm2 logs backend --lines 50
pm2 logs frontend --lines 50

# DynamoDB connection test
cd ~/Movie-Website
node -e "const {ddb,scanAll}=require('./backend/db/dynamo'); scanAll('vnmovies-movies').then(r=>console.log('Movies in DB:',r.length)).catch(e=>console.error(e.message))"

# Backend manually test
curl http://localhost:5000/api/health
curl http://localhost:5000/api/movies

# Restart everything
pm2 restart all && sudo systemctl restart nginx
```

