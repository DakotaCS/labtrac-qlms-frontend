/**
 * @author Dakota Soares
 * @version 1.1
 * @description Scanning Listener
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useScanning } from './scanningContext';

const ScannerListener: React.FC = () => {
  const { isScanningEnabled } = useScanning();
  const scannerInputRef = useRef('');
  const lastInputTimeRef = useRef<number>(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const ignoredKeys = [
        'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Insert', 'Delete',
        'Home', 'End', 'PageUp', 'PageDown', 'NumLock', 'ScrollLock', 'Pause',
        'ContextMenu',
      ];

      if (!isScanningEnabled) return;

      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) return;

      const now = Date.now();
      const timeSinceLastInput = now - lastInputTimeRef.current;
      lastInputTimeRef.current = now;

      if (event.key === 'Enter') {
        const scannedData = scannerInputRef.current.trim();
        scannerInputRef.current = '';
        if (scannedData) {
          let url = scannedData;
          if (!/^https?:\/\//i.test(scannedData)) {
            url = 'https://' + scannedData;
          }
          window.open(url, '_blank');
        }
        event.preventDefault();
      } else if (!ignoredKeys.includes(event.key) && event.key.length === 1) {
        if (timeSinceLastInput < 50) {
          scannerInputRef.current += event.key;
        } else {
          scannerInputRef.current = event.key;
        }
        event.preventDefault();
      }
    },
    [isScanningEnabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};

export default ScannerListener;