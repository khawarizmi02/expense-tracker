# Expense Tracker PWA 💰

A modern, mobile-friendly Progressive Web App for tracking expenses and managing budgets with a beautiful dark/light theme.

![Expense Tracker](https://img.shields.io/badge/PWA-Ready-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

- 📊 **Dashboard** - Real-time financial overview with summary cards
- 💸 **Expense Tracking** - Track expenses with budget categories
- 💰 **Income Management** - Record income by type (Salary, Refund, Other)
- 🎯 **Budget Categories** - Set monthly budgets with spending indicators
- 📅 **Month Classifications** - Organize finances by month
- 🌗 **Theme Toggle** - Light, Dark, and System themes
- 📱 **Mobile-Friendly** - Responsive design with sidebar/hamburger navigation
- 💾 **Offline Support** - PWA with localStorage (installable)
- 🎨 **Modern UI** - Built with shadcn/ui components

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite 7 + Tailwind CSS v4
- React Router v7
- shadcn/ui components
- localStorage (ready for API)

## 📱 Usage

1. Create Month Classification
2. Setup Budget Categories
3. Add Expenses & Incomes
4. View Dashboard

## 🔄 Backend Integration

**Dual Mode Support:**
- 🔌 **localStorage** - Offline-first (default)
- ☁️ **n8n + Notion** - Cloud sync with workflow automation

### Setup n8n Integration

See detailed guides:
- **[QUICK-START.md](QUICK-START.md)** - Overview & quick reference
- **[N8N-SETUP-GUIDE.md](N8N-SETUP-GUIDE.md)** - Step-by-step n8n setup
- **[NGINX-PRODUCTION-SETUP.md](NGINX-PRODUCTION-SETUP.md)** - VPS deployment

**Quick switch:**
```env
# .env.local
VITE_STORAGE_MODE=api  # or 'localStorage'
VITE_N8N_BASE_URL=http://localhost:5678
VITE_API_KEY=your-api-key
```

## 📄 License

MIT License

