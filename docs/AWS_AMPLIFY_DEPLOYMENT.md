# Deploying CloudDrop Frontend on AWS Amplify 🚀

AWS Amplify Hosting is the recommended deployment target for the CloudDrop Frontend. It provides global CDN delivery, automated HTTPS certificates, continuous deployment from GitHub, and is **100% Free Tier eligible** (1,000 build minutes and 15 GB/month bandwidth free).

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Push Frontend to GitHub
Ensure your repository is pushed to GitHub:
```bash
git remote add origin https://github.com/shashank242751/CloudDrop_Frontend.git
git push -u origin main
```

---

### Step 2: Connect AWS Amplify to GitHub

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **AWS Amplify**.
3. Click **Host an application** -> Select **GitHub** -> Click **Next**.
4. Authorize AWS Amplify to access your GitHub account.
5. Select:
   - **Repository**: `CloudDrop_Frontend`
   - **Branch**: `main`
6. Click **Next**.

---

### Step 3: Configure Build Settings & Environment Variable

AWS Amplify automatically detects `amplify.yml` present in the repository root.

Under **Environment variables**, click **Add variable**:
- **Variable name**: `VITE_API_URL`
- **Value**: `http://<YOUR_BACKEND_NLB_DNS_NAME>`
*(Example: `http://clouddrop-demo-nlb-123456789.elb.us-east-1.amazonaws.com`)*

Click **Next** -> Click **Save and deploy**.

---

### Step 4: Verification

Within 2 minutes, AWS Amplify will provision, build, and deploy your site to a global CDN URL (e.g. `https://main.d123456.amplifyapp.com`).

- Open the live URL.
- Test uploading a file to verify direct S3 upload and DynamoDB synchronization!
