import { Contact, FlattenContact } from 'src/types';

export function flattenContacts<
  K extends 'phoneNumbers' | 'emails' | 'urlAddresses'
>(contacts: Contact[], key: K): FlattenContact<K>[] {
  return contacts.flatMap(
    // @ts-ignore
    ({ phoneNumbers, urlAddresses, emails, ...contact }) => {
      if (key === 'phoneNumbers') {
        return phoneNumbers.map(
          (phoneNumber) =>
            ({
              ...contact,
              urlAddresses,
              emails,
              phoneNumber,
            } as FlattenContact<'phoneNumbers'>)
        );
      }

      if (key === 'emails') {
        return emails.map(
          (email) =>
            ({
              ...contact,
              phoneNumbers,
              urlAddresses,
              email,
            } as FlattenContact<'emails'>)
        );
      }

      if (key === 'urlAddresses') {
        return urlAddresses.map(
          (urlAddress) =>
            ({
              ...contact,
              phoneNumbers,
              emails,
              urlAddress,
            } as FlattenContact<'urlAddresses'>)
        );
      }

      throw new Error('Not implemented');
    }
  );
}
