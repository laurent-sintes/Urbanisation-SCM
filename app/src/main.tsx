import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { App } from './App';
import { ReaderBoundary } from './components/ReaderBoundary';
import { preference, readRoute, routeHash } from './navigation';
import './styles.css';
import './brand.css';
import './reader.css';

if (!location.hash) {
  const saved = preference<string>('selection', '');
  if (saved) history.replaceState(history.state, '', routeHash(readRoute(saved)));
}

const root = document.getElementById('root');
if (!root) throw new Error('Racine Atlas introuvable.');
createRoot(root).render(
  <ReaderBoundary>
    <HashRouter>
      <App />
    </HashRouter>
  </ReaderBoundary>,
);
