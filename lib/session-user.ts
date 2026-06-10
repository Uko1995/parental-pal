import type { Session } from "next-auth";
import { UserRepository } from "@/lib/UserRepository";
import { UserInterface } from "@/models/User";

/** Resolve the DB user from session — prefers stable user id over email. */
export async function getSessionUser(
  session: Session | null,
): Promise<UserInterface | null> {
  if (!session?.user) return null;

  if (session.user.id) {
    const byId = await UserRepository.findById(session.user.id);
    if (byId) return byId;
  }

  if (session.user.email) {
    return UserRepository.findByEmail(session.user.email);
  }

  return null;
}
