# PDFMagic Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Option 1: Deploy to Vercel (Easiest & Free)

#### Prerequisites:
- Node.js installed on your computer
- GitHub account
- Vercel account (free)

#### Steps:

**1. Push Code to GitHub**
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pdfmagic.git
git branch -M main
git push -u origin main
```

**2. Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign up/login with GitHub
- Click "Add New Project"
- Select your `pdfmagic` repository
- Click "Deploy"

**3. Configure Vercel Settings**
- Vercel will automatically detect Node.js
- Add environment variables if needed (none required for this app)
- Click "Deploy"

**4. Your App is Live!**
- Vercel will give you a URL like: `https://pdfmagic.vercel.app`
- You can also add custom domain in Vercel settings

---

### Option 2: Deploy to Render (Free)

#### Prerequisites:
- Node.js installed
- GitHub account
- Render account (free)

#### Steps:

**1. Push Code to GitHub** (same as above)

**2. Deploy to Render**
- Go to [render.com](https://render.com)
- Sign up/login with GitHub
- Click "New" → "Web Service"
- Select your `pdfmagic` repository
- Configure settings:
  - **Name:** pdfmagic
  - **Branch:** main
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`
- Click "Create Web Service"

**3. Your App is Live!**
- Render will give you a URL like: `https://pdfmagic.onrender.com`
- First deployment takes 2-3 minutes

---

### Option 3: Deploy to Railway (Free)

#### Prerequisites:
- Node.js installed
- GitHub account
- Railway account (free)

#### Steps:

**1. Push Code to GitHub** (same as above)

**2. Deploy to Railway**
- Go to [railway.app](https://railway.app)
- Sign up/login with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select your `pdfmagic` repository
- Railway will auto-detect Node.js
- Click "Deploy"

**3. Your App is Live!**
- Railway will give you a URL like: `https://pdfmagic.up.railway.app`

---

### Option 4: Deploy to Heroku (Free Tier Limited)

#### Prerequisites:
- Node.js installed
- Heroku account (free)
- Heroku CLI installed

#### Steps:

**1. Install Heroku CLI**
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

**2. Login to Heroku**
```bash
heroku login
```

**3. Create Procfile**
Create a file named `Procfile` (no extension) in your project root:
```
web: node server.js
```

**4. Deploy**
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create pdfmagic

# Push to Heroku
git push heroku main

# Open your app
heroku open
```

---

### Option 5: Deploy to VPS (DigitalOcean, AWS, etc.)

#### Prerequisites:
- VPS server (Ubuntu 20.04+)
- Domain name (optional)

#### Steps:

**1. Connect to VPS**
```bash
ssh root@your-server-ip
```

**2. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

**4. Clone Your Repository**
```bash
git clone https://github.com/YOUR_USERNAME/pdfmagic.git
cd pdfmagic
```

**5. Install Dependencies**
```bash
npm install
```

**6. Start Application with PM2**
```bash
pm2 start server.js --name pdfmagic
pm2 save
pm2 startup
```

**7. Configure Nginx (Optional, for SSL and Domain)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/pdfmagic
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3012;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pdfmagic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**8. Install SSL with Certbot (Optional)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 📝 Important Notes:

1. **Port Configuration:** Your server uses port 3012. Cloud platforms (Vercel, Render, Railway) automatically handle port configuration. For VPS, you may need to use a reverse proxy (Nginx) or change the port to 80.

2. **File Uploads:** The app uses `uploads/` directory. Some cloud platforms have ephemeral storage. For production, consider using cloud storage (AWS S3, Cloudinary) for file uploads.

3. **Environment Variables:** Currently no environment variables are needed, but you can add them for future features.

4. **Domain Configuration:** After deployment, you can add a custom domain in your hosting platform's settings.

5. **SEO:** Your sitemap is at `/sitemap.xml` and canonical URLs are set to `https://www.pdfmagic.io`. Update these to your actual domain after deployment.

---

### 🎯 Recommended: Vercel (Easiest)

**Why Vercel?**
- Free for personal projects
- Automatic SSL certificates
- Global CDN for fast loading
- Zero configuration needed
- Automatic deployments on git push
- Custom domain support

**Quick Start:**
1. Push to GitHub
2. Connect to Vercel
3. Deploy in 1 click

---

### 📞 Need Help?

If you face any issues during deployment:
- Check the deployment logs
- Ensure all dependencies are in `package.json`
- Verify the server port configuration
- Make sure `uploads/` directory exists or handle it dynamically

---

### ✅ Post-Deployment Checklist:

- [ ] Test all 26 PDF tools
- [ ] Verify file upload functionality
- [ ] Check download functionality
- [ ] Test mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Add custom domain (optional)
