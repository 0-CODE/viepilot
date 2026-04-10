'use strict';
/**
 * google-slides-exporter.cjs
 * Uploads a .pptx file to Google Drive and converts it to a Google Slides presentation.
 *
 * Requirements (optional — only needed when --slides flag is used):
 *   npm install @googleapis/slides
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
 *
 * See docs/user/features/proposal.md → "Google Slides Export" for setup guide.
 */

const fs   = require('fs');
const path = require('path');

/**
 * Upload a local .pptx file to Google Drive and convert to Google Slides.
 *
 * @param {string} pptxPath  Absolute path to the .pptx file
 * @param {string} title     Title for the Google Slides presentation
 * @returns {Promise<string>} Public edit URL of the created presentation
 */
async function uploadToSlides(pptxPath, title) {
  // Lazy-load @googleapis/slides — it is an optionalDependency.
  // Provide a clear, actionable error when the package is not installed.
  let googleApis;
  try {
    googleApis = require('googleapis');
  } catch {
    throw new Error(
      'Google Slides export requires the @googleapis/slides package.\n\n' +
      'Install it:\n' +
      '  npm install @googleapis/slides\n\n' +
      'Then set your service account credentials:\n' +
      '  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json\n\n' +
      'See: docs/user/features/proposal.md → "Google Slides Export"'
    );
  }

  const { google } = googleApis;

  // Verify credentials env var is set before attempting auth
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.\n\n' +
      'Set it to the path of your Google service account JSON key:\n' +
      '  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json\n\n' +
      'See: docs/user/features/proposal.md → "Google Slides Export"'
    );
  }

  // Authenticate via service account (no browser interaction required)
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/presentations',
    ],
  });

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  // Upload .pptx and request conversion to Google Slides format
  const { data: file } = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.presentation',
    },
    media: {
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      body: fs.createReadStream(pptxPath),
    },
    fields: 'id',
  });

  return `https://docs.google.com/presentation/d/${file.id}/edit`;
}

module.exports = { uploadToSlides };
