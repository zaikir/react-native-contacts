import { useContext } from 'react';

import { ContactsContext } from '../contexts/ContactsContext';

export function useContacts() {
  const { setContacts, setStatus, ...rest } = useContext(ContactsContext);
  return rest;
}
