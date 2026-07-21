import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function QrScanner({ onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);
  const containerId = 'qr-reader';

  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    onScanErrorRef.current = onScanError;
  }, [onScanError]);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanSuccessRef.current(decodedText);
        },
        () => {
          // fires continuously while no QR is detected — intentionally ignored
        }
      )
      .catch((err) => {
        if (onScanErrorRef.current) onScanErrorRef.current(err.message || 'Could not start camera.');
      });

    return () => {
      const s = scannerRef.current;
      // Only attempt to stop if the scanner actually confirms it's running —
      // avoids the "Cannot stop, scanner is not running" crash that happens
      // when React's Strict Mode unmounts/remounts the component in development
      if (s && s.isScanning) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, []);

  return <div id={containerId} className="w-full max-w-sm mx-auto rounded-lg overflow-hidden" />;
}

export default QrScanner;
