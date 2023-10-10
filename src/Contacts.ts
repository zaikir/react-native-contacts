import { RNContacts } from './ContactsNative';
import { Contact, ContactUpdate } from './types';

/**
 * `Contacts` provides access to the contacts
 */
export class Contacts {
  /**
   * Fetch all contacts
   */
  static async fetchContacts(): Promise<Contact[]> {
    const items = await RNContacts.fetchContacts();

    return items.map((x: any) => ({
      id: x.id,
      firstName: x.firstName || null,
      secondName: x.secondName || null,
      middleName: x.middleName || null,
      organizationName: x.organizationName || null,
      birthday: x.birthday || null,
      phoneNumbers: (x.phoneNumbers || []).map((phoneNumber: any) => ({
        id: phoneNumber.id,
        label: phoneNumber.label || null,
        localizedLabel: phoneNumber.localizedLabel || null,
        phoneNumber: phoneNumber.phoneNumber || null,
      })),
      emails: (x.emails || []).map((email: any) => ({
        id: email.id,
        label: email.label || null,
        localizedLabel: email.localizedLabel || null,
        email: email.email || null,
      })),
      urlAddresses: (x.urlAddresses || []).map((urlAddress: any) => ({
        id: urlAddress.id,
        label: urlAddress.label || null,
        localizedLabel: urlAddress.localizedLabel || null,
        url: urlAddress.url || null,
      })),
    }));
  }

  /**
   * Update contacts
   */
  static async updateContacts(
    contacts: ContactUpdate[],
    idsToDelete?: string[]
  ) {
    await RNContacts.updateContacts([
      ...contacts.map((x) => ({
        id: x.id ?? '',
        firstName: x.firstName ?? '',
        secondName: x.secondName ?? '',
        middleName: x.middleName ?? '',
        organizationName: x.organizationName ?? '',
        birthday: x.birthday ?? '',
        phoneNumbers: (x.phoneNumbers ?? []).map((phoneNumber) => ({
          id: phoneNumber.id ?? '',
          label: phoneNumber.label ?? '',
          localizedLabel: phoneNumber.localizedLabel ?? '',
          phoneNumber: phoneNumber.phoneNumber ?? '',
        })),
        emails: (x.emails ?? []).map((email) => ({
          id: email.id ?? '',
          label: email.label ?? '',
          localizedLabel: email.localizedLabel ?? '',
          email: email.email ?? '',
        })),
        urlAddresses: (x.urlAddresses ?? []).map((urlAddress) => ({
          id: urlAddress.id ?? '',
          label: urlAddress.label ?? '',
          localizedLabel: urlAddress.localizedLabel ?? '',
          url: urlAddress.url ?? '',
        })),
      })),
      (idsToDelete ?? []).map((id) => ({
        id,
        action: 'delete',
      })),
    ]);
  }
}
