// app/[locale]/(dashboard)/DashboardContext.tsx
"use client"; // This file needs to be a Client Component

import React, { createContext, useContext } from 'react';
import { SidebarContent } from '@/types'; // Assuming your types.ts is at the root

// Define the type for the value that the context will hold
interface DashboardContextType {
  locale: string; // You might want to pass locale too
  // Add any other data from the layout you want to share with children
}

// Create the Context
// We provide a default value of undefined and will check for it in the hook
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Create a Provider component that will wrap the children in the layout
// This component receives the fetched data as props
export function DashboardProvider({ children, locale }: {
    children: React.ReactNode;
    locale: string;
}) {
  // The Provider makes the passed props available to its children
  return (
    <DashboardContext.Provider value={{ locale }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Create a custom hook to easily consume the context in child components
export function useDashboardContext() {
  const context = useContext(DashboardContext);
  // Throw an error if the hook is used outside of the Provider
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
