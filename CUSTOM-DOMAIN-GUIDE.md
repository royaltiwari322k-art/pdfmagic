# Custom Domain Setup Guide - Name.com to Vercel/Render

## 🌐 Connect Your .live Domain to PDFMagic

### Option 1: Connect to Vercel (Recommended)

#### Step 1: Add Domain in Vercel
1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Domains"** in the left sidebar
4. Click **"Add Domain"** button
5. Enter your domain (e.g., `yourdomain.live`)
6. Click **"Add"**

#### Step 2: Configure DNS in Name.com
1. Go to [name.com](https://name.com) and login
2. Click on your domain
3. Go to **"DNS Management"** or **"DNS Records"**
4. Add the following records:

**For A Record:**
- **Type:** A
- **Host:** @ (or leave blank)
- **Value:** 76.76.21.21
- **TTL:** 3600 (or default)

**For CNAME Record:**
- **Type:** CNAME
- **Host:** www
- **Value:** cname.vercel-dns.com
- **TTL:** 3600 (or default)

#### Step 3: Verify in Vercel
1. Go back to Vercel Domains page
2. Wait for DNS to propagate (usually 5-30 minutes)
3. Vercel will automatically verify the DNS records
4. Once verified, click **"Continue"**

#### Step 4: Enable SSL
1. Vercel will automatically generate SSL certificate
2. Wait for certificate to be issued (1-2 hours)
3. Your domain will be secure with HTTPS

---

### Option 2: Connect to Render

#### Step 1: Add Domain in Render
1. Go to your Render project dashboard
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"** section
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `yourdomain.live`)
6. Click **"Save"**

#### Step 2: Configure DNS in Name.com
1. Go to [name.com](https://name.com) and login
2. Click on your domain
3. Go to **"DNS Management"** or **"DNS Records"**
4. Add the following records:

**For A Record:**
- **Type:** A
- **Host:** @ (or leave blank)
- **Value:** 216.24.57.10 (Render's IP)
- **TTL:** 3600 (or default)

**For CNAME Record:**
- **Type:** CNAME
- **Host:** www
- **Value:** your-app-name.onrender.com
- **TTL:** 3600 (or default)

#### Step 3: Verify in Render
1. Go back to Render Custom Domains page
2. Wait for DNS to propagate (5-30 minutes)
3. Render will automatically verify
4. Once verified, SSL will be automatically configured

---

## 📋 Quick DNS Summary for Name.com

### For Vercel:
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

### For Render:
```
Type: A
Host: @
Value: 216.24.57.10
TTL: 3600

Type: CNAME
Host: www
Value: your-app-name.onrender.com
TTL: 3600
```

---

## ⚠️ Important Notes:

1. **DNS Propagation:** DNS changes take 5-30 minutes to propagate globally
2. **SSL Certificate:** SSL certificates can take 1-2 hours to be issued
3. **www vs non-www:** Both will work once configured
4. **Subdomains:** You can add subdomains like `tools.yourdomain.live` using CNAME records

---

## 🔧 Troubleshooting:

### Domain not working?
- Wait 30 minutes for DNS propagation
- Check DNS records are correct
- Clear browser cache
- Try `ping yourdomain.live` in terminal

### SSL not working?
- Wait 1-2 hours for certificate issuance
- Check DNS records point to correct service
- Verify domain is not proxied through Cloudflare

### Want both www and non-www?
Add both records:
- A record for @ (non-www)
- CNAME record for www

---

## 🎯 Recommended: Vercel

**Why Vercel for custom domains?**
- Automatic SSL (Let's Encrypt)
- Easy DNS configuration
- Fast CDN
- Automatic HTTPS redirects
- No manual SSL setup required

**Steps:**
1. Add domain in Vercel
2. Copy DNS records from Vercel
3. Add records in Name.com
4. Wait for verification
5. Done!

---

## ✅ After Setup:

Your site will be accessible at:
- `https://yourdomain.live`
- `https://www.yourdomain.live`

Update your canonical URLs in all HTML files to use your new domain!
