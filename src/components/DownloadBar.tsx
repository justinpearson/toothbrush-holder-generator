import { useState } from 'react';
import { validate } from '../model/constraints';
import type { HolderParams } from '../model/types';
import { generateScad, SCAD_FILENAME } from '../export/scadGenerator';
import { generateStlBlob, STL_FILENAME } from '../export/stlGenerator';
import { triggerDownload } from '../export/download';

export function DownloadBar({ params }: { params: HolderParams }) {
  const [error, setError] = useState<string | null>(null);
  const hasError = validate(params).some((i) => i.level === 'error');

  const downloadScad = () => {
    setError(null);
    triggerDownload(generateScad(params), SCAD_FILENAME);
  };

  const downloadStl = () => {
    setError(null);
    try {
      triggerDownload(generateStlBlob(params), STL_FILENAME);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'STL export failed.');
    }
  };

  return (
    <div className="downloads">
      <button
        type="button"
        className="downloads__btn"
        onClick={downloadScad}
        disabled={hasError}
      >
        Download .scad
      </button>
      <button
        type="button"
        className="downloads__btn"
        onClick={downloadStl}
        disabled={hasError}
      >
        Download .stl
      </button>
      {hasError && (
        <span className="downloads__hint">Fix the errors above to export.</span>
      )}
      {error && <span className="downloads__error">{error}</span>}
    </div>
  );
}
