import React from 'react';

const DownloadButton = ({ onDownload }) => (
  <button className="download-btn" onClick={onDownload}>
    ⬇️ Download Excel
  </button>
);

export default DownloadButton;
