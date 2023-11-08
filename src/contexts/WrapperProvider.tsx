import React, { PropsWithChildren } from 'react';

import { ContactsCleanerProvider } from './ContactsCleanerContext';

export function WrapperProvider({ children }: PropsWithChildren) {
  return <ContactsCleanerProvider>{children}</ContactsCleanerProvider>;
}
