"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ApplyJobForm({ jobId, hasApplied }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [cvFile, setCvFile] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (hasApplied) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-800">✓ You have already applied for this job</p>
      </div>
    )
  }

  if (!session || session.user.role !== "DEVELOPER") {
    return (
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-800">Only developers can apply for jobs</p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!cvFile) {
        throw new Error("Please select a CV file")
      }

      // Step 1: Upload PDF to Cloudinary
      const formData = new FormData()
      formData.append("file", cvFile)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      console.log("Upload result:", uploadData) // debug
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Failed to upload CV")
      }

      const cvUrl = uploadData.url

      // Step 2: Submit application with Cloudinary URL
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl, message }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply")
      }

      setSuccess("Application submitted successfully!")
      setCvFile(null)
      setMessage("")
      setTimeout(() => router.refresh(), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Apply for this job</h3>
      
      {error && <div className="bg-red-50 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-2 rounded">{success}</div>}

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">Upload CV (PDF)</label>
<input
  type="file"
  accept=".pdf"
  onChange={(e) => setCvFile(e.target.files[0])}
  required
  className="w-full border border-gray-300 rounded-md p-2"
/>
        <p className="text-xs text-gray-500 mt-1">Upload your CV as a PDF file</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the company why you're interested in this role..."
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  )
}