# Railway Deployment Guide - PDFMagic

## 🚀 Deploy PDFMagic to Railway (Recommended)

Railway is the best platform for Node.js applications with file uploads. It properly handles backend servers, API routes, and static files.

---

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up/login with GitHub
4. Authorize Railway to access your GitHub repositories

---

## Step 2: Create New Project

1. After login, click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Find and select your `pdfmagic` repository
4. Click **"Import"**

---

## Step 3: Configure Project

Railway will automatically detect Node.js. Verify these settings:

**Build Settings:**
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Environment Variables:**
- **PORT:** Railway automatically sets this
- **NODE_ENV:** `production`

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for deployment to complete (2-3 minutes)
3. Railway will:
   - Install all dependencies
   - Build the application
   - Start the Node.js server
   - Give you a deployment URL

**Your app will be live at:** `https://pdfmagic.up.railway.app` (or similar)

---

## Step 5: Test Deployment

1. Open your Railway URL
2. Test main page: `https://your-url.railway.app`
3. Test a tool: `https://your-url.railway.app/merge-pdf`
4. Upload and process a PDF file
5. Verify download works

---

## Step 6: Connect Custom Domain

### Option A: Use Railway's Free Domain
- Railway provides a free `.railway.app` domain
- No DNS configuration needed
- Works immediately

### Option B: Connect Your .live Domain

1. **In Railway Dashboard:**
   - Go to your project
   - Click **"Settings"** tab
   - Click **"Domains"**
   - Click **"Add Domain"**
   - Enter: `wwwpdfmagic.live`
   - Click **"Add"**

2. **Railway will show DNS records:**
   - Copy the A record IP address
   - Copy the CNAME record

3. **Configure DNS in name.com:**
   - Go to [name.com](https://name.com)
   - Select your domain
   - Go to **DNS Management**
   - Add these records:

```
Type: A
Host: @
Value: [Railway A Record IP]
TTL: 3600

Type: CNAME
Host: www
Value: [Railway CNAME]
TTL: 3600
```

4. **Wait for DNS propagation:**
   - Usually takes 5-30 minutes
   - Railway will automatically verify
   - SSL certificate will be issued automatically

---

## Step 7: Verify Everything Works

1. **Test main domain:** `https://wwwpdfmagic.live`
2. **Test all tools:**
   - Merge PDF
   - Split PDF
   - Compress PDF
   - PDF to Word
   - PDF to JPG
   - JPG to PDF
   - All other tools

3. **Check:**
   - ✅ Pages load without 404 errors
   - ✅ JavaScript files load correctly
   - ✅ API endpoints respond
   - ✅ File uploads work
   - ✅ Downloads work
   - ✅ No MIME type errors

---

## Troubleshooting

### Deployment Fails
- Check Railway logs for errors
- Verify `package.json` has correct scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### 404 Errors
- Check if server is running
- Verify routes are defined in `server.js`
- Check Railway logs for startup errors

### File Upload Errors
- Ensure `uploads/` directory exists
- Check file size limits
- Verify multer configuration

### Domain Not Working
- Wait 30 minutes for DNS propagation
- Check DNS records are correct
- Verify Railway domain is verified
- Clear browser cache

---

## Railway vs Other Platforms

| Feature | Railway | Vercel | Render |
|---------|--------|--------|--------|
| Node.js Support | ✅ Excellent | ❌ Limited | ✅ Good |
| File Uploads | ✅ Native | ❌ Difficult | ✅ Good |
| API Routes | ✅ Full | ❌ Limited | ✅ Good |
| Static Files | ✅ Full | ✅ Excellent | ✅ Good |
| Free Tier | ✅ $5 credit | ✅ Limited | ✅ Free |
| SSL | ✅ Auto | ✅ Auto | ✅ Auto |
| Custom Domain | ✅ Free | ✅ Free | ✅ Free |

**Railway is the best choice for PDFMagic because:**
- Designed for Node.js applications
- Native support for file uploads
- Proper API route handling
- Easy deployment from GitHub
- Good free tier ($5 credit)
- Automatic SSL certificates

---

## Cost

**Railway Free Tier:**
- $5 free credit every month
- Enough for small to medium applications
- Auto-sleeps when not in use
- Wakes up on first request

**If you exceed free tier:**
- Pay-as-you-go pricing
- ~$0.0004 per request
- Very affordable for most use cases

---

## Maintenance

### Monitor Logs
- Go to Railway dashboard
- Click **"Logs"** tab
- View real-time server logs
- Debug any issues

### Redeploy
- Push changes to GitHub
- Railway auto-deploys on push
- Or click **"Redeploy"** button manually

### Update Dependencies
- Update `package.json`
- Push to GitHub
- Railway will rebuild

---

## Summary

**Railway Deployment Steps:**
1. Create Railway account
2. Import `pdfmagic` repository
3. Deploy (automatic)
4. Test deployment
5. Connect custom domain (optional)
6. Verify all tools work

**Time to deploy:** ~5 minutes
**Difficulty:** Easy
**Cost:** Free (with $5 credit)

---

## Support

If you encounter issues:
- Check Railway logs
- Review this guide
- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Railway community support

---

**Deploy to Railway now and your PDFMagic app will work perfectly!** 🚀
