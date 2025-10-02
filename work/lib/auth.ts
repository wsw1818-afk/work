import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("인증이 필요합니다.")
  }

  return user
}
