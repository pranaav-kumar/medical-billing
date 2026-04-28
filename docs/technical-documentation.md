# 📋 Medical Billing Platform — Technical Documentation

> **Stack:** React (Vite) · Node.js (Express) · MongoDB (Azure Cosmos DB)
> **Cloud:** Microsoft Azure · Docker · ACR · App Service
> **DevOps:** GitHub Actions CI/CD · Terraform IaC

---

## Table of Contents

1. [Part A — Project Overview](#part-a--project-overview)
2. [Part B — Cloud & DevOps Architecture](#part-b--cloud--devops-architecture)
3. [Part C — System Flow Diagram](#part-c--system-flow-diagram)
4. [Secrets & Environment Variables Reference](#secrets--environment-variables-reference)
5. [API Reference](#api-reference)

---

## Part A — Project Overview

### What the App Does

The **Medical Billing Platform** is a full-stack, role-based healthcare management system designed for hospitals and clinics. It digitises the entire patient lifecycle — from registration and visit tracking through diagnosis, treatment, billing, and insurance claims — while providing dedicated portals for three distinct user roles.

| Role | Capabilities |
|------|-------------|
| **Admin** | Full dashboard, patient management, inventory control, billing, insurance claims |
| **Doctor** | Patient visits, diagnoses, IP management, prescriptions, appointments calendar, inventory requests |
| **Patient** | Self-service portal — view records, prescriptions, book appointments |

### Core Feature Modules

| Module | Description |
|--------|-------------|
| **Authentication** | Role-based login/signup. Patient signup auto-creates a linked `Patient` record with a generated `PAT-YYYY-NNNN` ID. |
| **Patient Management** | Create and search patients; auto-generated IDs; full visit history. |
| **Visit Management** | Track outpatient (OP) and inpatient (IP) visits; auto-generated `VIS-YYYY-NNNN` IDs. |
| **Diagnosis & Treatment** | Attach coded diagnoses and treatments (with costs) to any visit. |
| **Billing** | Auto-calculate bills from treatment costs; mark Paid/Pending; generate PDF invoices. |
| **Insurance Claims** | Submit, track, and approve/reject claims (`CLM-YYYY-NNNN`). |
| **Appointments** | Patients book slots with doctors; doctors manage via a calendar-style interface. |
| **In-Patient (IP) Module** | Admit patients to wards, add daily charges, record IP treatments, discharge with auto-billing reconciliation. |
| **Prescriptions** | Doctors write prescriptions per visit; patients view from their dashboard. |
| **Inventory** | Admin manages stock; doctors submit requests; admin approves (auto-adds) or rejects. |
| **Dashboard** | Real-time stats: patients, visits, revenue, claims chart, appointments count, OP/IP split. |

### Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│               FRONTEND (React/Vite)                   │
│  React Router v7 · Tailwind CSS · Framer Motion       │
│  Axios → VITE_API_URL/api/*                           │
│  Recharts (charts) · jsPDF (billing PDFs)             │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS REST
                        ▼
┌──────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                 │
│  server.js — Express, CORS, port 8080                 │
│  patientRoutes.js — patients, visits, billing,        │
│    claims, appointments, IP, prescriptions, inventory  │
│  auth.js — login, register, user lists                │
└───────────────────────┬──────────────────────────────┘
                        │ Mongoose ODM
                        ▼
┌──────────────────────────────────────────────────────┐
│           Azure Cosmos DB — MongoDB API               │
│  patients · users · visits · diagnoses · treatments   │
│  billings · claims · appointments · prescriptions     │
│  inventories · inventoryrequests                      │
└──────────────────────────────────────────────────────┘
```

### Data Models

| Model | Key Fields |
|-------|-----------|
| `User` | `name, email, password, role, specialization, patient_id` |
| `Patient` | `patient_id (PAT-YYYY-NNNN), name, age, gender, phone` |
| `Visit` | `visit_id, patient_id, admitted, admissionDetails, ipTreatments[], dailyCharges[], dischargeDetails` |
| `Diagnosis` | `visit_id, code, description` |
| `Treatment` | `visit_id, name, cost` |
| `Billing` | `visit_id, patient_id, total_amount, status` |
| `Claim` | `claim_id (CLM-YYYY-NNNN), visit_id, patient_id, provider, payer, total_amount, status` |
| `Appointment` | `patient_id, doctor_id, date, time, reason, status` |
| `Prescription` | `visit_id, patient_id, doctor_name, medicines[], notes` |
| `Inventory` | `name, category, quantity, unit, notes` |
| `InventoryRequest` | `item_name, category, quantity, unit, reason, requested_by, status` |

---

## Part B — Cloud & DevOps Architecture

### 1. Docker

**Backend Dockerfile** (`./backend/Dockerfile`):
- Uses **Node 22** LTS
- Copies `package*.json` first for Docker layer caching
- Runs `node server.js` directly (no transpile step needed)
- Exposes port **8080**

**Frontend Dockerfile** (`./vite-frontend/Dockerfile`):
- **Multi-stage build**: Stage 1 runs `npm run build` producing `/dist`; Stage 2 only contains `serve` + `/dist`
- `serve -s dist -l 8080` — serves the SPA with HTML5 history fallback
- `VITE_API_URL` is **baked into the JS bundle** at build time by Vite

> ⚠️ If the backend URL changes, the frontend image must be rebuilt and re-pushed.

### 2. Azure Container Registry (ACR)

| Property | Value |
|----------|-------|
| Registry | `medicalbilling.azurecr.io` |
| SKU | Basic |
| Admin enabled | Yes |
| Backend image | `medicalbilling.azurecr.io/medical-backend:latest` |
| Frontend image | `medicalbilling.azurecr.io/medical-frontend:latest` |

ACR is private by default and co-located with Azure App Services in `southeastasia` for fast image pulls.

### 3. App Service Plan (ASP)

A single **Linux B1** plan (`medical-plan-demo`) is shared by both App Services:
- 1 vCPU, 1.75 GB RAM
- `always_on = true` — no cold starts
- Upgrade to **P1v3** for production scale

### 4. Azure App Services

| Property | Backend | Frontend |
|----------|---------|----------|
| App Name | `medical-backend-pranaav` | `medical-frontend-pranaav` |
| Image | `medical-backend:latest` | `medical-frontend:latest` |
| Port | 8080 | 8080 |
| HTTPS only | Yes | Yes |

On each deploy or restart, App Service pulls the latest image from ACR using the `DOCKER_REGISTRY_SERVER_*` app settings.

### 5. Azure Cosmos DB (MongoDB API)

| Property | Detail |
|----------|--------|
| Connection | `MONGO_URI` env var on backend |
| ODM | Mongoose v9 |
| Config | `ssl=true, retrywrites=false, maxIdleTimeMS=120000` |

**Cosmos DB quirk:** Range indexes are not created automatically for nested fields.  
All sorting is done **in JavaScript** (`Array.sort()`) after fetching — no `.sort()` in Mongoose queries.

### 6. Environment Variables

**Backend App Service:**

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | Cosmos DB connection string |
| `FRONTEND_URL` | CORS allowed origin |
| `WEBSITES_PORT` | Container port (8080) |
| `DOCKER_REGISTRY_SERVER_*` | ACR pull credentials |

**Frontend App Service:**

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend API base URL (build-time) |
| `WEBSITES_PORT` | Container port (8080) |
| `DOCKER_REGISTRY_SERVER_*` | ACR pull credentials |

### 7. CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`  
Trigger: Push to `main` branch (also supports manual `workflow_dispatch`)

#### Job 1 — `build-and-push`
1. Checkout repo
2. Setup Docker Buildx (with GHA layer cache)
3. Login to ACR (`ACR_USERNAME` / `ACR_PASSWORD` secrets)
4. Build `./backend` → push `medical-backend:latest`
5. Build `./vite-frontend` → push `medical-frontend:latest`

#### Job 2 — `deploy` (needs Job 1)
1. Azure login via `AZURE_CREDENTIALS` service principal
2. `azure/webapps-deploy@v3` → backend App Service
3. `azure/webapps-deploy@v3` → frontend App Service

**Required GitHub Secrets:**

| Secret | How to obtain |
|--------|--------------|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --role contributor --scopes /subscriptions/<id>/resourceGroups/medical-rg-demo --sdk-auth` |
| `ACR_USERNAME` | Azure Portal → ACR → Access Keys → Username |
| `ACR_PASSWORD` | Azure Portal → ACR → Access Keys → Password |

### 8. Terraform

File: `terraform/main.tf`

```bash
terraform init
terraform plan -var="mongo_uri=<connection-string>"
terraform apply -var="mongo_uri=<connection-string>"
```

| Resource | Block |
|----------|-------|
| Resource Group | `azurerm_resource_group.rg` |
| Container Registry | `azurerm_container_registry.acr` |
| App Service Plan (Linux B1) | `azurerm_service_plan.plan` |
| Backend App Service | `azurerm_linux_web_app.backend` |
| Frontend App Service | `azurerm_linux_web_app.frontend` |

The `mongo_uri` variable is `sensitive = true` — never logged or shown in plan output.

---

## Part C — System Flow Diagram

### Full End-to-End Flow

```
┌─────────────┐   git push to main   ┌──────────────────────────────┐
│  Developer  │ ────────────────────► │  GitHub Repository            │
│  (local)    │                       └──────────────┬───────────────┘
└─────────────┘                                      │ triggers workflow
                                                     ▼
                                       ┌─────────────────────────────┐
                                       │  GitHub Actions CI/CD        │
                                       │                              │
                                       │  Job 1: build-and-push       │
                                       │  ├─ docker build ./backend   │
                                       │  ├─ docker build ./vite-     │
                                       │  │   frontend                │
                                       │  └─ docker push → ACR        │
                                       │                              │
                                       │  Job 2: deploy               │
                                       │  ├─ az login                 │
                                       │  ├─ deploy backend app       │
                                       │  └─ deploy frontend app      │
                                       └──────────────┬──────────────┘
                                                      │ pushes images
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │  Azure Container Registry    │
                                       │  medicalbilling.azurecr.io   │
                                       │                              │
                                       │  medical-backend:latest      │
                                       │  medical-frontend:latest     │
                                       └───────┬──────────┬──────────┘
                                               │ pull      │ pull
                                               ▼          ▼
                           ┌────────────────────┐  ┌──────────────────────┐
                           │  Backend App Service│  │  Frontend App Service │
                           │  (Express API)      │  │  (React SPA)          │
                           │  Port: 8080         │  │  Port: 8080           │
                           │  MONGO_URI          │  │  WEBSITES_PORT        │
                           └─────────┬──────────┘  └──────────┬───────────┘
                                     │ Mongoose                │ Axios calls
                                     ▼                         │ /api/*
                           ┌─────────────────────┐            │
                           │  Azure Cosmos DB     │◄───────────┘
                           │  (MongoDB API)       │
                           └─────────────────────┘
                                     ▲
                                     │ HTTPS (browser)
                           ┌─────────────────────┐
                           │  End User            │
                           │  Admin/Doctor/Patient│
                           └─────────────────────┘
```

### Request Lifecycle

```
1. User opens browser
   → https://medical-frontend-pranaav.azurewebsites.net
   → React SPA loads (static files from `serve`)

2. User logs in
   → POST /api/login
   → auth.js queries Cosmos DB for User
   → Returns { role, patient_id, name, ... }

3. Role redirect:
   admin   → /dashboard
   doctor  → /doctor-dashboard
   patient → /patient-dashboard

4. Dashboard renders
   → GET /api/dashboard
   → Backend aggregates patients, visits, billing, claims, appointments
   → In-memory sort (Cosmos DB constraint)
   → Returns JSON → Recharts renders charts
```

### Manual Deployment (without CI/CD)

```bash
# 1. Build images
docker build -t medicalbilling.azurecr.io/medical-backend:latest ./backend
docker build -t medicalbilling.azurecr.io/medical-frontend:latest ./vite-frontend

# 2. Login to ACR
az acr login --name medicalbilling

# 3. Push images
docker push medicalbilling.azurecr.io/medical-backend:latest
docker push medicalbilling.azurecr.io/medical-frontend:latest

# 4. Restart App Services to pull new images
az webapp restart --name medical-backend-pranaav  --resource-group medical-rg-demo
az webapp restart --name medical-frontend-pranaav --resource-group medical-rg-demo
```

---

## Secrets & Environment Variables Reference

### GitHub Actions Secrets

| Secret Name | Value Source |
|-------------|-------------|
| `AZURE_CREDENTIALS` | JSON from `az ad sp create-for-rbac --sdk-auth` |
| `ACR_USERNAME` | Azure Portal → ACR → Access Keys → Username |
| `ACR_PASSWORD` | Azure Portal → ACR → Access Keys → Password |

### Terraform Variables

```hcl
# terraform.tfvars  ← DO NOT commit to git
mongo_uri = "mongodb://..."
```

---

## API Reference

All endpoints prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Login — returns user + role |
| `POST` | `/api/register` | Generic register |
| `POST` | `/api/register/doctor` | Register doctor |
| `POST` | `/api/register/patient` | Register patient (auto-creates Patient record) |
| `GET` | `/api/users/doctors` | List doctors (for dropdowns) |
| `GET` | `/api/users/patients-list` | List patients (for doctor dropdowns) |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/patients` | Create patient |
| `GET` | `/api/patients` | All patients |
| `GET` | `/api/patient-history/:id` | Full history by patient_id |

### Visits

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/visits` | Create visit |
| `GET` | `/api/visits/:visit_id` | Get visit + patient + diagnosis + treatments + bill |
| `GET` | `/api/ip-patients` | All currently admitted patients |

### Diagnosis & Treatment

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/diagnosis` | Add diagnosis |
| `GET` | `/api/diagnosis/:visit_id` | Diagnoses for visit |
| `POST` | `/api/treatments` | Add treatment |
| `GET` | `/api/treatments/:visit_id` | Treatments for visit |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/billing/:visit_id` | Generate bill |
| `GET` | `/api/billing/:visit_id` | Get full invoice |
| `PUT` | `/api/billing/pay/:visit_id` | Mark as Paid |

### Claims

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/claims/:visit_id` | Submit claim |
| `GET` | `/api/claims` | All claims |
| `PUT` | `/api/claims/:id` | Update claim status |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/appointments` | Book appointment |
| `GET` | `/api/appointments` | All appointments |
| `PUT` | `/api/appointments/:id` | Update status |

### In-Patient (IP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/visits/:visit_id/admit` | Admit patient |
| `POST` | `/api/visits/:visit_id/ip-treatments` | Add IP treatment |
| `POST` | `/api/visits/:visit_id/daily-charges` | Add daily charge |
| `POST` | `/api/visits/:visit_id/discharge` | Discharge + reconcile billing |

### Prescriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/prescriptions` | Save prescription |
| `GET` | `/api/prescriptions/patient/:patient_id` | By patient |
| `GET` | `/api/prescriptions/visit/:visit_id` | By visit |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | All items |
| `POST` | `/api/inventory` | Add item |
| `PUT` | `/api/inventory/:id` | Update item |
| `DELETE` | `/api/inventory/:id` | Delete item |
| `POST` | `/api/inventory-requests` | Doctor submits request |
| `GET` | `/api/inventory-requests` | All requests |
| `PUT` | `/api/inventory-requests/:id/approve` | Approve + auto-add to inventory |
| `PUT` | `/api/inventory-requests/:id/reject` | Reject |

### Dashboard

| Method | Endpoint | Returns |
|--------|----------|---------|
| `GET` | `/api/dashboard` | `totalPatients, totalVisits, totalRevenue, revenueData[], claimStats{}, opPatients, ipPatients, todayAppointments` |

---

*Medical Billing Platform — Azure deployment, region: southeastasia*
