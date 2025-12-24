# VNU Dating Website - Deployment Guide

## 📋 Deployment Requirements

This application can be deployed for **FREE** using:
- **Backend**: Render.com (Free tier)
- **Database**: MongoDB Atlas (Free tier - 512MB)
- **Frontend**: Served from Express (or Vercel/Netlify separately)

---

## 🚀 Step-by-Step Deployment

### 1️⃣ Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/GitHub or email

2. **Create a Free Cluster**
   - Choose FREE tier (M0 Sandbox - 512MB)
   - Select region closest to you (e.g., Singapore)
   - Cluster name: `vnu-dating-cluster`

3. **Configure Database Access**
   - Go to "Database Access" → Add Database User
   - Username: `vnudating`
   - Password: Generate secure password (save it!)
   - User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" → Add IP Address
   - Choose: **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Render.com to connect

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string:
     ```
     mongodb+srv://vnudating:<password>@vnu-dating-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password

---

### 2️⃣ Create .env File Locally

Create `.env` file in project root:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secure_random_string_here_change_this
MONGODB_URI=mongodb+srv://vnudating:YOUR_PASSWORD@vnu-dating-cluster.xxxxx.mongodb.net/vnu-dating?retryWrites=true&w=majority
```

**Important**: 
- Generate a strong JWT_SECRET (random 32+ characters)
- Add `/vnu-dating` after `.net` to specify database name

---

### 3️⃣ Migrate Data to MongoDB

Run migration script:

```bash
# Clear existing MongoDB data and migrate
node migrate-to-mongodb.js --clear

# Or just migrate (append to existing data)
node migrate-to-mongodb.js
```

Verify migration:
```bash
# Test new MongoDB-based server
node server-mongodb.js
```

Test in browser: http://localhost:3000

---

### 4️⃣ Deploy to Render.com

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create Render Account**
   - Visit: https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the `vnu-dating-website` repo

4. **Configure Service**
   - **Name**: `vnu-dating-app` (or your choice)
   - **Region**: Singapore (or closest)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server-mongodb.js`
   - **Plan**: Free

5. **Add Environment Variables**
   Click "Advanced" → Add Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your_super_secure_random_string_here
   MONGODB_URI=mongodb+srv://vnudating:PASSWORD@vnu-dating-cluster.xxxxx.mongodb.net/vnu-dating?retryWrites=true&w=majority
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment
   - Your app will be live at: `https://vnu-dating-app.onrender.com`

---

## 📝 Important Notes

### Free Tier Limitations

**Render.com Free Tier:**
- ✅ Free forever
- ⚠️ App sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds to wake up
- ✅ 750 hours/month (enough for 1 app running 24/7)

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage (enough for thousands of users)
- ✅ No sleep/downtime
- ✅ Shared cluster performance

### File Changes Required

**Update package.json** (Already done):
```json
{
  "scripts": {
    "start": "node server-mongodb.js"
  }
}
```

### Testing Before Deployment

1. Test MongoDB connection locally:
   ```bash
   node server-mongodb.js
   ```

2. Test all features:
   - Registration
   - Login
   - Questionnaires
   - Matching
   - Premium purchase
   - Connections

3. Check logs for errors

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Check IP whitelist in MongoDB Atlas (0.0.0.0/0)
- Verify password in connection string (no special chars like `@`, `%`)
- Check database name in URI

### Render Deployment Failed
- Check build logs in Render dashboard
- Verify environment variables are set
- Check `node server-mongodb.js` runs locally

### App Not Loading
- Wait 60 seconds (cold start after sleep)
- Check Render logs for errors
- Verify MongoDB connection string

---

## 📊 Cost Estimation

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Render.com | Free | $0/month | 750 hours, sleeps after inactivity |
| MongoDB Atlas | M0 Free | $0/month | 512MB storage, shared CPU |
| **Total** | | **$0/month** | |

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/GoDaddy ($10-15/year)
   - Add custom domain in Render settings

2. **Upgrade if Needed**
   - Render Starter: $7/month (no sleep, better performance)
   - MongoDB M10: $9/month (2GB storage, dedicated CPU)

3. **Monitoring**
   - Use Render dashboard to monitor logs
   - MongoDB Atlas has built-in monitoring

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs
2. Check MongoDB Atlas: Metrics → Network
3. Test locally first with same .env configuration

---

**Created**: December 2024  
**Updated**: Ready for production deployment
