import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import DeveloperProfileForm from "../DeveloperProfileForm"

export default async function EditDeveloperProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "DEVELOPER") {
    redirect("/auth/signin")
  }

  const developer = await prisma.developer.findUnique({
    where: { userId: parseInt(session.user.id) },
    include: {
      user: true,
    },
  })

  if (!developer) {
    redirect("/complete-profile/developer")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Developer Profile</h1>

      <DeveloperProfileForm developer={developer} />

      <a
        href="/dashboard/developer/profile"
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Back to Profile
      </a>
    </div>
  )
}