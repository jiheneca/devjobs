import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"

export default async function CompanyProfilePage() {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Name</h2>
            <p className="text-lg font-medium text-gray-900">{company.name}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Logo</h2>
            {company.logo ? (
              <img src={company.logo} alt={`${company.name} logo`} className="h-20 w-auto rounded-md border" />
            ) : (
              <p className="text-gray-500">No logo provided</p>
            )}
          </div>
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500">Description</h2>
            <p className="text-gray-700">{company.description || "No description provided."}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <a
          href="/dashboard/company/profile/edit"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit Company Profile
        </a>
        <a
          href="/dashboard/company"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}