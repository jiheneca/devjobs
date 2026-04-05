"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function RoleSelectionPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingRole, setPendingRole] = useState(null) // ✅ track which role was just set

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.role) {
      // ✅ Role is now in session — redirect to correct complete-profile page
      if (!session.user.profileComplete) {
        if (session.user.role === "DEVELOPER") router.replace("/complete-profile/developer")
        else if (session.user.role === "COMPANY") router.replace("/complete-profile/company")
      } else {
        if (session.user.role === "DEVELOPER") router.replace("/dashboard/developer")
        else if (session.user.role === "COMPANY") router.replace("/dashboard/company")
      }
    }
  }, [status, session])
  // ↑ This now fires whenever session changes — including AFTER update() refreshes it

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!session?.user?.email) return null
  if (session?.user?.role) return null

  async function setRole(role) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to set role")
      }

      // ✅ Just call update() — the useEffect above will handle the redirect
      // once the session actually refreshes with the new role
      await update()

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
    // ✅ Don't set loading false here — keep spinner until redirect happens
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome!</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please choose your role to continue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={() => setRole("DEVELOPER")}
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold text-white border border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
            }`}
          >
            {loading ? "Setting..." : "👨‍💻 Developer"}
          </button>

          <button
            onClick={() => setRole("COMPANY")}
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold text-white border border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading ? "bg-green-400 cursor-wait" : "bg-green-600 hover:bg-green-700 hover:shadow-md"
            }`}
          >
            {loading ? "Setting..." : "🏢 Company"}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
