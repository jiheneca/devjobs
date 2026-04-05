import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import JobFilters from "./JobFilters"

export default async function DeveloperDashboard({ searchParams }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "DEVELOPER") {
    redirect("/auth/signin")
  }

  const developer = await prisma.developer.findUnique({
    where: { userId: parseInt(session.user.id) },
  })

  if (!developer) {
    redirect("/complete-profile/developer")
  }

  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams?.search || ""
  const minSalary = resolvedSearchParams?.minSalary ? parseInt(resolvedSearchParams.minSalary, 10) : null
  const type = resolvedSearchParams?.type || ""

  const jobs = await prisma.job.findMany({
    where: {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
      // Fix: salary field must be an Int in Prisma — use Number() and guard against NaN
      ...(minSalary !== null && !isNaN(minSalary) && {
        salary: { gte: minSalary },
      }),
    },
    include: {
      company: {
        select: { name: true, logo: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { id: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>

      {/* Search & Filter — client component, no submit button needed */}
      <JobFilters
        initialSearch={search}
        initialMinSalary={minSalary ? String(minSalary) : ""}
        initialType={type}
      />

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <a
                    href={`/dashboard/developer/jobs/${job.id}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {job.title}
                  </a>
                  <p className="text-gray-600 mt-1">{job.description.substring(0, 150)}...</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {job.type.replace(/_/g, " ")}
                    </span>
                    {job.salary && (
                      <span className="text-green-600 font-medium">
                        ${job.salary.toLocaleString()}
                      </span>
                    )}
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
  )
}