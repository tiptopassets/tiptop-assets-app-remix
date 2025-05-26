
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ModelGenerationProvider } from './contexts/ModelGeneration'
import { GoogleMapProvider } from './contexts/GoogleMapContext'

createRoot(document.getElementById("root")!).render(
  <GoogleMapProvider>
    <ModelGenerationProvider>
      <App />
    </ModelGenerationProvider>
  </GoogleMapProvider>
);
