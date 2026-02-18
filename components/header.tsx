"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, LogOut, Settings } from "lucide-react"

export default function Header({
  email,
  onSettingsClick,
}: {
  email?: string
  onSettingsClick?: () => void
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="border-b bg-card sticky top-0 z-40 backdrop-blur-sm bg-card/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClipboardCheck className="h-4 w-4" />
          </div> 
          <span className="text-lg font-semibold">Checklist</span>
        </div>
        <div className="flex items-center gap-2">
          {email && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="gap-1.5"
            title="Preferências"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only text-xs">Preferências</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only text-xs">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
