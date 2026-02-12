# 🧪 Testing Guide - n8n Integration

## Quick Test Checklist

### Before You Start
- [ ] n8n running at http://localhost:5678
- [ ] 4 Notion databases created with correct schema
- [ ] Notion integration added to n8n
- [ ] All 4 workflows created and activated
- [ ] `.env.local` configured with correct values

---

## Test 1: localStorage Mode (Baseline)

### Verify Default Behavior Works

```bash
# 1. Check .env.local
cat .env.local
# Should show: VITE_STORAGE_MODE=localStorage

# 2. Start dev server
bun run dev

# 3. Open http://localhost:5173
```

### In the App:
1. ✅ Create a month classification (e.g., "February 2026")
2. ✅ Create a budget category (e.g., "Groceries - Needs")
3. ✅ Create an expense
4. ✅ Create an income
5. ✅ Verify all show on Dashboard
6. ✅ Edit and delete items
7. ✅ Refresh page - data should persist

**Expected:** Everything works as before, data in browser localStorage.

---

## Test 2: API Mode (n8n Integration)

### Switch to API Mode

```bash
# 1. Update .env.local
echo "VITE_STORAGE_MODE=api" > .env.local
echo "VITE_N8N_BASE_URL=http://localhost:5678" >> .env.local
echo "VITE_API_KEY=your-api-key-from-n8n" >> .env.local

# 2. Restart dev server
# Press Ctrl+C to stop
bun run dev
```

### Test Each Entity:

#### A. Month Classifications

1. **Create:**
   - Go to "Months" page
   - Click "Add Month"
   - Fill: Month = "March 2026", Month Num = "03-26"
   - Click "Save"
   - ✅ Check Notion database - should appear immediately

2. **Read:**
   - Refresh the page
   - ✅ Should still show the month

3. **Update:**
   - Click edit on the month
   - Change to "March 2026 Updated"
   - Save
   - ✅ Check Notion - should update

4. **Delete:**
   - Click delete
   - ✅ Should remove from app and Notion

#### B. Budgets

1. Create a budget: "Transportation - Needs - $500"
2. ✅ Verify in Notion Budgets database
3. Edit and verify update
4. Delete and verify removal

#### C. Expenses

1. Create an expense linked to a budget and month
2. ✅ Check Notion Expenses database
3. Verify budgetId and monthClassificationId are saved
4. Test edit and delete

#### D. Incomes

1. Create an income (type: Salary)
2. ✅ Verify in Notion Incomes database
3. Test all operations

---

## Test 3: Dashboard Aggregation

1. Create data across all entities:
   - 2 months
   - 3 budget categories
   - 5 expenses across different budgets
   - 2 incomes

2. Go to Dashboard
3. ✅ Verify:
   - Total income calculates correctly
   - Total expenses sum properly
   - Balance = Income - Expenses
   - Budget usage shows correctly
   - Recent transactions appear
   - Month filter works

---

## Test 4: Error Handling

### Test API Failures

1. **Stop n8n:**
   ```bash
   docker stop n8n
   ```

2. Try to create an expense
3. ✅ Should show error toast
4. ✅ Check browser console for error message

5. **Restart n8n:**
   ```bash
   docker start n8n
   ```

6. Try again - should work

### Test Auth Failure

1. Edit `.env.local` - change API key to wrong value
2. Restart dev server
3. Try to create something
4. ✅ Should show 401 Unauthorized error
5. Fix API key and retry

---

## Test 5: Switching Modes

### Test Hot-Switching

1. Start in localStorage mode with some data
2. Switch to API mode
3. ✅ Old localStorage data still visible
4. Create new item - goes to Notion
5. Switch back to localStorage
6. ✅ Original localStorage data intact
7. ✅ API data not visible (different storage)

**Note:** localStorage and API are independent - switching doesn't migrate data!

---

## Test 6: Network Tab Inspection

### Verify API Calls

1. Open Browser DevTools → Network tab
2. Filter: "Fetch/XHR"
3. Create an expense
4. ✅ Should see request to:
   ```
   http://localhost:5678/webhook/expenses
   Method: POST
   Headers: X-API-Key: [your-key]
   Body: { expense, amount, date, ... }
   ```
5. ✅ Response should return created item with Notion page ID

---

## Test 7: n8n Execution Logs

### Verify Workflow Execution

1. Go to n8n: http://localhost:5678
2. Click workflow name
3. Click "Executions" tab
4. ✅ Should see successful execution for each API call
5. Click an execution
6. ✅ View data flowing through each node
7. Check for any errors

---

## Test 8: Notion Verification

### Direct Notion Check

1. Open each Notion database
2. ✅ Verify properties match exactly:
   - Text fields contain correct values
   - Number fields are numeric
   - Dates are properly formatted
   - Select fields show correct options
3. ✅ Edit a record directly in Notion
4. Refresh app - changes might not reflect (one-way sync)

---

## Test 9: CORS Testing

### Test from Production Domain

If your app is deployed to Vercel:

1. Update `.env.production` with production n8n URL
2. Deploy to Vercel
3. Open https://expense.khawarizmi.space
4. Try creating items
5. ✅ Should work without CORS errors

If you get CORS errors:
- Check NGINX config allows your domain
- Verify n8n webhook CORS settings
- Check browser console for specific error

---

## Test 10: Performance

### Test Load Times

1. Create 50+ expenses
2. Go to Expenses page
3. ✅ Should load quickly (< 2 seconds)
4. Test filtering and sorting
5. Check Dashboard calculations

---

## Troubleshooting Test Failures

### Issue: "Network Error"
- ✅ Check n8n is running: `docker ps | grep n8n`
- ✅ Verify URL in .env.local
- ✅ Test direct curl to webhook

### Issue: "401 Unauthorized"
- ✅ Check API key matches between .env.local and n8n webhook
- ✅ Verify header name is `X-API-Key` (capital K)

### Issue: "Data not appearing in Notion"
- ✅ Check n8n execution logs for errors
- ✅ Verify database IDs are correct (no dashes)
- ✅ Confirm integration has access to databases

### Issue: "Properties not saving"
- ✅ Check property names match exactly (case-sensitive)
- ✅ Verify property types (Text, Number, Date, Select)
- ✅ Check n8n node configuration

### Issue: "TypeScript errors"
- ✅ Run `bun run build` to see all errors
- ✅ Check service method signatures
- ✅ Ensure await is used for async calls

---

## Success Criteria

All tests should pass:
- ✅ localStorage mode works perfectly
- ✅ API mode creates records in Notion
- ✅ All CRUD operations work for 4 entities
- ✅ Dashboard aggregates data correctly
- ✅ Error handling shows user-friendly messages
- ✅ Mode switching preserves data independently
- ✅ Network requests visible in DevTools
- ✅ n8n executions show success
- ✅ Notion databases populated correctly
- ✅ No CORS errors

---

## Automated Test Script

Create this file for quick testing:

```bash
# test-api.sh
#!/bin/bash

API_KEY="your-api-key"
BASE_URL="http://localhost:5678/webhook"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test Month Classifications
echo "Testing Month Classifications..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.json \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"id":"test-123","month":"Test Month","monthNum":"01-26","createdAt":"2026-01-01T00:00:00Z"}' \
  "$BASE_URL/month-classifications")

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 201 ]; then
  echo -e "${GREEN}✓ Month Classifications API working${NC}"
else
  echo -e "${RED}✗ Month Classifications API failed (HTTP $RESPONSE)${NC}"
fi

# Add similar tests for other entities...

echo "All tests completed!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

**Ready to test?** Start with Test 1 and work through each one! 🚀

*Pro tip: Keep browser DevTools open during testing to catch any issues immediately.*
