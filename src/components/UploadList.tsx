import { CheckCircle, XCircle, Clock, Loader2, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileItem {
    id: string;
    name: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    message?: string;
    jobId?: string;
}

interface UploadListProps {
    files: FileItem[];
}

export function UploadList({ files }: UploadListProps) {
    if (files.length === 0) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{files.length} files</span>
            </div>

            <div className="space-y-3">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={cn(
                            "group relative overflow-hidden rounded-xl border bg-white p-4 transition-all hover:shadow-md",
                            file.status === 'error' ? "border-red-100" : "border-gray-100"
                        )}
                    >
                        {/* Progress Bar Background for uploading state */}
                        {file.status === 'uploading' && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-100">
                                <div className="h-full bg-brand-blue-500 animate-pulse w-full origin-left" />
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                                    file.status === 'success' ? "bg-brand-green-50 text-brand-green-600" :
                                        file.status === 'error' ? "bg-red-50 text-red-600" :
                                            "bg-gray-100 text-gray-500"
                                )}>
                                    <FileIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 truncate pr-4">{file.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {file.jobId ? (
                                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                ID: {file.jobId.substring(0, 8)}...
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Waiting for ID...</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center shrink-0">
                                {file.status === 'success' && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-brand-green-50 px-2.5 py-1 text-xs font-medium text-brand-green-700 border border-brand-green-100">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        <span>Complete</span>
                                    </div>
                                )}
                                {file.status === 'error' && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-100">
                                        <XCircle className="h-3.5 w-3.5" />
                                        <span>Failed</span>
                                    </div>
                                )}
                                {file.status === 'uploading' && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-brand-blue-50 px-2.5 py-1 text-xs font-medium text-brand-blue-700 border border-brand-blue-100">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Uploading...</span>
                                    </div>
                                )}
                                {file.status === 'pending' && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Pending</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {file.message && (
                            <div className="mt-3 ml-14 text-xs text-red-600 flex items-start gap-1">
                                <span className="font-semibold">Error:</span> {file.message}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
