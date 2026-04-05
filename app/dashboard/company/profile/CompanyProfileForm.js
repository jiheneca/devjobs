"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CompanyProfileForm({ company }) {
  const router = useRouter()
  const [name, setName] = useState(company?.name || "")
  const [description, setDescription] = useState(company?.description || "")
  const [logoFile, setLogoFile] = useState(null)
  // ✅ Start with existing logo from DB
  const [logoPreview, setLogoPreview] = useState(company?.logo || null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      let logoUrl = logoPreview // ✅ Keep existing logo if no new file

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

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      router.refresh()
      router.push("/dashboard/company/profile")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-5">
      <h3 className="text-xl font-semibold text-gray-900">Edit Company Profile</h3>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
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
              {logoPreview ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
            {logoFile && (
              <span className="text-xs text-gray-400 truncate max-w-[100px]">{logoFile.name}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span className="ml-1 text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length} characters</p>
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