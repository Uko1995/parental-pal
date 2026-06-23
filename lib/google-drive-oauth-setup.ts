/**
 * One-time setup: obtain GOOGLE_DRIVE_REFRESH_TOKEN using your existing OAuth client.
 *
 * Usage:
 *   npx tsx lib/google-drive-oauth-setup.ts
 *
 * Prerequisites:
 * - GOOGLE_ID and GOOGLE_SECRET in .env.local (same as NextAuth)
 * - Google Drive API enabled in GCP
 * - OAuth consent screen configured; add your Google account as a test user if app is in Testing
 * - In GCP OAuth client, add redirect URI: http://localhost:3333/oauth2callback
 */
import dotenv from "dotenv";
import http from "http";
import { google } from "googleapis";
import { URL } from "url";

dotenv.config({ path: ".env.local" });

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const REDIRECT_URI = "http://localhost:3333/oauth2callback";
const PORT = 3333;

async function main() {
  const clientId = process.env.GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_ID or GOOGLE_SECRET in .env.local");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_SCOPE],
  });

  console.log("\n1. Open this URL in your browser (use the Google account that owns the HOTR Drive folder):\n");
  console.log(authUrl);
  console.log(
    "\n2. After approving, you will be redirected to localhost and this script will finish.\n",
  );

  const code = await waitForAuthCode();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.error(
      "\nNo refresh token returned. Revoke app access at https://myaccount.google.com/permissions and run again with prompt=consent.",
    );
    process.exit(1);
  }

  console.log("\nAdd this to .env.local:\n");
  console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\nAlso ensure:");
  console.log("GOOGLE_DRIVE_ENABLED=true");
  console.log("GOOGLE_DRIVE_PARENT_FOLDER_ID=1bEd_43Qe5fkxlG3Pbda1vfiQMpTJapwW");
  console.log("\nDone.");
  process.exit(0);
}

function waitForAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
        if (url.pathname !== "/oauth2callback") {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400);
          res.end(`Authorization failed: ${error}`);
          server.close();
          reject(new Error(error));
          return;
        }

        if (!code) {
          res.writeHead(400);
          res.end("Missing authorization code");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authorization successful</h1><p>You can close this tab and return to the terminal.</p>",
        );
        server.close();
        resolve(code);
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      console.log(`Waiting for OAuth callback on ${REDIRECT_URI} ...`);
    });

    server.on("error", reject);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
