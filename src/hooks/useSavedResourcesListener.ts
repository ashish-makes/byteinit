import { useState, useEffect } from 'react';
import { useBookmarks } from './useBookmarks';

// Create a global event emitter for saved resources changes
export const savedResourcesEvents = {
  listeners: new Set<() => void>(),
  
  // Method to notify all listeners when saved resources change
  notify: () => {
    savedResourcesEvents.listeners.forEach(listener => listener());
  },
  
  // Method to add a listener
  subscribe: (listener: () => void) => {
    savedResourcesEvents.listeners.add(listener);
    return () => {
      savedResourcesEvents.listeners.delete(listener);
    };
  }
};

// Hook to get saved resources count with real-time updates
export function useSavedResourcesCount() {
  const { savedResourceIds } = useBookmarks();
  const [count, setCount] = useState(savedResourceIds.length);
  
  useEffect(() => {
    // Update count when savedResourceIds changes
    setCount(savedResourceIds.length);
    
    // Subscribe to global events
    const unsubscribe = savedResourcesEvents.subscribe(() => {
      setCount(savedResourceIds.length);
    });
    
    return unsubscribe;
  }, [savedResourceIds]);
  
  return count;
} 