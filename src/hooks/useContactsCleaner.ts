import { useContext } from 'react';

import { ContactsCleanerContext } from 'src/contexts/ContactsCleanerContext';

export function useContactsCleaner() {
  return useContext(ContactsCleanerContext);
}
