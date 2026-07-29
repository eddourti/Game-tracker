import SidebarContent from "./SidebarContent";

export default function Sidebar({ statusFilter, setStatusFilter, counts, onOpenBackup }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-ink-900 border-r border-ink-600 min-h-full">
      <SidebarContent
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onOpenBackup={onOpenBackup}
      />
    </aside>
  );
}
