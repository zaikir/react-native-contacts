import { Contact, FlattenContact } from '../types';

export function flattenContacts<
  K extends 'phoneNumbers' | 'emails' | 'urlAddresses',
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
            } as FlattenContact<'phoneNumbers'>),
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
            } as FlattenContact<'emails'>),
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
            } as FlattenContact<'urlAddresses'>),
        );
      }

      throw new Error('Not implemented');
    },
  );
}

export function unflattenContacts(
  contactIds: string[],
): { id: string; nestedIds: string[] }[] {
  const pairs = contactIds.flatMap((contactId) => {
    const [pair] = ['phoneNumber', 'email', 'urlAddress']
      .map((key) => {
        if (contactId.includes(`__${key}`)) {
          const [id, other] = contactId.split(`__${key}:`);
          return { id: id!, nestedId: other! };
        }

        return null;
      })
      .filter((x) => !!x);

    if (!pair) {
      return { id: contactId, nestedId: null };
    }

    return pair;
  });

  return Object.entries(
    pairs.reduce((acc, item) => {
      const key = item.id;
      acc[key] = acc[key] ?? [];

      if (item.nestedId) {
        acc[key]!.push(item.nestedId);
      }

      return acc;
    }, {} as Record<string, string[]>),
  ).map((x) => ({
    id: x[0],
    nestedIds: x[1],
  }));
}

export function findDuplicateNameContacts(
  contacts: Contact[],
  predicate?: (value: Contact, index: number, array: Contact[]) => unknown,
) {
  return Object.values(
    contacts
      .filter((item) => item.firstName ?? item.secondName)
      .filter((...args) => !predicate || predicate(...args))
      .reduce((acc, item) => {
        const key = `${item.firstName} ${item.secondName}`
          .trim()
          .toLocaleLowerCase();

        acc[key] = acc[key] ?? [];
        acc[key]!.push(item);

        return acc;
      }, {} as Record<string, Contact[]>),
  ).filter((x) => x.length > 1);
}

export function findDuplicatePhoneContacts(
  flatContacts: FlattenContact<'phoneNumbers'>[],
  predicate?: (
    value: FlattenContact<'phoneNumbers'>,
    index: number,
    array: FlattenContact<'phoneNumbers'>[],
  ) => unknown,
) {
  return Object.values(
    flatContacts
      .filter((item) => item.phoneNumber.phoneNumber)
      .filter((...args) => !predicate || predicate(...args))
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
}
