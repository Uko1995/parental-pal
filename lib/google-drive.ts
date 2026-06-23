import fs from "fs";
import path from "path";
import { google, type drive_v3 } from "googleapis";

export interface DriveFolder {
  folderId: string;
  folderUrl: string;
  folderName: string;
}

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const HANDBOOK_DIR = path.join(process.cwd(), "handbook");

let driveClient: drive_v3.Drive | null = null;

function isServiceAccountConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY,
  );
}

function isOAuthDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ID &&
      process.env.GOOGLE_SECRET &&
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  );
}

export function getGoogleDriveAuthMode():
  | "service-account"
  | "oauth"
  | null {
  if (isServiceAccountConfigured()) {
    return "service-account";
  }
  if (isOAuthDriveConfigured()) {
    return "oauth";
  }
  return null;
}

export function isGoogleDriveConfigured(): boolean {
  if (process.env.GOOGLE_DRIVE_ENABLED === "false") {
    return false;
  }
  return Boolean(
    process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID && getGoogleDriveAuthMode(),
  );
}

function parsePrivateKey(): string {
  const key = process.env.GOOGLE_PRIVATE_KEY ?? "";
  return key.replace(/\\n/g, "\n");
}

export function getDriveClient(): drive_v3.Drive {
  if (driveClient) {
    return driveClient;
  }

  const authMode = getGoogleDriveAuthMode();
  if (!authMode) {
    throw new Error(
      "Google Drive is not configured. Set service account credentials or GOOGLE_DRIVE_REFRESH_TOKEN with GOOGLE_ID/GOOGLE_SECRET.",
    );
  }

  if (authMode === "service-account") {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: parsePrivateKey(),
      },
      scopes: [DRIVE_SCOPE],
    });
    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  driveClient = google.drive({ version: "v3", auth: oauth2Client });
  return driveClient;
}

export function normalizeFolderName(name: string): string {
  return name
    .trim()
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 200);
}

export function buildFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export async function findFolderByName(
  name: string,
  parentId: string,
): Promise<DriveFolder | null> {
  const drive = getDriveClient();
  const escapedName = name.replace(/'/g, "\\'");
  const query = [
    `name='${escapedName}'`,
    `'${parentId}' in parents`,
    `mimeType='${FOLDER_MIME}'`,
    "trashed=false",
  ].join(" and ");

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const file = response.data.files?.[0];
  if (!file?.id || !file.name) {
    return null;
  }

  return {
    folderId: file.id,
    folderUrl: buildFolderUrl(file.id),
    folderName: file.name,
  };
}

export async function createFolder(
  name: string,
  parentId: string,
  description?: string,
): Promise<DriveFolder> {
  const drive = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name: normalizeFolderName(name),
      mimeType: FOLDER_MIME,
      parents: [parentId],
      ...(description ? { description } : {}),
    },
    fields: "id, name",
    supportsAllDrives: true,
  });

  const folderId = response.data.id;
  if (!folderId) {
    throw new Error("Google Drive did not return a folder id");
  }

  return {
    folderId,
    folderUrl: buildFolderUrl(folderId),
    folderName: response.data.name ?? name,
  };
}

export async function createSubfolder(
  name: string,
  parentFolderId: string,
): Promise<DriveFolder> {
  return createFolder(name, parentFolderId);
}

export async function setAnyoneWithLinkReader(folderId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      type: "anyone",
      role: "reader",
    },
    supportsAllDrives: true,
  });
}

export async function uploadFileToFolder(
  localPath: string,
  folderId: string,
): Promise<void> {
  const drive = getDriveClient();
  const fileName = path.basename(localPath);

  await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "application/pdf",
      body: fs.createReadStream(localPath),
    },
    supportsAllDrives: true,
  });
}

export async function uploadHandbooksToFolder(folderId: string): Promise<void> {
  if (!fs.existsSync(HANDBOOK_DIR)) {
    console.warn("HTR handbook directory not found:", HANDBOOK_DIR);
    return;
  }

  const pdfFiles = fs
    .readdirSync(HANDBOOK_DIR)
    .filter((file) => file.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.warn("No handbook PDFs found in", HANDBOOK_DIR);
    return;
  }

  for (const file of pdfFiles) {
    await uploadFileToFolder(path.join(HANDBOOK_DIR, file), folderId);
  }
}

export interface CreateBookingFolderOptions {
  childNames: string[];
  description?: string;
}

export async function createBookingFolder(
  name: string,
  parentId: string,
  options: CreateBookingFolderOptions = { childNames: [] },
): Promise<DriveFolder> {
  const folder = await createFolder(name, parentId, options.description);
  await setAnyoneWithLinkReader(folder.folderId);

  const handbooksFolder = await createSubfolder("Handbooks", folder.folderId);
  await uploadHandbooksToFolder(handbooksFolder.folderId);

  const normalizedChildren = options.childNames
    .map(normalizeFolderName)
    .filter(Boolean);

  if (normalizedChildren.length === 0) {
    await createSubfolder("Photos", folder.folderId);
  } else if (normalizedChildren.length === 1) {
    await createSubfolder(normalizedChildren[0], folder.folderId);
  } else {
    const photosRoot = await createSubfolder("Photos", folder.folderId);
    for (const childName of normalizedChildren) {
      await createSubfolder(childName, photosRoot.folderId);
    }
  }

  return folder;
}
