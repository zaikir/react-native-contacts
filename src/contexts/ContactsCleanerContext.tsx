import {
  useAlert,
  useAppActivityEffect,
  usePermissions,
} from '@kirz/react-native-toolkit';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import {
  FlattenContact,
  flattenContacts,
  Contact,
  fetchContacts as loadContacts,
  updateContacts,
  unflattenContacts,
} from '../index';
import {
  findDuplicateNameContacts,
  findDuplicatePhoneContacts,
} from '../utils/flattenContacts';

export type ContactsFetchStatus =
  | 'unknown'
  | 'fetching'
  | 'error'
  | 'blocked'
  | 'fetched';

export type ContactsCleanerContextType = {
  status: ContactsFetchStatus;
  setStatus: React.Dispatch<React.SetStateAction<ContactsFetchStatus>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  flatContacts: FlattenContact[];
  duplicateNameContacts: Contact[][];
  duplicatePhoneContacts: FlattenContact[][];
  fetchContacts: () => Promise<void>;
  addContacts: (contacts: Contact[]) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  deleteContacts: (contactIds: string[]) => Promise<void>;
};

export const ContactsCleanerContext = createContext<ContactsCleanerContextType>(
  {} as any,
);

export function ContactsCleanerProvider({ children }: PropsWithChildren) {
  const { checkPermissionStatus } = usePermissions();
  // @ts-ignore
  const { showAlert } = useAlert();

  const isFetchRequested = useRef(false);

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
    const duplicateNameContacts = findDuplicateNameContacts(contacts);

    const duplicatePhoneContacts = findDuplicatePhoneContacts(flatContacts);

    return {
      duplicateNameContacts,
      duplicatePhoneContacts,
    };
  }, [contacts, flatContacts]);

  const fetchContacts = useCallback(async () => {
    try {
      setStatus('fetching');

      isFetchRequested.current = true;

      const { status } = await checkPermissionStatus(
        Platform.OS === 'ios'
          ? 'ios.permission.CONTACTS'
          : 'android.permission.READ_CONTACTS',
      );

      if (status === 'blocked') {
        setStatus('blocked');
        return;
      }

      const items = await loadContacts();
      setContacts(
        items.sort((a, b) =>
          `${a.firstName} ${a.secondName}`
            .trim()
            .localeCompare(`${b.firstName} ${b.secondName}`.trim()),
        ),
      );
      setStatus('fetched');
    } catch (err) {
      // @ts-ignore
      showAlert('error', {
        code: 'contacts:fetch-contacts',
        message: (err as Error).message,
      });
      setStatus('error');
    }
  }, []);

  const deleteContacts = useCallback(
    async (contactIds: string[]) => {
      const { status } = await checkPermissionStatus(
        Platform.OS === 'ios'
          ? 'ios.permission.CONTACTS'
          : 'android.permission.WRITE_CONTACTS',
      );
      if (status === 'blocked') {
        // @ts-ignore
        showAlert('error', {
          code: 'contacts:access-denied',
          message: 'Access to contacts required',
        });
        setStatus('error');
        return;
      }

      const flatIds = unflattenContacts(contactIds);

      const updatedContacts: Contact[] = contacts
        .map((x) => ({
          flatIds: flatIds.find((y) => y.id === x.id),
          contact: x,
        }))
        .filter((x) => x.flatIds)
        .map((x) => {
          return {
            ...x.contact,
            phoneNumbers: x.flatIds!.nestedIds.length
              ? x.contact.phoneNumbers.filter(
                  (y) => !x.flatIds!.nestedIds.includes(y.id),
                )
              : [],
          };
        });

      await updateContacts(
        updatedContacts.filter((x) => x.phoneNumbers.length),
        updatedContacts.filter((x) => !x.phoneNumbers.length).map((x) => x.id),
      );

      await fetchContacts();
    },
    [contacts, flatContacts],
  );

  const deleteContact = useCallback(async (contactId: string) => {
    await deleteContacts([contactId]);
  }, []);

  const addContacts = useCallback(async (contacts: Contact[]) => {
    const { status } = await checkPermissionStatus(
      Platform.OS === 'ios'
        ? 'ios.permission.CONTACTS'
        : 'android.permission.WRITE_CONTACTS',
    );
    if (status === 'blocked') {
      // @ts-ignore
      showAlert('error', {
        code: 'contacts:access-denied',
        message: 'Access to contacts required',
      });
      setStatus('error');
      return;
    }

    // @ts-ignore
    const updatedContacts: Contact[] = contacts.map(({ id, ...contact }) => {
      return {
        ...contact,
        id: '',
        phoneNumbers: contact.phoneNumbers.map(({ id, ...x }) => ({
          ...x,
          id: '',
        })),
      };
    });

    await updateContacts(updatedContacts);

    await fetchContacts();
  }, []);

  useAppActivityEffect(
    (initial) => {
      if (initial || !isFetchRequested.current || status !== 'unknown') {
        return;
      }

      (async () => {
        const { status } = await checkPermissionStatus(
          Platform.OS === 'ios'
            ? 'ios.permission.CONTACTS'
            : 'android.permission.READ_CONTACTS',
        );

        if (status === 'granted') {
          fetchContacts();
        }
      })();
    },
    [status],
  );

  const contextData = useMemo<ContactsCleanerContextType>(
    () => ({
      status,
      contacts,
      flatContacts,
      duplicatePhoneContacts,
      duplicateNameContacts,
      setContacts,
      setStatus,
      fetchContacts,
      addContacts,
      deleteContact,
      deleteContacts,
    }),
    [
      status,
      contacts,
      flatContacts,
      duplicatePhoneContacts,
      duplicateNameContacts,
      fetchContacts,
      deleteContact,
      deleteContacts,
    ],
  );

  return (
    <ContactsCleanerContext.Provider value={contextData}>
      {children}
    </ContactsCleanerContext.Provider>
  );
}
