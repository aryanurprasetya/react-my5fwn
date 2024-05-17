// DocumentDisplay.js
import React from 'react';

const DocumentDisplay = ({ file }) => {
  if (!file) return null;

  const fileURL = URL.createObjectURL(file);

  if (file.type === 'application/pdf') {
    return (
      <embed src={fileURL} type="application/pdf" width="600" height="800" />
    );
  } else if (file.type.startsWith('image/')) {
    return (
      <img
        src={fileURL}
        alt="Uploaded Document"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    );
  } else {
    return <p>Unsupported file type.</p>;
  }
};

export default DocumentDisplay;
