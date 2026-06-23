import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import type { UserInterface } from "@/models/User";

const PARENT_NOT_FOUND_MESSAGE =
  "No parent account found for this email. Create the parent in Dashboard → Parents first.";

export async function requireAdminUser(): Promise<
  | { ok: true; user: UserInterface }
  | { ok: false; status: number; error: string }
> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const user = await UserRepository.findByEmail(session.user.email);
  if (!user || user.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, user };
}

export async function resolveParentByEmail(email: string): Promise<
  | {
      ok: true;
      parent: UserInterface;
      parentName: string;
    }
  | { ok: false; status: number; error: string }
> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, status: 400, error: "Parent email is required" };
  }

  const parent = await UserRepository.findByEmail(trimmed);
  if (!parent?._id || parent.role !== "parent") {
    return { ok: false, status: 404, error: PARENT_NOT_FOUND_MESSAGE };
  }

  return {
    ok: true,
    parent,
    parentName: parent.userData?.user?.name?.trim() || trimmed,
  };
}
