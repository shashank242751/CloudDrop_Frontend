import React from 'react';
import { X, Server, HardDrive, Cpu, Shield, Database, Cloud, Terminal, GitBranch, Layers } from 'lucide-react';

interface AwsArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AwsArchitectureModal: React.FC<AwsArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const topics = [
    {
      title: '1. Network Load Balancer (NLB)',
      desc: 'Layer 4 TCP high-throughput load balancer forwarding external incoming web traffic to target group on port 80.',
      icon: Layers,
      highlight: 'Ultra-low latency, handles spiky traffic',
    },
    {
      title: '2. Apache Server (Reverse Proxy)',
      desc: 'Runs on the EC2 instances at port 80. Receives traffic from NLB and reverse-proxies directly to the NestJS Docker container on port 3000.',
      icon: Server,
      highlight: 'VirtualHost & mod_proxy configured via user-data',
    },
    {
      title: '3. EC2 Instance & EBS Volume',
      desc: 't2.micro / t3.micro instances running Amazon Linux 2023 with attached gp3 EBS volume for persistent container logs.',
      icon: HardDrive,
      highlight: '100% AWS Free Tier eligible (750 hours/mo)',
    },
    {
      title: '4. Launch Template & Auto Scaling Group (ASG)',
      desc: 'ASG maintains desired capacity (1 to 2 instances), automatically self-healing if an instance fails health checks.',
      icon: Cpu,
      highlight: 'Automated scaling policies + EC2 User-Data bootstrap',
    },
    {
      title: '5. AMI (Amazon Machine Image)',
      desc: 'Standardized baseline image containing Docker, Apache, and CloudWatch agent for fast immutable instance spin-up.',
      icon: Server,
      highlight: 'Reproducible immutable infrastructure',
    },
    {
      title: '6. Amazon S3 Bucket',
      desc: 'Object storage for user files. Frontend uploads and downloads directly via secure, expiring S3 Pre-signed URLs.',
      icon: Cloud,
      highlight: 'Bypasses EC2 bandwidth bottlenecks, highly scalable',
    },
    {
      title: '7. Amazon DynamoDB',
      desc: 'Serverless NoSQL database storing file metadata, download metrics, and automatic expiration via DynamoDB TTL.',
      icon: Database,
      highlight: 'Zero cost (Free Tier 25 GB & 25 WCU/RCU forever)',
    },
    {
      title: '8. AWS Lambda File Processor',
      desc: 'Event-driven Lambda triggered automatically on S3 ObjectCreated (Put) to inspect file metadata, calculate checksums, and update DynamoDB.',
      icon: Cpu,
      highlight: 'Completely serverless post-processing trigger',
    },
    {
      title: '9. AWS IAM (Identity & Access Management)',
      desc: 'Least-privilege IAM Roles: EC2 Instance Profile allows S3 & DynamoDB access without storing hardcoded API credentials.',
      icon: Shield,
      highlight: 'Zero secrets stored in code or containers',
    },
    {
      title: '10. AWS CloudFormation (IaC)',
      desc: 'Production-ready Infrastructure-as-Code template to provision or destroy all resources in a single command ($0 unexpected cost).',
      icon: Terminal,
      highlight: 'Single-click provisioning and teardown',
    },
    {
      title: '11. GitHub Actions CI/CD',
      desc: 'Automated workflow on push: builds Docker image, runs tests, and deploys to AWS EC2 / ECR / S3.',
      icon: GitBranch,
      highlight: 'End-to-end continuous integration and deployment',
    },
    {
      title: '12. Swagger OpenAPI Documentation',
      desc: 'Live interactive API documentation and testing UI running on /api/docs.',
      icon: Terminal,
      highlight: 'Self-documenting NestJS endpoints',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="#ff9900" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              CloudDrop AWS Architecture & Covered Topics
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
          {topics.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    height: 'fit-content',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {t.desc}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255, 153, 0, 0.15)',
                      color: '#ff9900',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: 500,
                    }}
                  >
                    ★ {t.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Close Architecture View
          </button>
        </div>
      </div>
    </div>
  );
};

