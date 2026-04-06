import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import { createJob, updateJob, deleteJob } from "./actions"
import JobForm from "./JobForm"
import JobsTable from "./JobsTable"

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "COMPANY") {
    redirect("/auth/signin")
  }

  const company = await prisma.company.findUnique({
    where: { userId: Number(session.user.id) },
  })

  if (!company) {
    redirect("/complete-profile/company")
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      applications: {
        include: {
          developer: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const totalJobs = jobs.length
  const totalApplications = jobs.reduce((sum, job) => sum + job.applications.length, 0)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">{totalJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
          <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Avg Applications per Job</h3>
          <p className="text-3xl font-bold text-purple-600">
            {totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Create New Job</h2>
        <JobForm action={createJob} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Your Jobs</h2>
        <JobsTable jobs={jobs} onDelete={deleteJob} onUpdate={updateJob} />
      </div>
    </div>
  )
}