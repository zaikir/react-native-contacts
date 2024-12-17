import React from 'react';

import {
  ContactsCleanerProvider,
  ContactsCleanerProviderProps,
} from './ContactsCleanerContext';

export function WrapperProvider({
  children,
  ...props
}: ContactsCleanerProviderProps) {
  return (
    <ContactsCleanerProvider {...props}>{children}</ContactsCleanerProvider>
  );
}
