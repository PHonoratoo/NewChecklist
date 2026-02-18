"use client"

import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import ChecklistEnhanced from "@/components/checklist-enhanced"

const GroupsManager = dynamic(
  () => import("@/components/groups-manager"),
  { loading: () => <div className="h-20 animate-pulse bg-muted rounded" /> }
)

const PreferencesPanel = dynamic(
  () => import("@/components/preferences-panel"),
  { loading: () => null }
)

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
          <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded" />}>
            <GroupsManager
              onGroupSelect={setSelectedGroupId}
              selectedGroupId={selectedGroupId}
            />
          </Suspense>
          <ChecklistEnhanced userId={userId} groupId={selectedGroupId} />
        </div>
      </main>

      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}
    </div>
  )
}
