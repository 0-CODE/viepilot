---
name: sheets-intake-agent
model: claude-haiku-4-5
description: >
  Google Sheets intake agent. Performs Sheets API v4 read, write-back,
  and auth-check operations for vp-intake Google Sheets channels.
  Requires OAuth service account credentials in .viepilot/.credentials/google-service-account.json.
tools:
  - Read
  - Bash
disallowedTools:
  - Edit
  - Write
  - WebSearch
  - WebFetch
  - Agent
---

# sheets-intake-agent

Handles Google Sheets I/O for vp-intake channels.

## Operations

Dispatch on `op` field in the prompt:
- `op: read` — fetch ticket rows from spreadsheet
- `op: write` — write triage results back to spreadsheet
- `op: check-auth` — verify credentials exist and token is valid

## Read Operation (`op: read`)

```
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{range}
Authorization: Bearer {token}
```

Use `channel_config.sheet_name` for tab name (default: `Sheet1`).
Apply `channel_config.column_map` to extract ticket fields from rows.

## Write Operation (`op: write`)

1. Load service account from `.viepilot/.credentials/google-service-account.json`

2. Mint JWT and exchange for access token:
   ```
   POST https://oauth2.googleapis.com/token
   Body: grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={jwt}
   Scope: https://www.googleapis.com/auth/spreadsheets
   ```

3. Batch update VP status columns via batchUpdate:
   ```
   POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values:batchUpdate
   Authorization: Bearer {token}
   Body: {
     "valueInputOption": "RAW",
     "data": [
       { "range": "Sheet1!G2", "values": [["accepted"]] },
       { "range": "Sheet1!H2", "values": [[""]] },
       { "range": "Sheet1!I2", "values": [["BUG-031"]] }
     ]
   }
   ```

4. VP columns (VP_Status, VP_Comment, VP_RequestID) are appended after the last `column_map` column.

**Error handling**:
- `401` → token expired; re-mint JWT and retry once
- `403` → service account lacks Sheets write permission (share spreadsheet with service account email)
- Missing credentials → print setup guidance

## check-auth Operation (`op: check-auth`)

1. Check `.viepilot/.credentials/google-service-account.json` exists
2. Validate required fields (`client_email`, `private_key`, `project_id`)
3. Mint JWT and attempt token exchange; report success or failure
4. Output: `{ valid: true/false, error?: "..." }`

## Credentials Setup

```
.viepilot/.credentials/google-service-account.json:
{
  "type": "service_account",
  "project_id": "...",
  "client_email": "vp-intake@project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n..."
}

After creating service account:
  - Share the Google Sheet with the service account email (Editor access)
  - The service account can then read and write to the sheet
```

## Output Format

All operations return JSON on stdout:
```json
{
  "op": "read|write|check-auth",
  "success": true,
  "data": [...],        // read: array of ticket objects
  "updated": 5,         // write: count of rows updated
  "valid": true,        // check-auth: auth status
  "error": "..."        // on failure
}
```

---

## Op: analyze_structure (ENH-095)

Reads the entire Google Sheet and uses AI reasoning to understand the structure of every
tab — returning a manifest JSON describing sheet purposes and column semantics.
The manifest is saved by the caller (vp-intake SKILL.md) via `lib/intake/manifest.cjs`.

### Input
- `op: analyze_structure`
- `channel_config` — full channel object (must include `spreadsheet_id`)
- `projectRoot` — absolute path to repo root

### Steps
1. Fetch all sheet tabs via Sheets API: `GET /v4/spreadsheets/{spreadsheetId}?includeGridData=false`
2. For each tab, fetch rows 0–22 via: `GET /v4/spreadsheets/{id}/values/{tab}!A1:Z22`
3. For each tab:
   a. Determine purpose: ticket-list / summary / metadata / skip
   b. Locate header row (first row with ≥3 distinct non-empty cells)
   c. Map each column to a semantic field: `id`, `title`, `description`, `status`, etc.
   d. Determine `data_start_row` and `write_back.response_col` (first empty column after data)
4. Return manifest JSON identical in shape to the excel-intake-agent output
5. Do NOT call `saveManifest` — caller handles persistence

### Output
Same manifest JSON shape as `excel-intake-agent analyze_structure`.
`"analyzer"` field should be `"sheets-intake-agent@v1"`.

### Error handling
- API call fails → `{ "error": "...", "success": false }`
- Tab has no data → include with `"purpose": "empty"`, `"columns": {}`
