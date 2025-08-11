import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function Header() {
  const user = await getSessionUser();
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">Reach Rocket</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          {user ? (
            <form action={logout}>
              <button className="border px-2 py-1 rounded">Logout</button>
            </form>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

async function logout() {
  "use server";
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/logout`, { method: "POST" });
}


