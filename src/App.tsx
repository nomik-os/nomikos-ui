import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { ContentProvider } from './context/ContentContext';
import logger from './utils/logger';

logger.info('Application starting');

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/auth');
  logger.debug(`Current path: ${location.pathname}`);

  return (
    <ContentProvider>
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </ContentProvider>
  );
}
