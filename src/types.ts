export type ContactPhoneNumber = {
  id: string;
  label: string | null;
  phoneNumber: string | null;
};

export type ContactEmail = {
  id: string;
  label: string | null;
  email: string | null;
};

export type ContactUrlAddress = {
  id: string;
  label: string | null;
  url: string | null;
};

export type Contact = {
  id: string;
  firstName: string | null;
  secondName: string | null;
  middleName: string | null;
  organizationName: string | null;
  jobTitle: string | null;
  birthday: string | null;
  phoneNumbers: ContactPhoneNumber[];
  emails: ContactEmail[];
  urlAddresses: ContactUrlAddress[];
};
