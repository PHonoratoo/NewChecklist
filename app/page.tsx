import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ChecklistPage from "@/components/checklist-page"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ChecklistPage userId={user.id} email={user.email ?? ""} />
}
