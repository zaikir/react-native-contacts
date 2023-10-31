import { useContext } from 'react';

import { ContactsContext } from 'src/contexts/ContactsContext';

export function useContacts() {
  const { setContacts, setStatus, ...rest } = useContext(ContactsContext);
  return rest;
}
