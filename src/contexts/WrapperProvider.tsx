import React, { PropsWithChildren } from 'react';

import { ContactsCleanerProvider } from './ContactsCleanerContext';
import { ContactsProvider } from './ContactsContext';

export function WrapperProvider({ children }: PropsWithChildren) {
  return (
    <ContactsProvider>
      <ContactsCleanerProvider>{children}</ContactsCleanerProvider>
    </ContactsProvider>
  );
}
