---
name: excel-intake-agent
model: claude-sonnet-4-6
description: >
  Excel Online / Microsoft 365 intake agent. Performs Graph API read, write-back,
  and auth-check operations for vp-intake Excel channels.
  Requires workbook_id + .viepilot/.credentials/m365-credentials.json for write operations.
  Sharing links (sharing_url) are read-only — write-back requires Graph API credentials.
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

# excel-intake-agent

Handles Microsoft 365 Excel workbook I/O for vp-intake channels.

## Operations

Dispatch on `op` field in the prompt:
- `op: read` — fetch ticket rows from workbook
- `op: write` — write triage results back to workbook
- `op: check-auth` — verify credentials exist and token is valid

## Read Operation (`op: read`)

**Graph API mode** (requires `workbook_id` + credentials):
```
GET https://graph.microsoft.com/v1.0/me/drive/items/{workbook_id}/workbook/worksheets/{sheet}/usedRange
Authorization: Bearer {token}
```
Parse `response.values` → apply `channel_config.column_map` to extract ticket fields.

**Sharing link mode** (requires `sharing_url`):
Sharing links are **read-only**. Cannot write back triage results.
```
⚠️  Channel uses a sharing_url — write-back is disabled.
    To enable write-back: configure workbook_id + .viepilot/.credentials/m365-credentials.json
```
For read: follow SharePoint WOPI viewer → scrape FileGetUrl → download xlsx bytes → parse with `xlsx` npm package.

## Write Operation (`op: write`)

**Requires**: `workbook_id` + `m365-credentials.json` (sharing_url → return error immediately).

1. Load credentials from `.viepilot/.credentials/m365-credentials.json`:
   ```json
   { "tenant_id": "...", "client_id": "...", "client_secret": "..." }
   ```

2. Get access token (client credentials flow):
   ```
   POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
   Body: grant_type=client_credentials&client_id=...&client_secret=...&scope=https://graph.microsoft.com/.default
   ```

3. For each triaged ticket, PATCH the VP status columns:
   ```
   PATCH https://graph.microsoft.com/v1.0/me/drive/items/{workbook_id}/workbook/worksheets/{sheet}/range(address='{VP_Status_col}{row}:{VP_RequestID_col}{row}')
   Authorization: Bearer {token}
   Body: { "values": [[vp_status, vp_comment, vp_request_id]] }
   ```

4. VP columns are appended after the last column defined in `column_map`.

**Error handling**:
- `401 Unauthorized` → token expired; re-acquire and retry once
- `403 Forbidden` → app lacks Files.ReadWrite.All permission (print Azure portal guidance)
- Missing credentials → print setup guide with Azure App Registration steps

## check-auth Operation (`op: check-auth`)

1. Check `.viepilot/.credentials/m365-credentials.json` exists
2. Parse and validate required fields (`tenant_id`, `client_id`, `client_secret`)
3. Attempt token acquisition; report success or failure
4. Output: `{ valid: true/false, error?: "..." }`

## SharePoint Sharing Link Limitation

```
⚠️  Channel "{name}" uses a sharing_url — write-back is read-only for sharing links.
    To enable write-back:
      1. Get the workbook's drive item ID from the SharePoint/OneDrive URL
      2. Register an Azure App with Files.ReadWrite.All permission
      3. Save credentials to .viepilot/.credentials/m365-credentials.json
      4. Set "workbook_id" in channels.json
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

Reads the entire Excel file and uses AI reasoning to understand the structure of every
sheet — returning a manifest JSON that describes sheet purposes and column semantics.
The manifest is saved by the caller (vp-intake SKILL.md) via `lib/intake/manifest.cjs`.

### Input
- `op: analyze_structure`
- `channel_config` — full channel object (must include `sharing_url` OR `workbook_id`)
- `projectRoot` — absolute path to repo root

### Steps
1. Download the xlsx using the same mechanism as `read` op (sharing_url or workbook_id)
2. Parse ALL sheets via `lib/intake/adapters/excel-m365.cjs → parseXlsxBuffer()`
3. For each sheet:
   a. Read rows 0–12 (header area) and rows 12–22 (sample data)
   b. **Determine purpose**: bug list / test-case list / summary report / metadata / skip
      — look at: header keywords (Bug, Lỗi, Test, Report, Summary), data density, row count
   c. **Locate header row**: first row with ≥3 distinct non-empty cells; note if multi-row
      (e.g., CMS sheet rows 6–7 both contain header content)
   d. **Map each column semantically**: use header text + sample values to assign one of:
      `id`, `title`, `description`, `steps`, `reporter`, `status`, `priority`,
      `date`, `attachment`, `notes`, `result` — or `null` if unclear
   e. **data_start_row**: first row index after all header rows
   f. **write_back**: identify `status_col` (column with P/F/Done values in data rows),
      suggest `response_col` as first empty column after the data area
4. Skip sheets whose purpose is `summary` or `metadata` (include in manifest with note)
5. Return manifest JSON — do NOT call `saveManifest` here (caller handles persistence)

### Output
```json
{
  "source_url": "...",
  "analyzed_at": "2026-05-23T10:00:00.000Z",
  "analyzer": "excel-intake-agent@v1",
  "sheets": [
    {
      "name": "BUG",
      "purpose": "bug-list",
      "header_row": 0,
      "data_start_row": 1,
      "columns": {
        "A": { "field": "id",          "header": "STT",                "semantic": "sequential row number" },
        "B": { "field": "title",       "header": "Màn hình",           "semantic": "affected screen or module" },
        "C": { "field": "description", "header": "Mô tả lỗi",          "semantic": "bug description" },
        "D": { "field": "steps",       "header": "Thao tác thực hiện", "semantic": "reproduction steps" },
        "E": { "field": "attachment",  "header": "Hình ảnh",           "semantic": "screenshot or attachment" },
        "F": { "field": "status",      "header": "",                   "semantic": "status — Done/Open" }
      },
      "write_back": {
        "response_col":    "G",
        "status_col":      "F",
        "response_format": "status|phase_link",
        "example":         "Fixed ✓ | vp-p140-t4 | v3.7.0 | 2026-05-24"
      }
    },
    {
      "name": "Report",
      "purpose": "summary",
      "note": "Summary report sheet — not used for ticket intake",
      "header_row": null,
      "data_start_row": null,
      "columns": {}
    }
  ]
}
```

### Multi-row header handling
When header spans multiple rows (e.g., CMS sheet): set `header_row` to the first header
row index, and include a `header_rows: [6, 7]` field listing all header row indices.
Use the combined content of all header rows to determine column semantics.

### Error handling
- File download fails → `{ "error": "...", "success": false }`
- Empty sheet → include with `"purpose": "empty"`, `"columns": {}`
- Cannot determine column semantics → set `"field": null` for that column
