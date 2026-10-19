import { JWT } from "google-auth-library";

type Application = { email: string; discord: string; locale: string };

function getConfig() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  // SHEET_GID (the number after "gid=" in the sheet URL) survives renaming the tab;
  // SHEET_NAME is the fallback
  const sheetGid = process.env.SHEET_GID;
  const sheetName = process.env.SHEET_NAME;
  if (!spreadsheetId || (!sheetGid && !sheetName)) {
    throw new Error("SPREADSHEET_ID and SHEET_GID (or SHEET_NAME) are not set");
  }
  return { spreadsheetId, sheetGid, sheetName };
}

function getClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Private keys pasted into env vars usually have their newlines escaped
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY are not set");
  return new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
}

// The tab's current name, looked up from its gid and cached for a minute
let cachedName: { gid: string; name: string; at: number } | null = null;

async function resolveSheetName(client: JWT, spreadsheetId: string, gid: string, fresh: boolean) {
  if (!fresh && cachedName?.gid === gid && Date.now() - cachedName.at < 60_000) return cachedName.name;
  const res = await client.request<{ sheets?: { properties?: { sheetId?: number; title?: string } }[] }>({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
  });
  const title = res.data.sheets?.find((sheet) => String(sheet.properties?.sheetId) === gid)?.properties?.title;
  if (!title) throw new Error(`No sheet with gid ${gid}`);
  cachedName = { gid, name: title, at: Date.now() };
  return title;
}

async function appendRow(client: JWT, spreadsheetId: string, sheetName: string, row: string[]) {
  const range = encodeURIComponent(`'${sheetName}'!A:E`);
  await client.request({
    url:
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append` +
      "?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS",
    method: "POST",
    data: { values: [row] },
  });
}

// Appends one row: STT | Email | Discord | Language | CreatedDate (UTC, "yyyy-MM-dd HH:mm:ss").
// STT is the formula =ROW()-1 (row 1 is the header), so it always follows the row position.
export async function appendApplication({ email, discord, locale }: Application) {
  const { spreadsheetId, sheetGid, sheetName } = getConfig();
  const client = getClient();
  const createdDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  // USER_ENTERED is needed for the formula, so the leading apostrophe on the other cells keeps
  // them as plain text: nothing the user typed can run as a formula or get turned into a number/date
  const text = (value: string) => `'${value}`;
  const row = ["=ROW()-1", text(email), text(discord), text(locale), text(createdDate)];

  if (!sheetGid) return appendRow(client, spreadsheetId, sheetName as string, row);
  try {
    return await appendRow(client, spreadsheetId, await resolveSheetName(client, spreadsheetId, sheetGid, false), row);
  } catch {
    // The tab may have been renamed within the cache window: look the name up again and retry once
    return appendRow(client, spreadsheetId, await resolveSheetName(client, spreadsheetId, sheetGid, true), row);
  }
}
