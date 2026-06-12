import React, { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Trash2, Loader2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { providerAPI } from '../../services/api';
import { PageHeader } from '../../components/common/index';

export default function KitchenGallery() {
  const queryClient = useQueryClient();

  const { data: provider } = useQuery({
    queryKey: ['provider-gallery'],
    queryFn: () => providerAPI.getAll({ limit: 1 }).then(r => r.data.data?.[0]).catch(() => null),
  });

  const uploadMutation = useMutation({
    mutationFn: (files) => {
      const formData = new FormData();
      files.forEach(f => formData.append('kitchenPhoto', f));
      return providerAPI.uploadKitchenPhotos(formData);
    },
    onSuccess: () => {
      toast.success('Photos uploaded successfully!');
      queryClient.invalidateQueries(['provider-gallery']);
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 5) return toast.error('Max 5 photos at once');
    uploadMutation.mutate(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const photos = provider?.kitchenPhotos || [];

  return (
    <div>
      <PageHeader title="Kitchen Gallery" subtitle="Showcase your kitchen to build student trust" />

      {/* Upload Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">📸 Tips for great photos:</p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs text-blue-600 dark:text-blue-400">
          <span>✅ Clean, well-lit kitchen</span>
          <span>✅ Fresh ingredients laid out</span>
          <span>✅ Cooked food close-ups</span>
        </div>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-8 ${
        isDragActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}>
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <p className="text-sm text-gray-500">Uploading photos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
              <Upload size={24} className="text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {isDragActive ? 'Drop photos here!' : 'Drag & drop kitchen photos'}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse • JPG, PNG, WEBP • Max 10MB each</p>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <Camera size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No photos yet</h3>
          <p className="text-sm text-gray-500">Upload kitchen photos to build trust with students</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{photos.length} Photos</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, i) => (
              <motion.div key={photo.publicId || i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
                <img src={photo.url} alt={`Kitchen ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
