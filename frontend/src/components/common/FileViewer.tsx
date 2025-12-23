import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image as ImageIcon, FileVideo, FileAudio, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileViewer({ fileUrl, fileName, isOpen, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true);

  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return 'image';
    }
    // PDFs
    if (extension === 'pdf') {
      return 'pdf';
    }
    // Videos
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
      return 'video';
    }
    // Audio
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
      return 'audio';
    }
    // Documents
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    }
    // Spreadsheets
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return 'spreadsheet';
    }
    // Presentations
    if (['ppt', 'pptx'].includes(extension)) {
      return 'presentation';
    }
    
    return 'unknown';
  };

  const fileType = getFileType(fileUrl);

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-16 w-16 text-blue-400" />;
      case 'video':
        return <FileVideo className="h-16 w-16 text-purple-400" />;
      case 'audio':
        return <FileAudio className="h-16 w-16 text-green-400" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-16 w-16 text-red-400" />;
      default:
        return <File className="h-16 w-16 text-gray-400" />;
    }
  };

  const renderFileContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={fileUrl}
              alt={fileName || 'File'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={fileName || 'PDF Viewer'}
            onLoad={() => setLoading(false)}
          />
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <video
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => setLoading(false)}
            >
              <source src={fileUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <FileAudio className="h-32 w-32 text-green-400 mb-8" />
            <audio
              controls
              className="w-full max-w-md"
              onLoadedData={() => setLoading(false)}
            >
              <source src={fileUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {getFileIcon()}
            <h3 className="text-xl font-bold text-white mt-6 mb-2">
              Preview not available
            </h3>
            <p className="text-gray-400 mb-6">
              This file type cannot be previewed in the browser.
            </p>
            <Button
              onClick={() => window.open(fileUrl, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-4 md:inset-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl border-2 border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    {fileName || 'File Viewer'}
                  </h2>
                  <p className="text-sm text-gray-400 truncate">{fileUrl.split('/').pop()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="flex flex-col items-center gap-4">
                    <img src="/loadicon.gif" alt="Loading..." className="h-24 w-24" />
                    <p className="text-white text-lg">Loading file...</p>
                  </div>
                </div>
              )}
              {renderFileContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
