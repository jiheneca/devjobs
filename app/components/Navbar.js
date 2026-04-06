"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="p-4 bg-black text-white flex justify-between items-center gap-4">
      <div className="font-bold text-lg">
        <Link href="/">DevJobs 🚀</Link>
      </div>

      <div className="flex gap-6 items-center flex-1">
      
 
      </div>

      <div className="flex gap-4 items-center">
        {status === "loading" && <p className="text-sm text-gray-300">Loading...</p>}

        {!session && status !== "loading" && (
          <>
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition"
            >
              Register
            </Link>
          </>
        )}

        {session && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition flex items-center gap-2"
            >
              <span className="text-sm">{session.user?.name}</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                {session.user?.role}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg z-10">
                <div className="px-4 py-2 text-sm text-gray-300 border-b">
                  {session.user?.email}
                </div>

               

                <button
                  onClick={() => {
                    signOut()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 text-red-400 transition border-t border-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}