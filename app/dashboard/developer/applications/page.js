import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"

export default async function MyApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "DEVELOPER") {
    redirect("/auth/signin")
  }

  const developer = await prisma.developer.findUnique({
    where: { userId: parseInt(session.user.id) },
    include: {
      applications: {
        include: {
          job: {
            include: {
              company: {
                select: { name: true, logo: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!developer) {
    redirect("/complete-profile/developer")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>

      {developer.applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p>You haven't applied to any jobs yet.</p>
          <a href="/dashboard/developer" className="text-blue-600 hover:underline mt-2 block">
            Browse jobs →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {developer.applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <a
                    href={`/dashboard/developer/jobs/${app.job.id}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {app.job.title}
                  </a>
                  <p className="text-gray-600 mt-1">{app.job.company.name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {app.job.company.logo && (
                    <img src={app.job.company.logo} alt={app.job.company.name} className="h-12 w-auto" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}