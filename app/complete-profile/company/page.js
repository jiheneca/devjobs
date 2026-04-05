"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CompleteCompanyProfile() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nameError, setNameError] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin")
    if (status === "authenticated") {
      if (session?.user?.role === "DEVELOPER") router.replace("/complete-profile/developer")
      if (session?.user?.profileComplete) router.replace("/dashboard/company")
    }
  }, [status, session])

  if (status === "loading") return null
  if (!session) return null

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError("Company name is required")
      return
    }

    setLoading(true)
    setError(null)
    setNameError(null)

    try {
      let logoUrl = null

      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error("Logo upload failed")
        const uploadData = await uploadRes.json()
        logoUrl = uploadData.url
      }

      const res = await fetch("/api/complete-profile/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl, description }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }

      await update()
      router.replace("/dashboard/company")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl space-y-6">
        <div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Set up your company</h1>
          <p className="mt-1 text-sm text-gray-500">Let developers know who you are and what you're building.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null) }}
              className={`appearance-none block w-full px-3 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${
                nameError ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Logo upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Company logo
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Choose logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              {logoFile && (
                <span className="text-xs text-gray-400 truncate max-w-[100px]">{logoFile.name}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={5}
              placeholder="What does your company do? What kind of developers are you looking for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length} characters</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : "Save & Go to Dashboard"}
            </button>

            <button
              type="button"
              onClick={async () => { await update(); router.replace("/dashboard/company") }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}