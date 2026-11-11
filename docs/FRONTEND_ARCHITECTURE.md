# CloudDrop Frontend Architecture Specification 💻

The **CloudDrop Frontend** is an independent, production-grade Single Page Application (SPA) designed to be completely decoupled from the backend.

---

## 🏗️ Architectural Principles

```
  +-------------------------------------------------------------+
  |                   React 18 SPA (Vite)                       |
  |                                                             |
  |  +-------------------+  +-------------------+  +---------+  |
  |  |   FileUploader    |  |     FileList      |  | Navbar  |  |
  |  +---------+---------+  +---------+---------+  +----+----+  |
  |            |                      |                 |       |
  |  +---------v----------------------v-----------------v----+  |
  |  |                 api.ts Service Layer                  |  |
  |  +-----------------------+-------------------------------+  |
  +--------------------------|----------------------------------+
                             |
         +-------------------+-------------------+
         |                                       |
         | REST Calls                            | High-Throughput Direct Binary PUT/GET
         v                                       v
  +--------------+                      +------------------+
  | Backend NLB  |                      | Amazon S3 Bucket |
  | (Port 80)    |                      | (Pre-Signed URLs)|
  +--------------+                      +------------------+
```

### 1. Direct-to-S3 Uploads (Client Offloading)
- Traditional architectures send files from the browser to the web server, which then streams the file to S3. This saturates server bandwidth and CPU.
- **CloudDrop Pattern**:
  1. Frontend requests an upload ticket: `POST /api/files/upload-url`.
  2. Backend returns a cryptographic, time-limited S3 Pre-Signed PUT URL.
  3. Frontend streams the file binary directly to Amazon S3 via `axios.put(uploadUrl, file, { onUploadProgress })`.
  4. Frontend displays real-time transfer progress.
  5. Upon completion, frontend confirms to the backend: `POST /api/files/:fileId/confirm`.

### 2. Standalone & Detachable Deployment
- Can be hosted on **AWS Amplify Hosting** (serverless global CDN).
- Can alternatively be hosted on a **dedicated EC2 instance** running Nginx.
- Contains zero backend code dependencies; communicates solely via REST endpoints specified by `VITE_API_URL`.
