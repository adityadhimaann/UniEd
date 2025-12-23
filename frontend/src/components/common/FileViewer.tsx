import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image as ImageIcon, FileVideo, FileAudio, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileViewer({ fileUrl, fileName, isOpen, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // For local PDFs, don't show loading state since we can't preview them
      if (fileUrl && (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) && fileUrl.endsWith('.pdf')) {
        setLoading(false);
      } else {
        setLoading(true);
      }
      setPdfError(false);
    }
  }, [isOpen, fileUrl]);

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
  const isLocalFile = fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1');

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-400" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-purple-400" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-green-400" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8 text-red-400" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
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
              onError={(e) => {
                setLoading(false);
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-center">
                      <div class="text-red-400 mb-4">
                        <svg class="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 class="text-xl font-bold text-white mb-2">Failed to load image</h3>
                      <p class="text-gray-400 mb-4">The image could not be displayed.</p>
                      <button onclick="window.open('${fileUrl}', '_blank')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                        Open in New Tab
                      </button>
                    </div>
                  `;
                }
              }}
            />
          </div>
        );

      case 'pdf':
        // For local files, show download/open options immediately
        if (isLocalFile) {
          return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FileText className="h-32 w-32 text-red-400 mb-8" />
              <h3 className="text-xl font-bold text-white mb-2">
                PDF File Ready
              </h3>
              <p className="text-gray-400 mb-6">
                Due to browser security restrictions, local PDFs cannot be previewed inline.<br />
                Please download or open in a new tab to view the file.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setLoading(false);
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName || 'document.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => {
                    setLoading(false);
                    window.open(fileUrl, '_blank');
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="w-full h-full flex flex-col">
              {!pdfError ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  className="w-full h-full border-0"
                  title={fileName || 'PDF Viewer'}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setPdfError(true);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="h-32 w-32 text-red-400 mb-8" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    PDF Preview Unavailable
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Unable to display PDF in browser. Please download or open in new tab to view.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileName || 'document.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => window.open(fileUrl, '_blank')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        }

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(4px)' }}
        >
          {/* Background overlay - clicking this closes the modal */}
          <div 
            className="absolute inset-0" 
            onClick={onClose}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Modal content - this should be clickable */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full h-full max-w-7xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl border-2 border-gray-700 flex flex-col"
            style={{ pointerEvents: 'auto', zIndex: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    {fileName || 'File Viewer'}
                  </h2>
                  <p className="text-sm text-gray-400 truncate">{fileUrl.split('/').pop()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                  <div className="flex flex-col items-center gap-4">
                    <img src="/loadicon.gif" alt="Loading..." className="h-24 w-24" />
                    <p className="text-white text-lg">Loading file...</p>
                  </div>
                </div>
              )}
              <div className="w-full h-full">
                {renderFileContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
