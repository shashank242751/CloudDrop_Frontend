# Deploying CloudDrop Frontend on a Separate EC2 Instance 🖥️

If your assignment or demonstration requires hosting the frontend on a **separate EC2 instance** rather than AWS Amplify, follow this guide.

---

## 1. Launch a Dedicated EC2 Instance

1. In the AWS Management Console, open **EC2** -> **Launch Instances**.
2. **Name**: `clouddrop-frontend-server`.
3. **AMI**: Amazon Linux 2023.
4. **Instance Type**: `t2.micro` (Free Tier).
5. **Security Group**:
   - Inbound HTTP (Port 80): `0.0.0.0/0`
   - Inbound SSH (Port 22): Your IP

---

## 2. Docker & Nginx Deployment

Connect to your EC2 instance via SSH and run:

```bash
# Update packages and install Docker
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Exit and re-login or run as sudo:
git clone https://github.com/shashank242751/CloudDrop_Frontend.git
cd CloudDrop_Frontend

# Build the Docker image with your backend NLB DNS endpoint
docker build \
  --build-arg VITE_API_URL="http://<YOUR_BACKEND_NLB_DNS_NAME>" \
  -t clouddrop-frontend:latest .

# Run container on port 80
sudo docker run -d \
  --name clouddrop-frontend \
  --restart always \
  -p 80:80 \
  clouddrop-frontend:latest
```

---

## 3. Verification

Navigate to `http://<FRONTEND_EC2_PUBLIC_IP>` in your browser to access the application.
