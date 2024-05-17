// FileUpload.js
import React from 'react';

const FileUpload = ({ onFileSelect }) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    onFileSelect(selectedFile);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf,image/*"
      />
    </div>
  );
};

export default FileUpload;
