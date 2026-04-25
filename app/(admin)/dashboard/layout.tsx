import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['tobeystudios@gmail.com', 'michaeld56567@gmail.com'];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/');
  }

  // Safely grab all emails attached to the user session
  const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());

  // Check if any of the user's emails intersect with the authorized ADMIN_EMAILS
  const isAdmin = userEmails.some(email => ADMIN_EMAILS.includes(email));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-xl mb-4">You do not have administrative privileges.</p>
        <div className="bg-white p-6 shadow rounded text-left border overflow-auto w-full max-w-2xl">
          <p className="font-bold">Debugging Info:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>Your Detected Emails: <b>{userEmails.join(', ')}</b></li>
            <li>Required Admin Emails: <b>{ADMIN_EMAILS.join(', ')}</b></li>
            <li>Is Admin Evaluated To: <b>{isAdmin ? 'true' : 'false'}</b></li>
          </ul>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Store Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Control Center</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors">
            <LayoutDashboard size={20} />
            Overview
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 font-medium hover:bg-white/10 transition-colors">
            <ShoppingCart size={20} />
            Orders
          </Link>
          <a href="/studio" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 font-medium hover:bg-white/10 transition-colors">
            <Package size={20} />
            Manage Products
          </a>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Returns to Store
          </Link>
          <div className="px-4 py-2 text-gray-400 text-xs">
            Logged in as:<br/>
            <span className="text-white font-medium break-all">{userEmails[0]}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
