# 🚀 Quick Start Guide - n8n Integration

## TL;DR - What Changed?

Your expense tracker can now use **n8n + Notion** as a backend instead of localStorage!

### New Files Created:

1. **`.env.local`** / **`.env.production`** - API configuration
2. **`src/services/api.ts`** - n8n API service
3. **`src/services/storage.ts`** - Updated to support both modes
4. **`N8N-SETUP-GUIDE.md`** - Detailed n8n setup instructions
5. **`NGINX-PRODUCTION-SETUP.md`** - VPS deployment guide

---

## 🎯 Next Steps

### Option A: Continue Using localStorage (No Setup Required)

Your app works exactly as before! Default mode is `localStorage`.

### Option B: Set Up n8n Integration

#### Local Development (Recommended First):

1. **Setup Notion** (10 minutes)
   - Follow **N8N-SETUP-GUIDE.md** → Part 1
   - Create 4 databases with proper schema

2. **Setup n8n** (20 minutes)
   - Follow **N8N-SETUP-GUIDE.md** → Part 2 & 3
   - Add Notion integration
   - Create 4 workflows

3. **Configure Frontend** (2 minutes)
   ```bash
   # Copy environment file
   cp .env.example .env.local
   
   # Edit .env.local
   # Set VITE_STORAGE_MODE=api
   # Set VITE_API_KEY=your-key-from-n8n
   
   # Restart dev server
   bun run dev
   ```

4. **Test** ✅
   - Create a month classification
   - Check if it appears in Notion!

#### Production Deployment:

Follow **NGINX-PRODUCTION-SETUP.md** for VPS deployment with:
- Docker-based n8n
- NGINX reverse proxy
- SSL certificates
- CORS configuration
- Rate limiting

---

## 🔄 Switching Between Modes

### Use localStorage:
```env
# .env.local
VITE_STORAGE_MODE=localStorage
```

### Use n8n API:
```env
# .env.local
VITE_STORAGE_MODE=api
VITE_N8N_BASE_URL=http://localhost:5678
VITE_API_KEY=your-api-key
```

**No code changes needed!** Just restart your dev server.

---

## 📁 File Structure

```
expense-tracker/
├── .env.local               # Local configuration (gitignored)
├── .env.production          # Production config (gitignored)
├── .env.example             # Template for env vars
├── N8N-SETUP-GUIDE.md       # Detailed n8n setup
├── NGINX-PRODUCTION-SETUP.md # VPS deployment guide
├── n8n-workflows/           # Workflow templates
│   └── 1-month-classifications-api.json
└── src/
    └── services/
        ├── api.ts           # n8n API client
        └── storage.ts       # Unified storage service
```

---

## 🧪 Testing API Endpoints

```bash
# Set your API key
API_KEY="your-api-key"

# Test GET all
curl -H "X-API-Key: $API_KEY" \
  http://localhost:5678/webhook/month-classifications

# Test POST create
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "id": "test-123",
    "month": "February 2026",
    "monthNum": "02-26",
    "createdAt": "2026-02-01T00:00:00Z"
  }' \
  http://localhost:5678/webhook/month-classifications
```

---

## 🎨 Architecture

```
┌─────────────────────────────────────────┐
│         React App (Vercel)              │
│    expense.khawarizmi.space             │
└─────────────┬───────────────────────────┘
              │
              ├─→ localStorage (offline mode)
              │
              └─→ n8n API (online mode)
                  │
                  ↓
          ┌──────────────────┐
          │   n8n Workflows  │
          │   (REST API)     │
          └────────┬─────────┘
                   │
                   ↓
          ┌──────────────────┐
          │  Notion Database │
          │   (4 databases)  │
          └──────────────────┘
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Check API key in `.env.local` matches n8n webhook |
| **CORS Error** | Add your domain to n8n webhook CORS settings |
| **Data not syncing** | Check n8n execution logs in workflow view |
| **Notion errors** | Verify database IDs and integration permissions |

---

## 📚 Documentation Index

1. **N8N-SETUP-GUIDE.md**
   - Part 1: Notion database schema
   - Part 2: n8n integration setup
   - Part 3: Creating workflows
   - Part 4: Frontend configuration
   - Part 5: Troubleshooting

2. **NGINX-PRODUCTION-SETUP.md**
   - VPS setup
   - Docker deployment
   - NGINX configuration
   - SSL certificates
   - Security best practices
   - Monitoring & backups

---

## 💡 Tips

- Start with **localStorage mode** for offline development
- Switch to **API mode** when n8n is configured
- Test each workflow individually before connecting frontend
- Use browser DevTools → Network tab to debug API calls
- Check n8n execution logs for detailed error messages

---

## 🎉 Benefits of n8n Integration

✅ **Real-time sync** across devices  
✅ **Notion as database** - view/edit data anywhere  
✅ **Workflow automation** - future: auto-categorize expenses, budget alerts, etc.  
✅ **Scalable** - easy to add features via n8n nodes  
✅ **Offline-first** - switch to localStorage anytime  

---

**Ready to get started?** Follow **N8N-SETUP-GUIDE.md** step by step! 🚀
