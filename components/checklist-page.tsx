"use client"

import Header from "@/components/header"
import Checklist from "@/components/checklist"

export default function ChecklistPage({
  userId,
  email,
}: {
  userId: string
  email: string
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header email={email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Checklist userId={userId} />
      </main>
    </div>
  )
}
