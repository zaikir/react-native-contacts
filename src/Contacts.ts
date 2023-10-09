import { RNContacts } from './ContactsNative';

/**
 * `Contacts` provides access to the contacts
 */
export class Contacts {
  /**
   * Fetch all contacts
   */
  static async getAll(): Promise<any[]> {
    const result = await RNContacts.getAll();

    return result;
  }
}
