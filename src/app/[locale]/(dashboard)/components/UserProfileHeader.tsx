// Example path: app/(dashboard)/components/UserProfileHeader.tsx
"use client"; // Mark this as a Client Component

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LogoutButton } from './LogoutButton'; // Adjust import path if needed
import styles from '../page.module.css'; // Use the layout's styles, adjust path if needed

interface UserProfileHeaderProps {
  locale: string; // Pass locale down for the LogoutButton
}

export default function UserProfileHeader({ locale }: UserProfileHeaderProps) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Access localStorage only after the component mounts on the client
    const identifier = localStorage.getItem('loginIdentifier');
    setUsername(identifier || "User"); // Set username or a default fallback
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className={styles.profileElementsController}>
      <div className={styles.profilePicturePlaceholder}>
        <Image src="/logo.svg" alt="Logo" width={30} height={30} className={styles.logoIcon} />
      </div>
      {/* Display username from state, show loading/default if not yet loaded */}
      <h2 className={styles.profileUsername}>{username ?? '...'}</h2>
      <LogoutButton locale={locale} />
    </div>
  );
}