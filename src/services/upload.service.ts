import api from './api';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as UploadResult;
  },
};
