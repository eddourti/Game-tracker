import { useEffect } from "react";
import SidebarContent from "./SidebarContent";

export default function MobileDrawer({
  open,
  onClose,
  statusFilter,
  setStatusFilter,
  counts,
  onOpenBackup,
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-900 border-r border-ink-600 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-3 w-8 h-8 rounded-full bg-ink-800 text-mist-200 hover:text-mist-50 flex items-center justify-center text-sm z-10"
          aria-label="Close menu"
        >
          ✕
        </button>
        <SidebarContent
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          counts={counts}
          onOpenBackup={onOpenBackup}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}
