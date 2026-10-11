import React, { useState, useRef } from 'react';
import { supabase, isLiveSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileText, Upload, Trash2, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface ResumeUploadProps {
  resumeUrl?: string | null;
  resumeFilename?: string | null;
  onUploadComplete: (url: string, filename: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeUrl,
  resumeFilename,
  onUploadComplete,
  onRemove,
  label = 'Resume / CV',
  description = 'Upload a tailored resume for this opportunity (PDF, DOCX up to 10MB)',
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    // 1. Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toastError('File Too Large', 'Please upload a resume smaller than 10MB.');
      return;
    }

    // 2. Validate file type
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toastError('Invalid Format', 'Only PDF and Word documents (.pdf, .doc, .docx) are supported.');
      return;
    }

    setIsUploading(true);

    try {
      if (isLiveSupabase && user?.id) {
        // Sanitize file name
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${user.id}/${Date.now()}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;
        onUploadComplete(publicUrl, file.name);
        success('Resume Uploaded', `${file.name} saved successfully.`);
      } else {
        // Demo fallback: create a local blob object URL for demo mode
        const previewUrl = URL.createObjectURL(file);
        onUploadComplete(previewUrl, file.name);
        success('Resume Uploaded (Demo Mode)', `${file.name} attached.`);
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      toastError('Upload Failed', err?.message || 'Could not upload resume to Supabase Storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
          {resumeUrl && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Attached
            </span>
          )}
        </div>
      )}

      {resumeUrl ? (
        /* Attached Resume State */
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {resumeFilename || 'Attached Resume'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Ready for interview loops & recruiter review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700/80 text-slate-300 transition-colors"
              title="Open resume in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View</span>
            </a>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700/80 text-indigo-300 hover:text-indigo-200 transition-colors"
              title="Replace current resume"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove attached resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone State */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs text-indigo-300 font-medium">
                Uploading resume to Supabase Storage...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-inner">
                <Upload className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs font-medium text-slate-200">
                <span className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-[11px] text-slate-400">
                {description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
