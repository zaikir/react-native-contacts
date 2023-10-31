import { Contacts } from './Contacts';

export * from './types';

export const fetchContacts = Contacts.fetchContacts;
export const updateContacts = Contacts.updateContacts;
export const flattenContacts = Contacts.flattenContacts;
export const unflattenContacts = Contacts.unflattenContacts;

export { useContacts } from './hooks/useContacts';
export { useContactsCleaner } from './hooks/useContactsCleaner';
export { WrapperProvider as ContactsProvider } from './contexts/WrapperProvider';
