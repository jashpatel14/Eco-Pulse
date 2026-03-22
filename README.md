# 🌿 EcoPulse PLM

**EcoPulse** is a premium, industry-standard Product Lifecycle Management (PLM) system designed for modern engineering teams. It bridges the gap between complex industrial data and a clean, high-performance SaaS user experience.

![Dashboard Mockup](client/src/assets/logo.png) *(Note: Replace with actual screenshot in production)*

---

## ✨ Key Features

### 🛠️ Product & BOM Management
- **Deep Versioning**: Track every iteration of your products with an immutable version history.
- **BOM Intelligence**: Full "Bill of Materials" management with nested components and manufacturing operations.
- **BOM Blame**: Instant accountability—see exactly which ECO changed every specific component.
- **BOM Compare**: Side-by-side visual diffing between any two product versions.

### 🔄 Engineering Change Orders (ECO)
- **Multi-Role Workflows**: Structured transitions from Engineering Draft ➔ Management Review ➔ Operations Implementation.
- **Visual Redlining**: Intelligent "Diff View" showing exactly what is being added or removed in a change.
- **One-Click Restoration**: Emergency rollback capability to restore any previous version instantly while maintaining audit compliance.
- **SaaS Animation System**: Real-time feedback with premium success animations for critical lifecycle events.

### 🔐 Security & Governance
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Engineers, Approvers, Operations, and Admins.
- **Immutable Audit Trail**: Every action, status change, and approval is logged for regulatory compliance.
- **JWT Authentication**: Secure, enterprise-grade login and session management.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), Framer Motion (Animations), Lucide React (Icons), Vanilla CSS (Premium Custom Design System).
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Prisma ORM.
- **State Management**: Zustand & React Context.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/jashpatel14/Eco-Pulse.git
   cd Eco-Pulse
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create a .env file with your DATABASE_URL
   npx prisma generate
   npx prisma db push
   npx prisma db seed # Populate with demo industry data
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 👥 Demo Accounts

| Role | Login ID | Password |
| :--- | :--- | :--- |
| **Admin** | `vikram.singh` | `Voltex@2025` |
| **Engineer** | `arjun.mehta` | `Voltex@2025` |
| **Approver** | `rahul.nair` | `Voltex@2025` |
| **Operations** | `amit.verma` | `Voltex@2025` |

---

## 📄 License
Copyright © 2026 EcoPulse Systems. All rights reserved.
