import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { useRole } from "@/lib/role-context";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { TemplatesList } from "@/features/templates/components/TemplatesList";
import { TemplateFormSheet } from "@/features/templates/components/TemplateFormSheet";
import { DeleteTemplateDialog } from "@/features/templates/components/DeleteTemplateDialog";
import type { TripTemplate } from "@/lib/types";

export const Route = createFileRoute("/_protected/_admin/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { adminOrgId } = useRole();
  const { templates, setTemplates, loading, error } = useTemplates(adminOrgId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TripTemplate | null>(null);
  const [deleting, setDeleting] = useState<TripTemplate | null>(null);

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
    <AppShell title="Templates" back>
      {hasTemplates && (
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Novo template
          </Button>
        </div>
      )}

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
        onDeleted={(tpl) =>
          setTemplates((prev) => prev?.filter((t) => t.id !== tpl.id) ?? null)
        }
      />
    </AppShell>
  );
}
