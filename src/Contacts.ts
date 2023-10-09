import { RNContacts } from './ContactsNative';
import { Contact } from './types';

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
        phoneNumber: phoneNumber.phoneNumber || null,
      })),
      emails: (x.emails || []).map((email: any) => ({
        id: email.id,
        label: email.label || null,
        email: email.email || null,
      })),
      urlAddresses: (x.urlAddresses || []).map((urlAddress: any) => ({
        id: urlAddress.id,
        label: urlAddress.label || null,
        url: urlAddress.url || null,
      })),
    }));
  }

  /**
   * Update contacts
   */
  static async updateContacts(contacts: Contact[]) {
    await RNContacts.getAll(
      contacts.map((x) => ({
        id: x.id,
        firstName: x.firstName ?? '',
        secondName: x.secondName ?? '',
        middleName: x.middleName ?? '',
        organizationName: x.organizationName ?? '',
        birthday: x.birthday ?? '',
        phoneNumbers: (x.phoneNumbers || []).map((phoneNumber: any) => ({
          id: phoneNumber.id,
          label: phoneNumber.label ?? '',
          phoneNumber: phoneNumber.phoneNumber ?? '',
        })),
        emails: (x.emails || []).map((email: any) => ({
          id: email.id,
          label: email.label ?? '',
          email: email.email ?? '',
        })),
        urlAddresses: (x.urlAddresses || []).map((urlAddress: any) => ({
          id: urlAddress.id,
          label: urlAddress.label ?? '',
          url: urlAddress.url ?? '',
        })),
      }))
    );
  }
}
