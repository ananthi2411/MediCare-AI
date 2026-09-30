# MediCare AI - Smart Medical Report Simplifier

**MediCare AI** is a full-stack, AI-powered medical report simplification platform designed to extract lab report metrics using **AWS Textract**, simplify health jargon into 3-point English and **Tamil Tanglish** summaries using **OpenAI GPT-4o-mini**, highlight abnormal values in bold red, recommend food advice, and store critical health alerts across **PostgreSQL RDS** and **AWS DynamoDB**.

---

## Architecture & Tech Stack

- **Frontend**: React.js 18 + Vite + Tailwind CSS + TypeScript + Lucide React (`http://localhost:3000`)
- **Backend**: Python FastAPI + Boto3 + OpenAI API + Uvicorn (`http://localhost:8000`)
- **Storage**: AWS S3 (`medicare-reports-2026`)
- **OCR Engine**: AWS Textract (`detect_document_text`)
- **AI Model**: OpenAI `gpt-4o-mini` API
- **Databases**:
  - **Relational DB**: Amazon RDS PostgreSQL (`reports` table)
  - **NoSQL Alerts DB**: Amazon DynamoDB (`CriticalAlerts` table, Partition Key: `report_id` [S])
- **Deployment**: AWS EC2 Ubuntu t2.micro

---

## Directory Structure

```
medicare-ai/
├── backend/
│   ├── main.py              # FastAPI endpoints & static uploads router
│   ├── config.py            # Environment configuration & directory setup
│   ├── db.py                # PostgreSQL RDS (psycopg2) + SQLite fallback layer
│   ├── aws_service.py       # S3 upload & AWS Textract OCR logic
│   ├── ai_service.py        # OpenAI GPT-4o-mini prompt & Tanglish translation
│   ├── dynamodb_service.py  # DynamoDB CriticalAlerts table handler
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── package.json         # React + Vite + Tailwind dependencies
│   ├── vite.config.ts       # Vite config with backend proxy
│   ├── tailwind.config.js   # Custom medical color palette & dark mode setup
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx          # Main dashboard shell & state management
│       ├── types/index.ts   # TypeScript interfaces
│       ├── services/api.ts  # Axios API client
│       └── components/
│           ├── Navbar.tsx            # Top header with dark mode toggle & cloud status
│           ├── Sidebar.tsx           # Tab navigation bar
│           ├── StatsCards.tsx        # Total, Critical & Normal report counters + Circular gauge
│           ├── UploadCard.tsx        # Drag & drop upload with Patient Name & Report Type
│           ├── ReportsTable.tsx      # Reports table with Status badges and View Summary action
│           ├── SummaryModal.tsx      # Modal for original S3 image, Textract text, EN & Tanglish AI summaries, Red Abnormalities & Food Advice
│           ├── CriticalAlertsView.tsx# DynamoDB Critical Alerts feed
│           ├── SettingsView.tsx      # AWS System architecture status
│           └── HealthIndicator.tsx   # FinSight AI-inspired circular gauge
└── README.md                # Project documentation & EC2 deployment guide
```

---

## Database Schemas

### 1. PostgreSQL (RDS) Schema
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(100),
  report_type VARCHAR(50),
  s3_image_url VARCHAR(255),
  extracted_text TEXT,
  ai_summary_en TEXT,
  ai_summary_ta TEXT,
  is_critical BOOLEAN,
  abnormal_values TEXT,
  food_advice TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 2. AWS DynamoDB Schema
- **Table Name**: `CriticalAlerts`
- **Partition Key**: `report_id` (String / S)
- **Attributes**: `patient_name`, `alert_message`, `abnormal_params`, `timestamp`

---

## AWS IAM & Local Credentials Setup

> [!IMPORTANT]
> **No Hardcoded Keys**: The application utilizes standard AWS `boto3` SDK credential lookup mechanisms.
> - **On AWS EC2**: Attach an IAM Role with `AmazonS3FullAccess`, `AmazonTextractFullAccess`, `AmazonDynamoDBFullAccess`, and `AmazonRDSFullAccess` to your EC2 instance.
> - **Local Development**: Configure credentials using `aws configure` or environment variables in `.env`.
> - **Graceful Local Fallback**: If AWS or database credentials are omitted, the backend automatically uses local file storage, SQLite, and mock AI/OCR parsing so you can test locally out-of-the-box!

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend

# Create Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run FastAPI backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be accessible at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend

# Install node packages
npm install

# Run Vite development server
npm run dev --host 0.0.0.0
```

Frontend will be accessible at: `http://localhost:3000`

---

## Deployment on AWS EC2 Ubuntu t2.micro

### Step 1: Launch & Connect to EC2 Instance
Launch an **Ubuntu 22.04 LTS t2.micro** instance on AWS EC2 and attach an **IAM Role** containing S3, Textract, DynamoDB, and RDS policies. Update Security Group inbound rules to allow ports `22`, `8000`, `3000`, and `80`.

SSH into your instance:
```bash
ssh -i "your-key.pem" ubuntu@ec2-your-instance-ip.compute-1.amazonaws.com
```

### Step 2: System Packages & Node.js Installation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git curl

# Install Node.js (v18 or v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Clone Repository & Setup Backend
```bash
git clone https://github.com/your-username/medicare-ai.git
cd medicare-ai/backend

# Create virtualenv and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create production .env file
nano .env
```

Populate `.env`:
```env
S3_BUCKET=medicare-reports-2026
RDS_ENDPOINT=medicare-db-instance.xxxxxx.us-east-1.rds.amazonaws.com
RDS_DB=medicare_db
RDS_USER=postgres
RDS_PASS=YourSecurePassword123
DYNAMO_TABLE=CriticalAlerts
OPENAI_API_KEY=sk-proj-your-openai-api-key
AWS_REGION=us-east-1
```

Run backend service:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
*(Optionally use `systemd` or `pm2` / `tmux` to run in background)*.

### Step 4: Setup & Run Frontend
In a new terminal or session:
```bash
cd medicare-ai/frontend
npm install
npm run dev --host 0.0.0.0
```

Open your browser at `http://<YOUR_EC2_PUBLIC_IP>:3000` to interact with MediCare AI!
