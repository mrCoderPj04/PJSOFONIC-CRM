<div align="center">
  <img src="public/pjsofonic_crm.png" alt="PJSOFONIC CRM Logo" width="140" />
  <h1>PJSOFONIC CRM — Enterprise Client & Project Management Portal</h1>
  <p><strong>Modern, Glassmorphic Frontend Built with React, Vite, and TailwindCSS</strong></p>
</div>

---

## ✨ Key Features

- 🔐 **EMS Identity Provider Integration**: Direct authentication against PJSOFONIC EMS (`https://erp-backend-1-02lc.onrender.com`).
- 👥 **Role-Based Access Control**: Strict access control for **ADMIN** and **CUSTOMER** roles.
- 🚀 **Final Deliverables & Customer Approval Vault**:
  - Admin submits Live Project URLs, Source Code Repositories, Bug & QA Reports, and Documentation.
  - Customers review and approve final deliveries directly within the portal.
- 📊 **Real-Time Dashboards & Analytics**: Financial KPIs, Sales Pipeline Funnel, and Project Health tracking.
- 📁 **Files & Asset Vault**: Secure upload and version management for project deliverables.

---

## 🛠 Local Development Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:5173`.

3. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## ☁️ Render.com Deployment Guide

### Static Site Deployment (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Static Site**.
3. Connect your GitHub repository: `mrCoderPj04/PJSOFONIC-CRM`.
4. Configure settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://pjsofonic-crm-backend.onrender.com/api/v1`
6. Click **Create Static Site**!

---

## 🔗 Repository Information

- **Frontend GitHub Repo**: [https://github.com/mrCoderPj04/PJSOFONIC-CRM.git](https://github.com/mrCoderPj04/PJSOFONIC-CRM.git)
- **Backend GitHub Repo**: [https://github.com/mrCoderPj04/PJSofonic_CRM-Backend.git](https://github.com/mrCoderPj04/PJSofonic_CRM-Backend.git)
