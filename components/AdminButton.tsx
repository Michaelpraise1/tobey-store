"use client";

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

const ADMIN_EMAILS = ['tobeystudios@gmail.com', 'michaeld56567@gmail.com'];

export default function AdminButton() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  // Grab the first available email address safely
  const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());

  if (!isAdmin) return null;

  return (
    <Link 
      href="/dashboard" 
      className="hidden md:flex items-center text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
    >
      Dashboard
    </Link>
  );
}
