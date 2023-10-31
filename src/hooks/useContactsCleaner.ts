import { useContext } from 'react';

import { ContactsCleanerContext } from '../contexts/ContactsCleanerContext';

export function useContactsCleaner() {
  return useContext(ContactsCleanerContext);
}
