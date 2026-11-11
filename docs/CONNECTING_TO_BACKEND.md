# Connecting Frontend to Backend NLB 🔗

Because the frontend and backend are completely decoupled, they communicate via standard HTTP REST APIs.

---

## 1. Local Development Mode

During local development, leave `VITE_API_URL` empty in `frontend/.env`:

```env
VITE_API_URL=
```

In `frontend/vite.config.ts`, Vite automatically proxies any request matching `/api/*` and `/health` to `http://localhost:3000`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

---

## 2. Production Mode (AWS Deployment)

In production (whether deployed on **AWS Amplify** or a **Separate EC2 instance**), set the environment variable:

```env
VITE_API_URL=http://<YOUR_BACKEND_NLB_DNS_NAME>
```

Example:
```env
VITE_API_URL=http://clouddrop-demo-nlb-123456789.elb.us-east-1.amazonaws.com
```

### CORS Configuration
The backend S3 bucket and NestJS controllers have CORS pre-configured to accept requests from any origin (`*`), ensuring seamless communication across domains without CORS errors!

