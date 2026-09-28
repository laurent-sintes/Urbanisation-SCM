import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ReaderBoundary } from './components/ReaderBoundary';
import './styles.css';
import './brand.css';
import './reader.css';

createRoot(document.getElementById('root')!).render(<ReaderBoundary><App /></ReaderBoundary>);
