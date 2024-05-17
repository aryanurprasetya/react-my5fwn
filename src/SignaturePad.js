// SignaturePad.js
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onEnd }) => {
  const sigPad = useRef(null);

  const clear = () => {
    sigPad.current.clear();
  };

  const save = () => {
    const dataURL = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    onEnd(dataURL);
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigPad}
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
      />
      <button onClick={clear}>Clear</button>
      <button onClick={save}>Save</button>
    </div>
  );
};

export default SignaturePad;
