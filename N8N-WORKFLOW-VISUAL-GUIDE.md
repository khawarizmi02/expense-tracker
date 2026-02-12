# 🎨 n8n Workflow Visual Guide

This document provides visual representations of how your n8n workflows should be structured.

---

## 📐 Workflow Architecture

### Overview: Single Workflow Pattern

Each entity (Month Classifications, Budgets, Expenses, Incomes) follows this pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                     n8n Workflow Layout                         │
└─────────────────────────────────────────────────────────────────┘

  [Webhook Node]
  HTTP Method: ALL
  Path: /webhook/[entity-name]
  Auth: Header Auth (X-API-Key)
       │
       ↓
  [Check Auth Node]
  IF: X-API-Key === expected_key
       │
       ├─→ [Unauthorized] → [Respond 401]
       │
       └─→ [Authorized]
              │
              ↓
         [Switch Node]
         Route by HTTP Method
              │
              ├─→ GET    → [Notion: Get All]    → [Format Response] → [Respond 200]
              │
              ├─→ POST   → [Notion: Create]     → [Format Response] → [Respond 201]
              │
              ├─→ PATCH  → [Notion: Update]     → [Format Response] → [Respond 200]
              │
              └─→ DELETE → [Notion: Archive]    → [Respond 204]
```

---

## 🔧 Node-by-Node Configuration

### 1. Webhook Node (Entry Point)

```
┌──────────────────────────────┐
│   Webhook                    │
│                              │
│ HTTP Method: ALL             │
│ Path: month-classifications  │
│ Auth: Header Auth            │
│   Header: X-API-Key          │
│   Value: your-secret-key     │
└──────────────────────────────┘
```

**Settings:**
- ✅ Listen for: `All Methods`
- ✅ Path: `month-classifications` (or budgets, expenses, incomes)
- ✅ Response Mode: `Using 'Respond to Webhook' node`
- ✅ Authentication: `Header Auth`

---

### 2. Switch Node (Method Router)

```
┌────────────────────────────┐
│   Switch                   │
│                            │
│ Route based on:            │
│ {{ $json.method }}         │
│                            │
│ Rules:                     │
│  1. method === "GET"       │
│  2. method === "POST"      │
│  3. method === "PATCH"     │
│  4. method === "DELETE"    │
└────────────────────────────┘
```

**Expression to use:**
```javascript
{{ $('Webhook').item.json.method }}
```

---

### 3. GET Route - Fetch All Items

```
┌─────────────────────────────────┐
│   Notion (Get Database Pages)  │
│                                 │
│ Resource: Database Page         │
│ Operation: Get Many             │
│ Database ID: [your-db-id]       │
│ Return All: Yes                 │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Code (Format Response)        │
│                                 │
│ Transform Notion data to        │
│ match frontend schema           │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Respond to Webhook            │
│                                 │
│ Status: 200                     │
│ Body: {{ $json }}               │
└─────────────────────────────────┘
```

**Code node example:**
```javascript
// For Month Classifications
const items = $input.all();
const formatted = items.map(item => {
  const props = item.json.properties;
  return {
    id: props.id?.rich_text?.[0]?.plain_text || '',
    month: props.month?.rich_text?.[0]?.plain_text || '',
    monthNum: props.monthNum?.rich_text?.[0]?.plain_text || '',
    createdAt: props.createdAt?.date?.start || new Date().toISOString()
  };
});
return [{ json: formatted }];
```

---

### 4. POST Route - Create New Item

```
┌─────────────────────────────────┐
│   Notion (Create Database Page) │
│                                 │
│ Resource: Database Page         │
│ Operation: Create               │
│ Database ID: [your-db-id]       │
│ Title: {{ $json.body.month }}   │
│                                 │
│ Properties:                     │
│  • id → {{ $json.body.id }}     │
│  • month → {{ $json.body.month }}│
│  • monthNum → {{ $json.body.monthNum }}│
│  • createdAt → {{ $json.body.createdAt }}│
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Respond to Webhook            │
│                                 │
│ Status: 201                     │
│ Body: {{ $json }}               │
└─────────────────────────────────┘
```

**Expressions for properties:**
- Title: `{{ $('Webhook').item.json.body.month }}`
- id (Text): `{{ $('Webhook').item.json.body.id }}`
- month (Text): `{{ $('Webhook').item.json.body.month }}`
- monthNum (Text): `{{ $('Webhook').item.json.body.monthNum }}`
- createdAt (Date): `{{ $('Webhook').item.json.body.createdAt }}`

---

### 5. PATCH Route - Update Existing Item

```
┌─────────────────────────────────┐
│   Notion (Update Database Page) │
│                                 │
│ Resource: Database Page         │
│ Operation: Update               │
│ Page ID: {{ $json.params.id }}  │
│                                 │
│ Properties (same as POST):      │
│  • month → {{ $json.body.month }}│
│  • monthNum → {{ $json.body.monthNum }}│
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Respond to Webhook            │
│                                 │
│ Status: 200                     │
│ Body: {{ $json }}               │
└─────────────────────────────────┘
```

**Page ID expression:**
```javascript
{{ $('Webhook').item.json.params.id }}
```

---

### 6. DELETE Route - Archive Item

```
┌─────────────────────────────────┐
│   Notion (Archive Page)         │
│                                 │
│ Resource: Page                  │
│ Operation: Archive              │
│ Page ID: {{ $json.params.id }}  │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Respond to Webhook            │
│                                 │
│ Status: 200                     │
│ Body: {"success": true}         │
└─────────────────────────────────┘
```

---

## 📊 Complete Workflow Example (Month Classifications)

### Visual Layout in n8n Editor:

```
Row 1:  [Webhook]

Row 2:      ↓
        [Check Auth IF]
            ↓         ↓
      [Auth OK]   [Auth Failed]
                      ↓
                  [Respond 401]

Row 3:      ↓
         [Switch by Method]
            ↓
    ┌───────┼───────┬────────┐
    ↓       ↓       ↓        ↓
  [GET]  [POST]  [PATCH]  [DELETE]

Row 4:  ↓       ↓       ↓        ↓
    [Notion] [Notion] [Notion] [Notion]
    Get All  Create  Update  Archive

Row 5:  ↓       ↓       ↓        ↓
    [Format] [Format] [Format]   
     Code     Code     Code

Row 6:  ↓       ↓       ↓        ↓
    [Respond][Respond][Respond][Respond]
      200      201      200      200
```

---

## 🔑 Important Expressions Reference

### Accessing Webhook Data

| Data | Expression |
|------|-----------|
| HTTP Method | `{{ $('Webhook').item.json.method }}` |
| Request Body | `{{ $('Webhook').item.json.body }}` |
| URL Params | `{{ $('Webhook').item.json.params }}` |
| Query Params | `{{ $('Webhook').item.json.query }}` |
| Headers | `{{ $('Webhook').item.json.headers }}` |
| API Key | `{{ $('Webhook').item.json.headers['x-api-key'] }}` |

### Accessing Request Data

```javascript
// Get full request body field
{{ $('Webhook').item.json.body.fieldName }}

// Get URL parameter (e.g., /webhook/expenses/:id)
{{ $('Webhook').item.json.params.id }}

// Get query parameter (e.g., ?monthClassificationId=123)
{{ $('Webhook').item.json.query.monthClassificationId }}
```

---

## 🎯 Entity-Specific Properties

### Month Classifications

| Notion Property | Type | Expression |
|----------------|------|-----------|
| Name (Title) | Title | `{{ $json.body.month }}` |
| id | Text | `{{ $json.body.id }}` |
| month | Text | `{{ $json.body.month }}` |
| monthNum | Text | `{{ $json.body.monthNum }}` |
| createdAt | Date | `{{ $json.body.createdAt }}` |

### Budgets

| Notion Property | Type | Expression |
|----------------|------|-----------|
| Name (Title) | Title | `{{ $json.body.category }}` |
| id | Text | `{{ $json.body.id }}` |
| category | Text | `{{ $json.body.category }}` |
| monthlyBudget | Number | `{{ $json.body.monthlyBudget }}` |
| categoryType | Select | `{{ $json.body.categoryType }}` |
| createdAt | Date | `{{ $json.body.createdAt }}` |

**Select Options for categoryType:** `Wants`, `Needs`, `Savings`

### Expenses

| Notion Property | Type | Expression |
|----------------|------|-----------|
| Name (Title) | Title | `{{ $json.body.expense }}` |
| id | Text | `{{ $json.body.id }}` |
| expense | Text | `{{ $json.body.expense }}` |
| amount | Number | `{{ $json.body.amount }}` |
| date | Date | `{{ $json.body.date }}` |
| budgetId | Text | `{{ $json.body.budgetId }}` |
| monthClassificationId | Text | `{{ $json.body.monthClassificationId }}` |
| createdAt | Date | `{{ $json.body.createdAt }}` |

### Incomes

| Notion Property | Type | Expression |
|----------------|------|-----------|
| Name (Title) | Title | `{{ $json.body.income }}` |
| id | Text | `{{ $json.body.id }}` |
| income | Text | `{{ $json.body.income }}` |
| amount | Number | `{{ $json.body.amount }}` |
| date | Date | `{{ $json.body.date }}` |
| monthClassificationId | Text | `{{ $json.body.monthClassificationId }}` |
| type | Select | `{{ $json.body.type }}` |
| createdAt | Date | `{{ $json.body.createdAt }}` |

**Select Options for type:** `Salary`, `Refund`, `Other`

---

## 🧪 Testing Workflows

### Using n8n's Built-in Test

1. Click **"Execute Node"** on Webhook to get test URL
2. Use **"Execute Workflow"** button
3. Check output in each node

### Using curl Commands

```bash
# Set variables
API_KEY="your-api-key"
BASE_URL="http://localhost:5678/webhook"

# Test GET
curl -H "X-API-Key: $API_KEY" \
  "$BASE_URL/month-classifications"

# Test POST
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "id": "test-123",
    "month": "February 2026",
    "monthNum": "02-26",
    "createdAt": "2026-02-12T00:00:00Z"
  }' \
  "$BASE_URL/month-classifications"

# Test PATCH
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"month": "February 2026 Updated"}' \
  "$BASE_URL/month-classifications/test-123"

# Test DELETE
curl -X DELETE \
  -H "X-API-Key: $API_KEY" \
  "$BASE_URL/month-classifications/test-123"
```

---

## 💡 Pro Tips

1. **Use consistent naming**: Name your nodes clearly (e.g., "Notion - Get All Budgets")
2. **Test incrementally**: Build and test one route at a time
3. **Check executions**: Use n8n's Executions tab to debug
4. **Clone workflows**: Once first workflow works, clone it for other entities
5. **Version control**: Export workflows regularly as JSON backups

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Webhook returns empty** | Response mode not set | Set to "Using 'Respond to Webhook' node" |
| **Notion error 400** | Database ID has dashes | Remove dashes from DB ID |
| **Properties not saving** | Wrong property type | Match Notion property types exactly |
| **Auth fails** | Header case mismatch | Use `X-API-Key` (capital K) |
| **Method not routing** | Expression syntax error | Use `{{ $('Webhook').item.json.method }}` |

---

## 📋 Workflow Checklist

For each workflow, verify:

- [ ] Webhook node configured with correct path
- [ ] Authentication set up with X-API-Key
- [ ] Switch node routing all 4 HTTP methods
- [ ] Notion credentials connected
- [ ] Database ID correct (no dashes)
- [ ] All properties mapped correctly
- [ ] Response nodes added for each route
- [ ] Workflow saved and activated
- [ ] Tested with curl commands
- [ ] Frontend can connect successfully

---

**Ready to build?** Open n8n and follow this guide step by step! 🚀
