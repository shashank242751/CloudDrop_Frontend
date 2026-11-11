# Deploying CloudDrop Frontend on AWS Amplify 🚀

**AWS Amplify Hosting** provides serverless global CDN delivery, automatic HTTPS/SSL certificates, continuous deployment from GitHub, and is **100% Free Tier eligible** (1,000 build minutes and 15 GB/month bandwidth free).

Because AWS Amplify takes the built static files (`dist/`) directly, **you do not need Docker, Nginx, or EC2 for the frontend!**

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Push Frontend to GitHub
```bash
cd "d:\AWS Study\project-01\frontend"
git add .
git commit -m "feat: configure frontend for pure AWS Amplify hosting"
git push -u origin main
```

---

### Step 2: Connect AWS Amplify to GitHub

1. Open the [AWS Management Console](https://console.aws.amazon.com/).
2. In the search bar, type **Amplify** and open **AWS Amplify**.
3. Click **Host an application** (or **Create new app** > **Host web app**).
4. Select **GitHub** as your Git provider and click **Next**.
5. Authorize AWS Amplify to access your GitHub account.
6. Select:
   - **Repository**: `shashank242751/CloudDrop_Frontend`
   - **Branch**: `main`
7. Click **Next**.

---

### Step 3: Configure Build Settings & Environment Variable

AWS Amplify automatically detects [`amplify.yml`](../amplify.yml) from your repository:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Set the Backend NLB URL:
Under **Environment variables**, click **Add variable**:
- **Variable**: `VITE_API_URL`
- **Value**: `http://<YOUR_BACKEND_NLB_DNS_NAME>`  
  *(Example: `http://clouddrop-demo-nlb-123456789.elb.us-east-1.amazonaws.com`)*

Click **Next** -> Click **Save and deploy**.

---

### Step 4: Configure SPA Rewrites and Redirects (Crucial for React)

In Single Page Applications, if a user refreshes the page on a sub-route, Amplify needs to route it to `index.html`:

1. In the Amplify console, on the left navigation menu, click **Rewrites and redirects**.
2. Click **Edit** and ensure this rule is present (or add it):
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`
3. Click **Save**.

---

### Step 5: Live Site Verification

Within 1 to 2 minutes, Amplify finishes provisioning, building, and deploying.
- You will see a live public URL such as `https://main.d123456abcdef.amplifyapp.com`.
- Open the link in any browser or mobile phone:
  1. Test uploading a file (watch the direct-to-S3 progress bar).
  2. Test copying the shareable download link.
  3. Click **Architecture & Topics** to view the live backend AWS services overview.
