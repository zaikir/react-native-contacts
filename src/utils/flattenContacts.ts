import { Contact, FlattenContact } from '../types';

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
              id: `${contact.id}__phoneNumber:${phoneNumber.id}`,
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
              id: `${contact.id}__email:${email.id}`,
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
              id: `${contact.id}__urlAddress:${urlAddress.id}`,
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
