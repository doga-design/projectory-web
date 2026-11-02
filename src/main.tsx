import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@/styles/global.css'; // Import global styles
import { initVisitorContext } from '@/lib/visitorContext';
import { armHomeEntrance } from '@/lib/homeEntrance';

// Before the first render: captures UTMs / referrer / landing page for lead tracking.
initVisitorContext();
armHomeEntrance();

createRoot(document.getElementById('root')!).render(<App />);
