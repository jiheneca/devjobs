import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import CompanyProfileForm from "../CompanyProfileForm"

export default async function EditCompanyProfilePage() {
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
      <h1 className="text-3xl font-bold text-gray-900">Edit Company Profile</h1>

      <CompanyProfileForm company={company} />

      <a
        href="/dashboard/company/profile"
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Back to Profile
      </a>
    </div>
  )
}