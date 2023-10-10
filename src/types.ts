export type LabeledItem = {
  id: string;
  label: string | null;
  localizedLabel: string | null;
};

export type ContactPhoneNumber = LabeledItem & {
  phoneNumber: string | null;
};

export type ContactEmail = LabeledItem & {
  email: string | null;
};

export type ContactUrlAddress = LabeledItem & {
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
