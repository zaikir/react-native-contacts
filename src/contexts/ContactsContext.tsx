import React, {
  PropsWithChildren,
  createContext,
  useMemo,
  useState,
} from 'react';

import { FlattenContact, flattenContacts, Contact } from '../index';

export type ContactsFetchStatus =
  | 'unknown'
  | 'fetching'
  | 'error'
  | 'blocked'
  | 'fetched';

export type ContactsContextType = {
  status: ContactsFetchStatus;
  setStatus: React.Dispatch<React.SetStateAction<ContactsFetchStatus>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  flatContacts: FlattenContact[];
  duplicateNameContacts: Contact[][];
  duplicatePhoneContacts: FlattenContact[][];
};

export const ContactsContext = createContext<ContactsContextType>({} as any);

export function ContactsProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ContactsFetchStatus>('unknown');
  const [contacts, setContacts] = useState<Contact[]>([]);

  const flatContacts = useMemo(
    () => flattenContacts(contacts, 'phoneNumbers'),
    [contacts],
  );

  const { duplicatePhoneContacts, duplicateNameContacts } = useMemo<{
    duplicateNameContacts: Contact[][];
    duplicatePhoneContacts: FlattenContact[][];
  }>(() => {
    const duplicateNameContacts = Object.values(
      contacts
        .filter((item) => item.firstName ?? item.secondName)
        .reduce((acc, item) => {
          const key = `${item.firstName} ${item.secondName}`
            .trim()
            .toLocaleLowerCase();

          acc[key] = acc[key] ?? [];
          acc[key]!.push(item);

          return acc;
        }, {} as Record<string, Contact[]>),
    ).filter((x) => x.length > 1);

    const duplicatePhoneContacts = Object.values(
      flatContacts
        .filter((item) => item.phoneNumber.phoneNumber)
        .reduce((acc, item) => {
          const key = item.phoneNumber
            .phoneNumber!.trim()
            .toLocaleLowerCase()
            .replace(/[+\-() ]/g, '');

          acc[key] = acc[key] ?? [];
          acc[key]!.push(item);

          return acc;
        }, {} as Record<string, FlattenContact[]>),
    ).filter((x) => x.length > 1);

    return {
      duplicateNameContacts,
      duplicatePhoneContacts,
    };
  }, [contacts, flatContacts]);

  const contextData = useMemo<ContactsContextType>(
    () => ({
      status,
      contacts,
      flatContacts,
      duplicatePhoneContacts,
      duplicateNameContacts,
      setContacts,
      setStatus,
    }),
    [
      status,
      contacts,
      flatContacts,
      duplicatePhoneContacts,
      duplicateNameContacts,
    ],
  );

  return (
    <ContactsContext.Provider value={contextData}>
      {children}
    </ContactsContext.Provider>
  );
}
