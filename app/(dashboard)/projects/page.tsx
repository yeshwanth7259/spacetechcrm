import { getProjects } from '@/app/actions/projects'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your assigned projects.</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">Target Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects?.map(project => (
              <tr key={project.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4">
                  {/* @ts-ignore */}
                  {project.clients?.company_name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}</td>
                <td className="px-6 py-4 text-gray-500">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}</td>
              </tr>
            ))}
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by assigning a project to a client.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
