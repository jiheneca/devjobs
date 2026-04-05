"use client"

import { useState } from "react"
import JobForm from "./JobForm"

export default function JobsTable({ jobs, onDelete, onUpdate }) {
  const [editingJob, setEditingJob] = useState(null)

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await onDelete(id)
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const handleUpdate = async (id, formData) => {
    try {
      await onUpdate(id, formData)
      setEditingJob(null)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs created yet.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-gray-600">{job.location} • {job.type.replace("_", " ")}</p>
                {job.salary && <p className="text-green-600 font-medium">${job.salary}</p>}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingJob(job)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{job.description}</p>

            <div className="mb-4">
              <h4 className="font-medium">Applications ({job.applications.length})</h4>
              {job.applications.length === 0 ? (
                <p className="text-gray-500 text-sm">No applications yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {job.applications.map((app) => (
                    <div key={app.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center space-x-3">
                        <img
                          src={app.developer.user.image || "/default-avatar.png"}
                          alt={app.developer.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{app.developer.user.name}</p>
                          <p className="text-sm text-gray-500">
                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {app.message && <p className="text-sm mt-2">{app.message}</p>}
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View CV
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editingJob && editingJob.id === job.id && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Edit Job</h4>
                <JobForm
                  action={(formData) => handleUpdate(job.id, formData)}
                  initialData={job}
                  onSuccess={() => setEditingJob(null)}
                />
                <button
                  onClick={() => setEditingJob(null)}
                  className="mt-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}