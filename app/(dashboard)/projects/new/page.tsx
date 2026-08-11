import { getClients } from '@/app/actions/clients'
import NewProjectPage from '@/components/projects/new-project-form'

export default async function Page() {
  const clients = await getClients()
  return <NewProjectPage clients={clients} />
}
