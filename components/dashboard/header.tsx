'use client'

import { Bell, Search, UserCircle } from 'lucide-react'

export function Header({ profile }: { profile?: any }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex flex-1 items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        
        <div className="flex items-center border-l pl-6">
          <div className="mr-3 text-right">
            <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ') || 'Guest'}</p>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-100 flex justify-center items-center">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
               <UserCircle className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
