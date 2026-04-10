import { useState } from 'react';
import { UploadForm } from './components/UploadForm';
import { UploadList } from './components/UploadList';
import type { FileItem } from './components/UploadList';
import { AutoIngestForm } from './components/AutoIngestForm';
import { ArxivIngestForm } from './components/ArxivIngestForm';
import { AppLayout, type AppView } from './components/layout/AppLayout';

function App() {
  const [view, setView] = useState<AppView>('upload');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (selectedFiles: File[]) => {
    setIsUploading(true);

    const newFileItems: FileItem[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: 'uploading'
    }));

    setFiles(prev => [...newFileItems, ...prev]);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Note: Assuming proxy or CORS is set up, otherwise this URL might need adjustment
      const response = await fetch('http://localhost:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setFiles(prev => prev.map(item => {
        const result = data.jobs?.find((j: any) => j.filename === item.name);

        if (result) {
          if (result.status === 'failed') {
            return { ...item, status: 'error', message: result.error };
          }
          return { ...item, status: 'success', jobId: result.job_id };
        }
        return item;
      }));

    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(item =>
        item.status === 'uploading'
          ? { ...item, status: 'error', message: 'Network error or server unavailable' }
          : item
      ));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout activeView={view} onNavigate={setView}>
      {view === 'upload' ? (
        <div className="space-y-8">
          <UploadForm onUploadStart={handleUpload} isUploading={isUploading} />
          <UploadList files={files} />
        </div>
      ) : view === 'researchPapers' ? (
        <ArxivIngestForm />
      ) : (
        <AutoIngestForm />
      )}
    </AppLayout>
  );
}

export default App;
