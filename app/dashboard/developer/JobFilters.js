"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function JobFilters({ initialSearch, initialMinSalary, initialType }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch || "")
  const [minSalary, setMinSalary] = useState(initialMinSalary || "")
  const [type, setType] = useState(initialType || "")

  const updateParams = useCallback(
    (newValues) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newValues).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams({ search, minSalary })
    }, 400)
    return () => clearTimeout(timeout)
  }, [search, minSalary])

  const handleTypeChange = (e) => {
    const value = e.target.value
    setType(value)
    updateParams({ search, minSalary, type: value })
  }

  const handleSalaryChange = (e) => {
    const value = e.target.value
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setMinSalary(value)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Search by Title</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Salary ($)</label>
          <input
            type="number"
            value={minSalary}
            onChange={handleSalaryChange}
            placeholder="e.g. 50000"
            min="0"
            step="1000"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>
      </div>
    </div>
  )
}