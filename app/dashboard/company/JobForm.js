"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { jobSchema } from "@/lib/validation"

export default function JobForm({ action, initialData = {}, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      await action(formData)
      reset()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register("title")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            {...register("location")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Salary (optional)</label>
          <input
            type="number"
            {...register("salary", { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.salary && <p className="text-red-500 text-sm">{errors.salary.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            {...register("type")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="REMOTE">Remote</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Job"}
      </button>
    </form>
  )
}