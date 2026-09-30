import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '@/lib/visitorContext';

/** Remembers the previous page, so a lead knows which page sent the visitor to the form. */
const PageViewTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    recordPageView(pathname);
  }, [pathname]);

  return null;
};

export default PageViewTracker;
