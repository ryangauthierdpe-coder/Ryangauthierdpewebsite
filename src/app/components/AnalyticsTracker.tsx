import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { track } from '@vercel/analytics';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever the location changes
    track('pageview', {
      path: location.pathname,
      hash: location.hash,
      fullPath: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location]);

  return null;
}
