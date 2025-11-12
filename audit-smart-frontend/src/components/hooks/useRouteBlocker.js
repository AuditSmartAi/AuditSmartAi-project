// hooks/useRouteBlocker.js
import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export default function useRouteBlocker(shouldBlock, message) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!shouldBlock) return;

    const unblock = navigator.block((tx) => {
      if (window.confirm(message)) {
        unblock(); // allow navigation
        tx.retry();
      }
    });

    return unblock;
  }, [shouldBlock, message, navigator]);
}
