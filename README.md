# CloudDrop Frontend – Intelligent File Transfer Client 💻☁️

> **Modern React 18 Single Page Application (SPA) built with Vite and Tailwind/Modern CSS, deployed globally on AWS Amplify Hosting.**

Repository: [https://github.com/shashank242751/CloudDrop_Frontend.git](https://github.com/shashank242751/CloudDrop_Frontend.git)

---

## ⚡ Key Capabilities

- **Direct S3 Pre-Signed Uploads**: Streams multi-GB files directly from the browser to Amazon S3 with live upload progress.
- **Dynamic File Transfer Dashboard**: Real-time view of active files, status badges (`PENDING`, `PROCESSING`, `READY`), download counters, and TTL countdowns.
- **Interactive AWS Architecture Modal**: In-app modal detailing the AWS backend architecture (NLB, Apache, EC2, ASG, S3, DynamoDB, Lambda, IAM).
- **100% AWS Amplify Native**: No Docker or server maintenance. Auto-deploys from GitHub to AWS's global Content Delivery Network (CloudFront) with free SSL!

---

## 📂 Repository Structure

```
frontend/
├── .github/
│   └── workflows/
│       └── frontend-ci-cd.yml         # GitHub Actions build & test workflow
├── docs/
│   ├── AWS_AMPLIFY_DEPLOYMENT.md      # Step-by-step Amplify deployment guide
│   ├── CONNECTING_TO_BACKEND.md       # Connecting frontend to backend NLB URL
│   └── FRONTEND_ARCHITECTURE.md       # React architecture & component details
├── src/
│   ├── components/                    # UI Components (FileUploader, FileList, etc.)
│   ├── services/api.ts                # Direct S3 upload & REST client
│   ├── types.ts                       # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── amplify.yml                        # AWS Amplify Hosting build specification
├── package.json
└── vite.config.ts
```

---

## ⚡ Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Open in browser:
# http://localhost:5173
```

---

## 🚀 1-Click AWS Amplify Deployment

1. Push this repository to GitHub: `https://github.com/shashank242751/CloudDrop_Frontend.git`.
2. Open the **AWS Management Console** -> **AWS Amplify**.
3. Click **Host an application** -> Select **GitHub** -> Choose `CloudDrop_Frontend` (branch: `main`).
4. In **Environment variables**, add:
   - `VITE_API_URL`: `http://<YOUR_BACKEND_NLB_DNS_NAME>`
5. Click **Save and deploy**. AWS Amplify automatically builds and hosts your app on a global HTTPS CDN URL!

See [`docs/AWS_AMPLIFY_DEPLOYMENT.md`](./docs/AWS_AMPLIFY_DEPLOYMENT.md) for full screenshots and instructions.
