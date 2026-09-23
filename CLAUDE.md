# CLAUDE.md — thryve-rise

Thryve quoting tool. Next.js app on Supabase. Owner: Nic Barbagallo.

## Two machines (effective 2026-09-23)

Nic works this repo from two Macs: the Mac Studio (office) and the MacBook Pro (home and travel). Git is the only sync layer between them. Nothing else is synced.

- Start of every session: `git fetch && git status`. If the branch is behind, pull before the first edit.
- End of every session, no exceptions: commit and push the working branch. Uncommitted or unpushed work on one machine does not exist on the other.
- Never leave a session with a dirty tree or unpushed commits. If the work is not ready for its target branch, push it to a `wip/` branch and say so.
- `.env*` files are not in git. If you change one, tell Nic explicitly so he updates the other machine and the password-manager copy.
- `node_modules`, `.next`, `.wrangler/state` and similar local state are per machine. Never sync them, never assume they match.
