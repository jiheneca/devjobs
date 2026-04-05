import { prisma } from "@/app/lib/prisma"

export default async function JobsPage({ searchParams }) {
  const search = searchParams?.search || ""
  const minSalary = searchParams?.minSalary ? parseInt(searchParams.minSalary) : null
  const maxSalary = searchParams?.maxSalary ? parseInt(searchParams.maxSalary) : null
  const type = searchParams?.type || ""

  const filters = {
    where: {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
      ...(minSalary || maxSalary) && {
        salary: {
          ...(minSalary && { gte: minSalary }),
          ...(maxSalary && { lte: maxSalary }),
        },
      },
    },
    include: {
      company: {
        select: { name: true, logo: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }

  const jobs = await prisma.job.findMany(filters)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Listings</h1>

        {/* Search & Filter */}
        <form className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search by Title</label>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="e.g. Frontend Developer"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Salary</label>
              <input
                name="minSalary"
                type="number"
                defaultValue={minSalary || ""}
                placeholder="Min"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Salary</label>
              <input
                name="maxSalary"
                type="number"
                defaultValue={maxSalary || ""}
                placeholder="Max"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type</label>
              <select
                name="type"
                defaultValue={type}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {/* Jobs Grid */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No jobs found</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <a href={`/jobs/${job.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                      {job.title}
                    </a>
                    <p className="text-gray-600 mt-1">{job.description.substring(0, 150)}...</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{job.type.replace("_", " ")}</span>
                      {job.salary && <span className="text-green-600 font-medium">${job.salary.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {job.company.logo && (
                      <img src={job.company.logo} alt={job.company.name} className="h-12 w-auto mb-2" />
                    )}
                    <p className="font-semibold">{job.company.name}</p>
                    <p className="text-xs text-gray-500 mt-2">{job._count.applications} applications</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}