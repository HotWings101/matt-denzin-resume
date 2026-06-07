import { LogOut } from "lucide-react";

/** Posts to the logout route handler. Works without client JS. */
export function SignOutButton() {
  return (
    <form action="/admin/logout" method="post">
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </form>
  );
}
