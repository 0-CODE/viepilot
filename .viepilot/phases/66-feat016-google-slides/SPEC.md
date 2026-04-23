# Phase 66 — SPEC: vp-proposal Google Slides export (FEAT-016)

## Goal
Add optional `--slides` flag: after generating .pptx, upload to Google Slides via service account auth and write the public URL to `docs/proposals/{slug}-{date}-slides.txt`.

## Version target
**2.5.0**

## Dependencies
- Phase 64 ✅ (skill + workflow with --slides flag placeholder)
- Phase 65 ✅ (templates exist)

---

## Tasks

### Task 66.1 — `lib/google-slides-exporter.cjs`
**Objective:** Module that authenticates via service account and uploads a .pptx file to Google Drive, then converts to Google Slides format.

## Paths
- `lib/google-slides-exporter.cjs`

**File-Level Plan:**
```js
'use strict';
// Only loads @googleapis/slides when invoked — graceful degradation if not installed
async function uploadToSlides(pptxPath, title) {
  let googleapis;
  try {
    googleapis = require('@googleapis/slides');  // optionalDependency
  } catch {
    throw new Error(
      'Google Slides export requires @googleapis/slides.\n' +
      'Install: npm install @googleapis/slides\n' +
      'Then set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON key.'
    );
  }
  // Auth: service account via GOOGLE_APPLICATION_CREDENTIALS env var
  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/presentations']
  });
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  // Upload .pptx to Drive
  const { data: file } = await drive.files.create({
    requestBody: { name: title, mimeType: 'application/vnd.google-apps.presentation' },
    media: { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
             body: require('fs').createReadStream(pptxPath) }
  });
  return `https://docs.google.com/presentation/d/${file.id}/edit`;
}
module.exports = { uploadToSlides };
```

**Verification:**
- When `@googleapis/slides` not installed: throws clear error message (not crash)
- When `GOOGLE_APPLICATION_CREDENTIALS` missing: Google auth error is surfaced cleanly

---

### Task 66.2 — Wire `--slides` into workflow
**Objective:** Update `workflows/proposal.md` Step 7 to call `google-slides-exporter.cjs` and write URL.

## Paths
- `workflows/proposal.md`

**File-Level Plan:**
- Step 7 expansion: if `--slides` flag present → call `uploadToSlides(pptxPath, title)` → write URL to `docs/proposals/{slug}-{date}-slides.txt`
- Show URL in confirmation output
- If upload fails: show error but do NOT fail the whole command (files already written)

---

### Task 66.3 — Google Slides setup docs
**Objective:** Add setup guide to `docs/user/features/proposal.md`.

## Paths
- `docs/user/features/proposal.md`

**File-Level Plan:**
Section `## Google Slides Export`:
1. Create a Google Cloud project
2. Enable Drive API + Slides API
3. Create service account → download JSON key
4. Set env var: `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`
5. Install optional dep: `npm install @googleapis/slides`
6. Usage: `/vp-proposal --slides`

---

## Phase Verification
```bash
node -e "const e=require('./lib/google-slides-exporter.cjs'); e.uploadToSlides('x.pptx','test').catch(err=>console.log(err.message.includes('@googleapis')?'graceful error':'unexpected'))"
# expected: "graceful error"
grep "GOOGLE_APPLICATION_CREDENTIALS" docs/user/features/proposal.md
```
