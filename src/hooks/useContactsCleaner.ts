import { useContext } from 'react';

import { ContactsCleanerContext } from '../contexts/ContactsCleanerContext';

export function useContactsCleaner() {
  const { setContacts, setStatus, ...rest } = useContext(
    ContactsCleanerContext,
  );

  return rest;
}
