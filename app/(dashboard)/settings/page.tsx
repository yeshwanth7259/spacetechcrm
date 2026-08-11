import { getCompanySettings } from '@/app/actions/settings'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const settings = await getCompanySettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your company profile and quotation preferences.</p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  )
}
