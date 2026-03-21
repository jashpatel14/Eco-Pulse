import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Paperclip, Loader2 } from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';

export default function FileUpload({ value = [], onChange, label = "Attachments", maxFiles = 10 }) {
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (value.length + files.length > maxFiles) {
      addToast(`You can only upload up to ${maxFiles} files.`, 'error');
      return;
    }

    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const { data } = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrls = [...value, ...data.urls];
      onChange(newUrls);
      addToast('Files uploaded successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload files.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="file-upload-container" style={{ width: '100%' }}>
      <label className="plm-label">{label}</label>
      
      <div 
        className="upload-dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragging'); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragging');
          const files = Array.from(e.dataTransfer.files);
          uploadFiles(files);
        }}
        style={{
          border: '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--bg-input)',
          transition: 'all var(--ts)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          multiple 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip,.doc,.docx,.xls,.xlsx"
        />
        
        {uploading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 color="var(--brand)" size={32} />
          </motion.div>
        ) : (
          <Upload color="var(--brand)" size={32} />
        )}
        
        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
          {uploading ? 'Uploading...' : 'Click or drop files here'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Images, PDF, ZIP, and Office docs (Max 10MB each)
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        <AnimatePresence>
          {value.map((url, i) => (
            <motion.div 
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="file-chip"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'white',
                border: '1px solid var(--border-light)',
                borderRadius: '99px',
                fontSize: '0.8rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Paperclip size={14} color="var(--brand)" />
              <span style={{ 
                maxWidth: '150px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontWeight: 500
              }}>
                {url.split('/').pop().replace(/^\d+-[\da-f]+-/, '')}
              </span>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
