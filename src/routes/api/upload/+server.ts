import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'static/uploads';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'product', 'avatar', 'store'

    if (!file) {
      return json({ error: 'File wajib diupload' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
    }

    // Create upload directory if not exists
    const uploadPath = path.join(UPLOAD_DIR, type || 'misc', String(user.id));
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = path.join(uploadPath, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return URL (relative to static)
    const url = `/${filePath.replace('static/', '')}`;

    return json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
};

// DELETE: Remove file from server
export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return json({ error: 'URL file tidak valid' }, { status: 400 });
    }

    // Convert URL back to file path
    // URL format: /uploads/product/123/filename.jpg
    // File path: static/uploads/product/123/filename.jpg
    const filePath = path.join('static', url);

    // Security check: ensure the file is in the uploads directory
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return json({ error: 'Path tidak valid' }, { status: 400 });
    }

    // Check if file exists
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return json({
      success: true,
      message: 'File berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return json({ error: 'Gagal menghapus file' }, { status: 500 });
  }
};
