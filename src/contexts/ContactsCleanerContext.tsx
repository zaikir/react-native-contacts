import {
  useAlert,
  useAppActivityEffect,
  usePermissions,
} from '@kirz/react-native-toolkit';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { Platform } from 'react-native';

import {
  Contact,
  fetchContacts as loadContacts,
  updateContacts,
  unflattenContacts,
} from 'src';

import { ContactsContext, ContactsFetchStatus } from './ContactsContext';

export type ContactsCleanerContextType = {
  status: ContactsFetchStatus;
  fetchContacts: () => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  deleteContacts: (contactIds: string[]) => Promise<void>;
};

export const ContactsCleanerContext = createContext<ContactsCleanerContextType>(
  {} as any,
);

export function ContactsCleanerProvider({ children }: PropsWithChildren) {
  const { checkPermissionStatus } = usePermissions();
  // @ts-ignore
  const { showAlert: showErrorAlert } = useAlert('error');
  const { status, contacts, flatContacts, setStatus, setContacts } =
    useContext(ContactsContext);

  const isFetchRequested = useRef(false);

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
      showErrorAlert({
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
        showErrorAlert({
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
      fetchContacts,
      deleteContact,
      deleteContacts,
    }),
    [status, fetchContacts, deleteContact, deleteContacts],
  );

  return (
    <ContactsCleanerContext.Provider value={contextData}>
      {children}
    </ContactsCleanerContext.Provider>
  );
}