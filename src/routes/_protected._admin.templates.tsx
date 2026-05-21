import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { TemplatesList } from "@/features/templates/components/TemplatesList";
import { TemplateFormSheet } from "@/features/templates/components/TemplateFormSheet";
import { DeleteTemplateDialog } from "@/features/templates/components/DeleteTemplateDialog";
import { GenerateInstancesDialog } from "@/features/templates/components/GenerateInstancesDialog";
import { useSchedulingConfig } from "@/features/scheduling/hooks/useSchedulingConfig";
import type { TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { adminOrgId } = useRole();
  const { templates, setTemplates, loading, error } = useTemplates(adminOrgId);
  const { config: schedulingConfig } = useSchedulingConfig(adminOrgId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TripTemplate | null>(null);
  const [deleting, setDeleting] = useState<TripTemplate | null>(null);
  const [generating, setGenerating] = useState<TripTemplate | null>(null);

  const hasTemplates = (templates?.length ?? 0) > 0;

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(tpl: TripTemplate) {
    setEditing(tpl);
    setSheetOpen(true);
  }

  return (
    <AppShell
      title="Templates"
      back
      action={
        hasTemplates ? (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Novo
          </button>
        ) : null
      }
    >
      {loading ? (
        <LoadingList count={3} height="h-20" />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <TemplatesList
          templates={templates ?? []}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={setDeleting}
          onGenerate={setGenerating}
        />
      )}

      <TemplateFormSheet
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) setEditing(null);
        }}
        orgId={adminOrgId}
        editing={editing}
        onCreated={(tpl) => setTemplates((prev) => [tpl, ...(prev ?? [])])}
        onUpdated={(tpl) =>
          setTemplates((prev) => prev?.map((t) => (t.id === tpl.id ? tpl : t)) ?? null)
        }
      />

      <DeleteTemplateDialog
        template={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(tpl) => setTemplates((prev) => prev?.filter((t) => t.id !== tpl.id) ?? null)}
      />

      <GenerateInstancesDialog
        template={generating}
        defaultDaysAhead={schedulingConfig?.daysAhead}
        onClose={() => setGenerating(null)}
      />
    </AppShell>
  );
}
