'use client';

/**
 * Drag-and-drop photo uploader for log entries.
 *
 * - Accepts paste, drag-drop, click-to-pick, and mobile camera capture
 * - Uploads to Vercel Blob via /api/dashboard/upload-photo
 * - Renders thumbnail grid with delete-on-hover
 * - Cap at 8 photos per entry (matches server cap)
 */

import { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadPhoto, deletePhoto } from './dashboard-api';
import { useToast } from './Toast';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

export default function PhotoUploader({ photos, onChange, max = 8 }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = max - photos.length;
    if (remaining <= 0) {
      toast.error(`Max ${max} photos per entry`);
      return;
    }
    const toUpload = arr.slice(0, remaining);
    setUploading((n) => n + toUpload.length);

    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const { url } = await uploadPhoto(file);
        uploaded.push(url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length > 0) {
      onChange([...photos, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} added`);
    }
  };

  const handleRemove = (url: string) => {
    onChange(photos.filter((p) => p !== url));
    // Fire-and-forget delete from blob storage
    void deletePhoto(url).catch(() => {});
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      {/* Thumbnails */}
      {photos.length > 0 && (
        <div
          className="grid gap-2 mb-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}
        >
          {photos.map((url) => (
            <div
              key={url}
              className="relative group"
              style={{
                aspectRatio: '1/1',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #E5E0D2',
                background: '#FFFDF7',
              }}
            >
              <Image
                src={url}
                alt="Activity photo"
                fill
                sizes="120px"
                style={{ objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label="Remove photo"
                className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(45,58,46,.85)',
                  color: '#FAF9F6',
                  border: 0,
                  cursor: 'pointer',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: 12,
                  lineHeight: 1,
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'opacity .12s',
                }}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div
              key={`loading-${i}`}
              style={{
                aspectRatio: '1/1',
                borderRadius: 10,
                border: '1px dashed #C9D3BE',
                background: '#FAF9F6',
                display: 'grid',
                placeItems: 'center',
                color: '#7B8378',
                fontSize: 11,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  border: '2px solid #C9D3BE',
                  borderTopColor: '#588157',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / pickers */}
      {photos.length + uploading < max && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData?.files || []);
            if (files.length) void handleFiles(files);
          }}
          style={{
            background: dragOver ? '#E6EBDF' : '#FFFDF7',
            border: `1px dashed ${dragOver ? '#588157' : '#E5E0D2'}`,
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            fontFamily: '"DM Sans"',
            fontSize: 13,
            color: '#4F5A50',
            transition: 'background .15s, border-color .15s',
          }}
        >
          <span style={{ marginRight: 'auto' }}>
            Drop photos here, paste, or pick from your device
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#FAF9F6',
              border: '1px solid #C9D3BE',
              color: '#3A5A40',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 12.5,
              padding: '7px 12px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Choose files
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            style={{
              background: '#FAF9F6',
              border: '1px solid #C9D3BE',
              color: '#3A5A40',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 12.5,
              padding: '7px 12px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            📷 Camera
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
