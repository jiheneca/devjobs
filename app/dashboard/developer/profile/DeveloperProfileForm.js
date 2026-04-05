"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeveloperProfileForm({ developer }) {
  const router = useRouter()
  const [name, setName] = useState(developer?.user?.name || "")
  const [about, setAbout] = useState(developer?.about || "")
  const [imageFile, setImageFile] = useState(null)
  // ✅ Start with existing image from DB
  const [imagePreview, setImagePreview] = useState(developer?.image || null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    // ✅ Show new image preview immediately
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      let imageUrl = imagePreview // ✅ Keep existing image if no new file

      // Upload new image to Cloudinary if selected
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

      // ✅ Fixed API route + sends imageUrl not image
      const res = await fetch("/api/developer-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl, about }),
      })

      const data = await res.json()
      if (!res.ok) {
        const message = Array.isArray(data.error) ? data.error[0]?.message : data.error
        throw new Error(message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      router.refresh()
      router.push("/dashboard/developer/profile")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-5">
      <h3 className="text-xl font-semibold text-gray-900">Edit Developer Profile</h3>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo</label>
          <div className="flex items-center gap-4">

            {/* ✅ Shows existing image OR new preview */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>

            <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              {imagePreview ? "Change photo" : "Upload photo"}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{about.length} characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all ${
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
          ) : "Save Changes"}
        </button>
      </form>
    </div>
  )
}