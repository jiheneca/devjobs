"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CompleteDeveloperProfile() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [about, setAbout] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin")
    if (status === "authenticated") {
      if (session?.user?.role === "COMPANY") router.replace("/complete-profile/company")
      if (session?.user?.profileComplete) router.replace("/dashboard/developer")
    }
  }, [status, session])

  if (status === "loading") return null
  if (!session) return null

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = null

      // Step 1: upload image to Cloudinary if one was selected
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error("Image upload failed")
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      // Step 2: save profile with the Cloudinary URL
      const res = await fetch("/api/complete-profile/developer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, about }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }

      await update()
      router.replace("/dashboard/developer")
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
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Complete your profile</h1>
          <p className="mt-1 text-sm text-gray-500">Help companies learn more about you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Profile photo
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {/* File input */}
              <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Choose photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-gray-400 truncate max-w-[100px]">{imageFile.name}</span>
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              About you
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe your skills, experience, and what kind of opportunities you're looking for..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{about.length} characters</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
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
              onClick={async () => { await update(); router.replace("/dashboard/developer") }}
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