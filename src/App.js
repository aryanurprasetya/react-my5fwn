import React, { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';
import SignaturePad from './SignaturePad';
import { PDFDocument, rgb } from 'pdf-lib';

const App = () => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setSignature(null); // Reset signature when a new file is uploaded

    if (selectedFile.type === 'application/pdf') {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfDoc);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      setCanvasSize({ width, height });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = await renderPdfPageAsImage(pdfDoc, 0, width, height);
      ctx.clearRect(0, 0, width, height); // Clear the canvas
      ctx.drawImage(img, 0, 0);
    }
  };

  const renderPdfPageAsImage = async (pdfDoc, pageIndex, width, height) => {
    const page = pdfDoc.getPages()[pageIndex];
    const pageSvg = await page.renderToSvg();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(pageSvg);
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
    });
  };

  const handleSignatureEnd = (dataURL) => {
    setSignature(dataURL);
  };

  const saveCombinedImage = async () => {
    if (!pdfDoc || !signature) return;

    const img = new Image();
    img.src = signature;
    img.onload = async () => {
      const pngImageBytes = await fetch(signature).then((res) =>
        res.arrayBuffer()
      );
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        page.drawImage(pngImage, {
          x: signaturePosition.x,
          y: page.getHeight() - signaturePosition.y - pngImage.height,
          width: pngImage.width,
          height: pngImage.height,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'signed_document.pdf';
      link.click();
    };
  };

  const handleDragStart = (e) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e) => {
      setSignaturePosition({
        x: e.clientX - offsetX - canvasRef.current.getBoundingClientRect().left,
        y: e.clientY - offsetY - canvasRef.current.getBoundingClientRect().top,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="App">
      <h1>Upload Document and Sign</h1>
      <FileUpload onFileSelect={handleFileSelect} />
      {file && (
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ border: '1px solid black' }}
          />
          {signature && (
            <img
              src={signature}
              alt="Signature"
              style={{
                position: 'absolute',
                left: `${signaturePosition.x}px`,
                top: `${signaturePosition.y}px`,
                cursor: 'move',
              }}
              onMouseDown={handleDragStart}
            />
          )}
          {!signature && <SignaturePad onEnd={handleSignatureEnd} />}
          {signature && (
            <button onClick={saveCombinedImage}>
              Save Document with Signature
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
