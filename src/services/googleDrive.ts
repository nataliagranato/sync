/**
 * Google Drive API Service
 * Interacts with Google Drive v3 REST API using OAuth 2.0 access token
 * Scopes: https://www.googleapis.com/auth/drive.file
 */

export interface GoogleDriveQuota {
  totalBytes: number;
  usedBytes: number;
  driveBytes: number;
  userName?: string;
  userEmail?: string;
}

export async function fetchGoogleDriveQuota(accessToken: string): Promise<GoogleDriveQuota> {
  const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn('Google Drive quota request warning:', errorText);
    throw new Error(`Erro ao consultar Google Drive: ${res.status}`);
  }

  const data = await res.json();
  const quota = data.storageQuota || {};
  const user = data.user || {};

  const total = quota.limit ? parseInt(quota.limit, 10) : 15 * 1024 * 1024 * 1024; // 15 GB default
  const used = quota.usage ? parseInt(quota.usage, 10) : 0;
  const driveUsage = quota.usageInDrive ? parseInt(quota.usageInDrive, 10) : used;

  return {
    totalBytes: total,
    usedBytes: used,
    driveBytes: driveUsage,
    userName: user.displayName,
    userEmail: user.emailAddress
  };
}

export async function createGoogleDriveBackupFolder(accessToken: string, folderName = 'Sync_E2EE'): Promise<string> {
  // Check if folder already exists
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    throw new Error('Falha ao criar pasta de backup no Google Drive');
  }

  const created = await createRes.json();
  return created.id;
}

export async function uploadFileToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileBlob: Blob,
  folderId?: string,
  mimeType?: string
): Promise<{ fileId: string; webViewLink?: string }> {
  const actualMimeType = mimeType || fileBlob.type || 'application/octet-stream';
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: actualMimeType
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metaBlob = new Blob([
    `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${actualMimeType}\r\n\r\n`
  ]);
  const endBlob = new Blob([closeDelimiter]);

  const multipartBody = new Blob([metaBlob, fileBlob, endBlob], {
    type: `multipart/related; boundary=${boundary}`
  });

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: multipartBody
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('Google Drive Upload Error:', err);
    throw new Error('Falha no upload para o Google Drive');
  }

  const data = await uploadRes.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink
  };
}

// Alias for backwards compatibility
export const uploadEncryptedFileToGoogleDrive = uploadFileToGoogleDrive;

export async function downloadFileFromGoogleDrive(accessToken: string, fileId: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Google Drive download error:', errorText);
    throw new Error(`Falha ao baixar arquivo do Google Drive: ${res.status}`);
  }

  return await res.arrayBuffer();
}

export async function deleteFileFromGoogleDrive(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 404) {
    const errorText = await res.text();
    console.error('Google Drive delete error:', errorText);
    throw new Error(`Falha ao excluir arquivo do Google Drive: ${res.status}`);
  }
}

export interface DriveExistingFile {
  id: string;
  name: string;
  size?: number;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Searches for a non-trashed file with exact name inside a specific folder or across drive
 */
export async function findFileInGoogleDrive(
  accessToken: string,
  fileName: string,
  folderId?: string
): Promise<DriveExistingFile | null> {
  try {
    const escapedName = fileName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    let query = `name = '${escapedName}' and trashed = false`;
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,modifiedTime,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      console.warn('Google Drive find file warning:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const f = data.files[0];
      return {
        id: f.id,
        name: f.name,
        size: f.size ? parseInt(f.size, 10) : undefined,
        modifiedTime: f.modifiedTime,
        webViewLink: f.webViewLink
      };
    }
    return null;
  } catch (err) {
    console.warn('Google Drive search failed:', err);
    return null;
  }
}

/**
 * Replaces / updates the binary contents of an existing file on Google Drive
 */
export async function updateFileInGoogleDrive(
  accessToken: string,
  fileId: string,
  fileName: string,
  fileBlob: Blob,
  mimeType?: string
): Promise<{ fileId: string; webViewLink?: string }> {
  const actualMimeType = mimeType || fileBlob.type || 'application/octet-stream';
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metaBlob = new Blob([
    `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: fileName })}\r\n${delimiter}Content-Type: ${actualMimeType}\r\n\r\n`
  ]);
  const endBlob = new Blob([closeDelimiter]);

  const multipartBody = new Blob([metaBlob, fileBlob, endBlob], {
    type: `multipart/related; boundary=${boundary}`
  });

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: multipartBody
    }
  );

  if (!res.ok) {
    // If multipart PATCH fails, try simple media upload
    const mediaRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': actualMimeType
        },
        body: fileBlob
      }
    );

    if (!mediaRes.ok) {
      const err = await mediaRes.text();
      console.error('Google Drive update error:', err);
      throw new Error('Falha ao atualizar arquivo existente no Google Drive');
    }

    const mediaData = await mediaRes.json();
    return {
      fileId: mediaData.id || fileId,
      webViewLink: mediaData.webViewLink
    };
  }

  const data = await res.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink
  };
}

export async function checkGoogleDriveHealth(accessToken: string): Promise<{ ok: boolean; latencyMs: number; quota: GoogleDriveQuota }> {
  const t0 = performance.now();
  const quota = await fetchGoogleDriveQuota(accessToken);
  const latencyMs = Math.round(performance.now() - t0);
  return {
    ok: true,
    latencyMs,
    quota
  };
}
