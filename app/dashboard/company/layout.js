export default function CompanyDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Company Dashboard</h2>
          </div>
          <nav className="mt-6">
            <a
              href="/dashboard/company"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Jobs
            </a>
            <a
              href="/dashboard/company/profile"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Profile
            </a>
          </nav>
        </div>

        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}