import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"

export default async function DeveloperProfilePage() {
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
      <h1 className="text-3xl font-bold text-gray-900">Developer Profile</h1>

      <div className="bg-white p-8 rounded-lg shadow">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Name</h3>
            <p className="text-lg font-medium text-gray-900">{developer.user.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Email</h3>
            <p className="text-lg font-medium text-gray-900">{developer.user.email}</p>
          </div>
          {developer.image && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500">Profile Image</h3>
              <img src={developer.image} alt="Profile" className="h-24 w-24 rounded-lg mt-2" />
            </div>
          )}
          {developer.about && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500">About</h3>
              <p className="text-gray-700 mt-2">{developer.about}</p>
            </div>
          )}
        </div>
      </div>

      <a
        href="/dashboard/developer/profile/edit"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700"
      >
        Edit Profile
      </a>
    </div>
  )
}