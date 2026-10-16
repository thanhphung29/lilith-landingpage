import { JWT } from "google-auth-library";

type Application = { email: string; discord: string; locale: string };

function getConfig() {
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME;
  if (!spreadsheetId || !sheetName) throw new Error("SPREADSHEET_ID / SHEET_NAME are not set");
  return { spreadsheetId, sheetName };
}

function getClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Private keys pasted into env vars usually have their newlines escaped
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY are not set");
  return new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
}

// Appends one row: STT | Email | Discord | Language | CreatedDate (UTC, "yyyy-MM-dd HH:mm:ss").
// STT is the formula =ROW()-1 (row 1 is the header), so it always follows the row position.
export async function appendApplication({ email, discord, locale }: Application) {
  const { spreadsheetId, sheetName } = getConfig();
  const range = encodeURIComponent(`'${sheetName}'!A:E`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append` +
    "?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS";
  const createdDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  // USER_ENTERED is needed for the formula, so the leading apostrophe on the other cells keeps
  // them as plain text: nothing the user typed can run as a formula or get turned into a number/date
  const text = (value: string) => `'${value}`;

  await getClient().request({
    url,
    method: "POST",
    data: { values: [["=ROW()-1", text(email), text(discord), text(locale), text(createdDate)]] },
  });
}
