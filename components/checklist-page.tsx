"use client"

import { useState } from "react"
import Header from "@/components/header"
import ChecklistEnhanced from "@/components/checklist-enhanced"
import GroupsManager from "@/components/groups-manager"
import PreferencesPanel from "@/components/preferences-panel"

export default function ChecklistPage({
  userId,
  email,
}: {
  userId: string
  email: string
}) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header email={email} onSettingsClick={() => setShowPreferences(true)} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="space-y-6">
          <GroupsManager
            onGroupSelect={setSelectedGroupId}
            selectedGroupId={selectedGroupId}
          />
          <ChecklistEnhanced userId={userId} groupId={selectedGroupId} />
        </div>
      </main>

      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}
    </div>
  )
}
