export default function DeveloperDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Developer Dashboard</h2>
          </div>
          <nav className="mt-6">
            <a
              href="/dashboard/developer"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Browse Jobs
            </a>
            <a
              href="/dashboard/developer/applications"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              My Applications
            </a>
            <a
              href="/dashboard/developer/profile"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Profile
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}