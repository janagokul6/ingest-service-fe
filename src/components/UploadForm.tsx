import { useState, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UploadFormProps {
    onUploadStart: (files: File[]) => Promise<void>;
    isUploading: boolean;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/epub+zip',
  'application/epub',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/csv',
  'text/markdown',
  'text/x-markdown',
  'text/plain',
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.epub',
  '.pptx',
  '.ppt',
  '.xlsx',
  '.xls',
  '.csv',
  '.md',
  '.txt',
];

const ALLOWED_LABEL = 'PDF, DOCX, EPUB, PPTX, XLSX, CSV, Markdown, TXT';

export function UploadForm({ onUploadStart, isUploading }: UploadFormProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFiles = (files: File[]): File[] => {
        const validFiles = files.filter((f) => {
          const lowerName = f.name.toLowerCase();
          return (
            ALLOWED_MIME_TYPES.includes(f.type) ||
            ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
          );
        });

        if (validFiles.length !== files.length) {
            setError(`Only document formats (${ALLOWED_LABEL}) are allowed. Images and videos are rejected.`);
            setTimeout(() => setError(null), 5000);
        }
        return validFiles;
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = validateFiles(Array.from(e.dataTransfer.files));
            if (files.length > 0) onUploadStart(files);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = validateFiles(Array.from(e.target.files));
            if (files.length > 0) onUploadStart(files);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                className={cn(
                    "relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer group",
                    isDragging
                        ? "border-brand-green-500 bg-brand-green-50/50 scale-[1.01]"
                        : "border-gray-200 bg-white hover:border-brand-green-300 hover:bg-gray-50",
                    isUploading && "pointer-events-none opacity-80"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className={cn(
                        "mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
                        isDragging ? "bg-brand-green-100 text-brand-green-600 scale-110" : "bg-brand-blue-50 text-brand-blue-500 group-hover:scale-110 group-hover:bg-brand-blue-100"
                    )}>
                        {isUploading ? (
                            <Loader2 className="h-10 w-10 animate-spin" />
                        ) : (
                            <Upload className="h-10 w-10" />
                        )}
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {isUploading ? 'Uploading documents...' : 'Upload Documents'}
                    </h3>
                    <p className="mb-6 max-w-sm text-sm text-gray-500 leading-relaxed">
                        Drag & drop your files here or click to browse. We support PDF, DOCX, EPUB, PPTX, XLSX, CSV, Markdown, and TXT files.
                    </p>

                    <Button variant={isDragging ? "default" : "secondary"} className="rounded-full px-8 pointer-events-none">
                        Select Files
                    </Button>
                </div>

                <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.epub,.pptx,.ppt,.xlsx,.xls,.csv,.md,.txt"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                />
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}
