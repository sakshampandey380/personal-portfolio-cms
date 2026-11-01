/**
 * ==========================================================================
 * STORAGE SERVICE — SUPABASE OBJECT STORAGE + INDEXEDDB PREVIEW STORE
 * ==========================================================================
 * Handles secure validation, upload, replacement, retrieval, and deletion
 * of Resume PDFs and Media Assets.
 *
 * Security Enforcement:
 * - Strict MIME type and file extension whitelisting (blocks executables,
 *   scripts, HTML, etc.)
 * - Strict file size limits (max 10 MB for PDFs, max 5 MB for images)
 * - Safe filename normalization
 */

import { apiService } from './api.js';
import { authService } from './auth.js';
import { slugify, uid } from '../utils.js';

const IDB_NAME = 'nexvora_media_blob_db_v1';
const IDB_STORE = 'files';

const ALLOWED_PDF_TYPES = ['application/pdf'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export class StorageService {
  constructor() {
    this.dbPromise = null;
    this.objectUrlCache = new Map();
  }

  openIndexedDB() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser.'));
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  /**
   * Validates a file before upload.
   * @param {File} file
   * @param {'pdf'|'image'|'any'} category
   */
  validateFile(file, category = 'pdf') {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      throw new Error('No valid file selected.');
    }

    const fileName = (file.name || '').toLowerCase();
    const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.mjs', '.php', '.py', '.dll', '.msi', '.html', '.htm'];
    if (forbiddenExtensions.some((ext) => fileName.endsWith(ext))) {
      throw new Error('Security policy violation: Executable or script files are strictly prohibited.');
    }

    if (category === 'pdf') {
      const isPdfMime = ALLOWED_PDF_TYPES.includes(file.type);
      const isPdfExt = fileName.endsWith('.pdf');
      if (!isPdfMime || !isPdfExt) {
        throw new Error('Invalid file format. Only valid PDF documents (.pdf) are allowed for resumes.');
      }
      if (file.size > MAX_PDF_BYTES) {
        throw new Error(`PDF exceeds the maximum allowed size of 10 MB (Selected: ${this.formatBytes(file.size)}).`);
      }
    } else if (category === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Invalid image format. Allowed formats: PNG, JPG, WebP, SVG, GIF.');
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`Image exceeds the maximum allowed size of 5 MB (Selected: ${this.formatBytes(file.size)}).`);
      }
    } else {
      const allowedAll = [...ALLOWED_PDF_TYPES, ...ALLOWED_IMAGE_TYPES];
      if (!allowedAll.includes(file.type)) {
        throw new Error('Unsupported file type. Only PDF documents and standard web images are permitted.');
      }
      if (file.size > MAX_PDF_BYTES) {
        throw new Error('File exceeds the 10 MB maximum upload limit.');
      }
    }

    return true;
  }

  formatBytes(bytes = 0) {
    if (!bytes || bytes <= 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  sanitizeFileName(originalName = 'document.pdf') {
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase().replace(/[^a-z0-9]/g, '') : 'pdf';
    const base = slugify(parts.join('.'));
    return `${base}.${ext}`;
  }

  /**
   * Uploads a file to Supabase Storage (when configured) or IndexedDB (in Local Preview Mode).
   * Supports an optional progress callback.
   */
  async uploadFile(file, { category = 'pdf', onProgress = null, existingStorageId = null } = {}) {
    this.validateFile(file, category);

    if (typeof onProgress === 'function') onProgress(15);

    const safeName = this.sanitizeFileName(file.name || 'document.pdf');
    const storageKey = existingStorageId || `${category}_${uid('blob')}_${safeName}`;

    // 1. Live Supabase Storage Upload
    if (apiService.isConfigured()) {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Unauthorized: Please sign in as administrator to upload files.');
      }

      const bucket = category === 'pdf'
        ? apiService.config.storageBucketResumes
        : apiService.config.storageBucketMedia;

      const uploadUrl = `${apiService.config.supabaseUrl}/storage/v1/object/${bucket}/${storageKey}`;
      if (typeof onProgress === 'function') onProgress(45);

      const response = await fetch(uploadUrl, {
        method: existingStorageId ? 'PUT' : 'POST',
        headers: {
          apikey: apiService.config.supabaseAnonKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`Supabase Storage upload failed (${response.status}). Verify bucket "${bucket}" and RLS policies.`);
      }

      if (typeof onProgress === 'function') onProgress(100);
      const publicUrl = `${apiService.config.supabaseUrl}/storage/v1/object/public/${bucket}/${storageKey}`;

      return {
        storage_id: storageKey,
        file_url: publicUrl,
        file_name: safeName,
        file_size: this.formatBytes(file.size),
        mime_type: file.type
      };
    }

    // 2. Local Preview Mode — Persist binary File/Blob in IndexedDB
    if (typeof onProgress === 'function') onProgress(50);
    const db = await this.openIndexedDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({
        id: storageKey,
        blob: file,
        file_name: safeName,
        mime_type: file.type,
        size: file.size,
        updated_at: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (typeof onProgress === 'function') onProgress(100);

    return {
      storage_id: storageKey,
      file_url: `idb://${storageKey}`,
      file_name: safeName,
      file_size: this.formatBytes(file.size),
      mime_type: file.type
    };
  }

  /**
   * Resolves a stored file URL (handling `idb://` local preview blobs or regular URLs).
   */
  async resolveFileUrl(fileUrl) {
    if (!fileUrl) return '';
    if (!fileUrl.startsWith('idb://')) {
      return fileUrl;
    }

    const storageKey = fileUrl.replace('idb://', '');
    if (this.objectUrlCache.has(storageKey)) {
      return this.objectUrlCache.get(storageKey);
    }

    try {
      const db = await this.openIndexedDB();
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(storageKey);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (record && record.blob) {
        const objUrl = URL.createObjectURL(record.blob);
        this.objectUrlCache.set(storageKey, objUrl);
        return objUrl;
      }
    } catch {
      // Fallback to sample PDF if IDB read fails
    }

    return 'assets/resumes/Saksham_Pandey_Full_Stack_Resume_Sample.pdf';
  }

  /**
   * Deletes a file from Supabase Storage or IndexedDB.
   */
  async deleteFile(fileUrl, category = 'pdf') {
    if (!fileUrl) return;

    if (fileUrl.startsWith('idb://')) {
      const storageKey = fileUrl.replace('idb://', '');
      if (this.objectUrlCache.has(storageKey)) {
        URL.revokeObjectURL(this.objectUrlCache.get(storageKey));
        this.objectUrlCache.delete(storageKey);
      }
      try {
        const db = await this.openIndexedDB();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).delete(storageKey);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        // Ignore cleanup error
      }
      return;
    }

    if (apiService.isConfigured() && fileUrl.includes('/storage/v1/object/public/')) {
      const token = authService.getAccessToken();
      if (!token) return;
      const bucket = category === 'pdf'
        ? apiService.config.storageBucketResumes
        : apiService.config.storageBucketMedia;
      const parts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
      if (parts[1]) {
        const delUrl = `${apiService.config.supabaseUrl}/storage/v1/object/${bucket}/${parts[1]}`;
        await fetch(delUrl, {
          method: 'DELETE',
          headers: {
            apikey: apiService.config.supabaseAnonKey,
            Authorization: `Bearer ${token}`
          }
        }).catch(() => {});
      }
    }
  }
}

export const storageService = new StorageService();
