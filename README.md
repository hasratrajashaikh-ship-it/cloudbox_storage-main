

# 🚀 CloudBox – Cloud Storage Web App

Store files, organize folders, and keep your work accessible anytime, anywhere.

---

## 🌐 Live Demo

👉 [https://cloudboxstorage.vercel.app](https://cloudbox-storage-main.vercel.app/)

---

## 📌 Overview

CloudBox is a full-stack cloud storage application inspired by Google Drive.
It allows users to securely upload, manage, and organize files using a folder-based system powered by Supabase.

---

## ✨ Features

* 🔐 User Authentication (Login / Signup)
* 📂 Folder-based file organization
* 📁 Nested folder support
* ☁️ File upload to cloud (Supabase Storage)
* ⬇️ Download files
* 🗑️ Delete files
* 🔄 Real-time updates
* 📱 Responsive UI (mobile-friendly)
* 🎨 Clean modern UI (Tailwind CSS)

---

## 🛠️ Tech Stack

**Frontend:**

* React (Vite)
* TypeScript
* Tailwind CSS
* React Router

**Backend (BaaS):**

* Supabase Auth
* Supabase Database (PostgreSQL)
* Supabase Storage

---

## 📂 Project Structure

```bash
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── App.tsx
 ├── main.tsx
 ├── supabase.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file in root:

```env
VITE_SUPABASE_URL=project_url
VITE_SUPABASE_ANON_KEY=anon_key
```

---

## 🗄️ Database Setup (Supabase)

### 📁 folders table

```sql
id uuid primary key default uuid_generate_v4(),
name text,
user_id uuid,
parent_id uuid,
created_at timestamp default now()
```

---

### 📄 files table

```sql
id uuid primary key default uuid_generate_v4(),
name text,
user_id uuid,
folder_id uuid,
file_url text,
size bigint,
created_at timestamp default now()
```

---

### ☁️ Storage

Create a bucket:

```
files
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🌍 Deployment

Deployed on **Vercel**



## 🎯 Future Improvements

* 🔍 Search functionality
* 📤 File sharing
* 🧾 File preview
* 🌙 Dark mode
* 📊 Storage usage analytics

---

## 🙌 Acknowledgements

* Supabase
* Tailwind CSS
* React

---

## 📬 Contact

**Hasrat Shaikh**
📧 [hasrathr123@gmail.com](mailto:hasrathr123@gmail.com)




