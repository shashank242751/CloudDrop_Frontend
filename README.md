# CloudDrop Frontend – Intelligent File Transfer Client 💻☁️

> **Independent, decoupled React Single Page Application (SPA) for the CloudDrop platform.**
> Built with **React 18**, **TypeScript**, **Vite**, **Lucide Icons**, and pre-configured for **1-click AWS Amplify Hosting** or deployment on a **separate EC2 instance**.

Repository: [https://github.com/shashank242751/CloudDrop_Frontend.git](https://github.com/shashank242751/CloudDrop_Frontend.git)

---

## ⚡ Key Capabilities

- **Direct S3 Pre-Signed Uploads**: Streams multi-GB files directly from the browser to Amazon S3 with live upload progress.
- **Dynamic File Transfer Dashboard**: Real-time view of active files, status badges (`PENDING`, `PROCESSING`, `READY`), download counters, and TTL countdowns.
- **Interactive AWS Architecture Modal**: In-app modal detailing the AWS backend architecture (NLB, Apache, EC2, ASG, S3, DynamoDB, Lambda, IAM).
- **Detachable Asset**: Completely decoupled from backend code; configured via `VITE_API_URL`.

---

## 📂 Repository Structure

```
frontend/
├── .github/
│   └── workflows/
│       └── frontend-ci-cd.yml         # CI/CD: Lint, Build, and Docker image validation
├── docs/
│   ├── FRONTEND_ARCHITECTURE.md       # Frontend architectural deep dive
│   ├── AWS_AMPLIFY_DEPLOYMENT.md      # 1-Click AWS Amplify deployment guide
│   ├── STANDALONE_EC2_DEPLOYMENT.md   # Deployment on a dedicated EC2 instance
│   └── CONNECTING_TO_BACKEND.md       # Environment configuration and CORS setup
├── src/
│   ├── components/                    # UI Components (FileUploader, FileList, etc.)
│   ├── services/api.ts                # Direct S3 upload & REST client
│   ├── types.ts                       # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── amplify.yml                        # AWS Amplify Hosting build specification
├── Dockerfile                         # Production Nginx container
├── nginx.conf                         # Static web server config
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

## 🚀 Deployment Options

### Option A: AWS Amplify Hosting (Recommended - 1 Click)
Follow [`docs/AWS_AMPLIFY_DEPLOYMENT.md`](./docs/AWS_AMPLIFY_DEPLOYMENT.md) to connect this repository to AWS Amplify. It automatically uses `amplify.yml` and provisions global CDN hosting with free SSL.

### Option B: Separate Dedicated EC2 Instance
Follow [`docs/STANDALONE_EC2_DEPLOYMENT.md`](./docs/STANDALONE_EC2_DEPLOYMENT.md) to run the frontend container on a separate EC2 instance behind Nginx.
