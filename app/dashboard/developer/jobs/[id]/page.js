import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { notFound } from "next/navigation"
import ApplyJobForm from "../../ApplyJobForm"

export async function generateMetadata({ params }) {
  const { id } = await params  // ✅ await params correctement
  
  const jobId = parseInt(id, 10)  // ✅ utiliser id, pas params?.id
  if (!jobId) {
    return {
      title: "Job Not Found",
      description: "This job listing could not be found",
    }
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { name: true } } },
  })

  if (!job) {
    return {
      title: "Job Not Found",
      description: "This job listing could not be found",
    }
  }

  return {
    title: `${job.title} at ${job.company.name}`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: job.description.substring(0, 160),
      type: "website",
    },
  }
}

export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    select: { id: true },
    take: 100,
  })
  return jobs.map((job) => ({ id: job.id.toString() }))
}

export default async function JobDetailPage({ params }) {
  const { id } = await params  // ✅ await params ici aussi

  const session = await getServerSession(authOptions)
  const jobId = parseInt(id, 10)  // ✅ utiliser id, pas params?.id

  if (!jobId) {
    notFound()
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      applications: {
        where: session?.user?.id ? { developer: { userId: parseInt(session.user.id, 10) } } : {},
      },
    },
  })

  if (!job) {
    notFound()
  }

  const hasApplied = job.applications.length > 0

  return (
    <div className="space-y-6">
      <a href="/dashboard/developer" className="text-blue-600 hover:underline">
        ← Back to Job Listings
      </a>

      <div className="bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            {job.company.logo && (
              <img src={job.company.logo} alt={job.company.name} className="h-16 w-auto mb-4" />
            )}
            <h2 className="text-xl text-gray-700 mb-4">{job.company.name}</h2>
          </div>
          <div className="text-right">
            {job.salary && (
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${job.salary.toLocaleString()}
              </div>
            )}
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Type:</strong> {job.type.replace("_", " ")}</p>
              <p><strong>Location:</strong> {job.location}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Job Description</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {job.company.description && (
          <div className="border-t mt-6 pt-6">
            <h3 className="text-lg font-semibold mb-3">About {job.company.name}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.company.description}</p>
          </div>
        )}
      </div>

      <ApplyJobForm jobId={job.id} hasApplied={hasApplied} />
    </div>
  )
}