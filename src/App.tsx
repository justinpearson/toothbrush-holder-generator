import { ParameterControls } from './components/ParameterControls/ParameterControls';
import { TopView } from './components/views/TopView';
import { SideView } from './components/views/SideView';
import { ThreeDView } from './components/views/ThreeDView';
import { DownloadBar } from './components/DownloadBar';
import { useHolderParams } from './state/useHolderParams';

export default function App() {
  const controls = useHolderParams();
  const { params } = controls;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Toothbrush Holder Maker</h1>
        <p>Design a parametric toothbrush holder, then download a .scad or .stl.</p>
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
            <figcaption>3D</figcaption>
            <ThreeDView params={params} />
          </figure>
        </main>
      </div>
    </div>
  );
}
