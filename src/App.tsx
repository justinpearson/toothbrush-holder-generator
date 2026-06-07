import { useState } from 'react';
import { ParameterControls } from './components/ParameterControls/ParameterControls';
import { TopView } from './components/views/TopView';
import { SideView } from './components/views/SideView';
import { ThreeDView } from './components/views/ThreeDView';
import { FilamentPicker } from './components/FilamentPicker';
import { DownloadBar } from './components/DownloadBar';
import { useHolderParams } from './state/useHolderParams';
import { DEFAULT_FILAMENT } from './model/filaments';

export default function App() {
  const controls = useHolderParams();
  const { params } = controls;
  const [filament, setFilament] = useState(DEFAULT_FILAMENT);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Toothbrush Holder Generator</h1>
          <p>Design a parametric toothbrush holder, then download a .scad or .stl.</p>
        </div>
        <a
          className="app__repo-link"
          href="https://github.com/justinpearson/toothbrush-holder-generator"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.76-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>View on GitHub</span>
        </a>
      </header>

      <div className="app__body">
        <aside className="app__sidebar">
          <ParameterControls controls={controls} />
          <DownloadBar params={params} />
        </aside>

        <main className="app__views">
          <figure className="view-panel">
            <figcaption>Top</figcaption>
            <TopView params={params} />
          </figure>
          <figure className="view-panel">
            <figcaption>Side</figcaption>
            <SideView params={params} />
          </figure>
          <figure className="view-panel view-panel--3d">
            <div className="view-panel__bar">
              <figcaption>3D</figcaption>
              <FilamentPicker color={filament} onChange={setFilament} />
            </div>
            <ThreeDView params={params} color={filament} />
          </figure>
        </main>
      </div>
    </div>
  );
}
