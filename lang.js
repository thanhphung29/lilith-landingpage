// Pulls translations from the Google Sheet and writes messages/<locale>.json.
// Usage: npm run lang
var fs = require('fs');
global.XMLHttpRequest = require('xhr2');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
// `installed` clients no longer support the out-of-band (urn:ietf:wg:oauth:2.0:oob) flow
const REDIRECT_URI = 'http://localhost';

const SPREADSHEET_ID = '13rUl1b_DXEL1qioHRqiCxyIfnFn-RenHZuw_zyCYTUg';
const RANGE = 'Landingpage-localization!A1:Z';
const NAMESPACE = 'Landing';
const MESSAGES_DIR = 'messages';
// Keep in sync with `defaultLocale` in i18n/routing.ts. Empty cells fall back to it.
const DEFAULT_LOCALE = 'ja';

// Header (row 1) language name → locale code used by the app (i18n/routing.ts)
const LANGUAGES = {
  'English': 'en',
  'Japanese': 'ja',
  'Chinese (Traditional)': 'zh-TW',
  'Korean': 'ko',
  'Chinese [zh-CN]': 'zh-CN',
  'Vietnamese': 'vi',
  'Russian': 'ru',
  'Spanish': 'es',
  'Portuguese (Brazil)': 'pt-BR',
  'German': 'de',
  'French': 'fr',
  'Polish': 'pl',
  'Thai': 'th',
  'Italian': 'it',
  'Indonesian': 'id',
};

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), getLang);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  console.log('The browser then redirects to http://localhost/?code=... (the page will not load, that is expected).');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Paste the full redirected URL (or just the code) here: ', (answer) => {
    rl.close();
    const code = answer.includes('code=') ? new URL(answer.trim()).searchParams.get('code') : answer.trim();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token:', err.message);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}

/**
 * Reads the localization tab and writes one JSON file per language.
 * @see https://docs.google.com/spreadsheets/d/13rUl1b_DXEL1qioHRqiCxyIfnFn-RenHZuw_zyCYTUg
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getLang(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: RANGE }, (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      if (String(err).includes('invalid_grant')) {
        console.log(`The saved token has expired. Delete ${TOKEN_PATH} and run again to log in.`);
      }
      return;
    }
    const rows = res.data.values;
    if (rows && rows.length) {
      loadJSON(rows);
    } else {
      console.log('No data found.');
    }
  });
}

// Row 1: language names, row 2: short codes (ignored), row 3+: key | translations...
function loadJSON(rows) {
  const [header, , ...data] = rows;

  const columns = [];
  header.forEach((name, index) => {
    if (index === 0 || !name.trim()) return;
    const locale = LANGUAGES[name.trim()];
    if (!locale) {
      console.warn(`⚠ Unknown language column "${name}" skipped. Add it to LANGUAGES in lang.js.`);
      return;
    }
    columns.push({ locale, index });
  });

  const defaultColumn = columns.find((column) => column.locale === DEFAULT_LOCALE);
  if (!defaultColumn) return console.error(`Column for default locale "${DEFAULT_LOCALE}" not found.`);

  const messages = {};
  const missing = {};
  columns.forEach(({ locale }) => {
    messages[locale] = {};
    missing[locale] = 0;
  });

  let keyCount = 0;
  data.forEach((row) => {
    const key = (row[0] || '').trim();
    if (!key) return;
    keyCount++;
    columns.forEach(({ locale, index }) => {
      let value = (row[index] || '').trim();
      if (!value) {
        missing[locale]++;
        value = (row[defaultColumn.index] || '').trim();
      }
      messages[locale][key] = value;
    });
  });

  // Only the NAMESPACE object is replaced; other content (e.g. Metadata) is kept as is.
  // Namespaces missing from a locale's file are copied from the default locale's file.
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  const readMessages = (locale) => {
    const file = `${MESSAGES_DIR}/${locale}.json`;
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  };
  const defaultMessages = readMessages(DEFAULT_LOCALE);
  const seeded = [];
  columns.forEach(({ locale }) => {
    const existing = readMessages(locale);
    Object.keys(defaultMessages).forEach((namespace) => {
      if (namespace === NAMESPACE || namespace in existing) return;
      existing[namespace] = defaultMessages[namespace];
      seeded.push(`${locale}.${namespace}`);
    });
    // Re-insert so the sheet namespace always comes last in the file
    delete existing[NAMESPACE];
    existing[NAMESPACE] = messages[locale];
    fs.writeFileSync(`${MESSAGES_DIR}/${locale}.json`, JSON.stringify(existing, null, 2) + '\n');
  });

  console.log(`✓ ${keyCount} keys → ${columns.map((c) => c.locale).join(', ')}`);
  columns.forEach(({ locale }) => {
    if (missing[locale]) console.warn(`⚠ ${locale}: ${missing[locale]}/${keyCount} empty, using ${DEFAULT_LOCALE}`);
  });
  if (seeded.length) {
    console.warn(`⚠ Copied from ${DEFAULT_LOCALE}.json, please translate: ${seeded.join(', ')}`);
  }
}
