import { useState } from "react";
import { Plus, LayoutDashboard, Pencil, Trash2, FileText, RefreshCw } from "lucide-react";
import type { Department } from "@/types";
import {
  useListDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./hooks/use-departments";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function DepartmentAdmin() {
  const { data: departments, isLoading, isError, refetch } = useListDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const [selected, setSelected] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const startCreate = () => {
    setSelected(null);
    setName("");
    setDescription("");
  };

  const startEdit = (item: Department) => {
    setSelected(item);
    setName(item.name);
    setDescription(item.description || "");
  };

  const save = async () => {
    const data = {
      name,
      description,
      procedures:
        selected?.procedures?.map((item) => ({
          title: item.title,
          content: item.content,
          order: item.order,
        })) || [],
    };

    if (selected) {
      await update.mutateAsync({ id: selected.id, data });
    } else {
      await create.mutateAsync({ data });
    }
    startCreate();
  };

  const deleteItem = (item: Department) => {
    setDeleteTarget(item);
  };

  return (
    <div className="content">
      <PageHeader
        eyebrow="Administração / estrutura"
        title="Departamentos"
        description="Organize a fila e deixe os procedimentos à mão de quem atende."
        action={<Button
          variant="default"
          size="lg"
          onClick={startCreate}
          data-testid="button-new-department"
        >
          <Plus size={15} /> Novo departamento
        </Button>}
      />

      <div className="admin-grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <LayoutDashboard size={17} />
              <h2>Departamentos ativos</h2>
            </div>
            <span className="subtle">{(departments || []).length} cadastrados</span>
          </div>

          {isLoading ? (
            <div className="panel loading">
              <div className="skeleton short" />
              <div className="skeleton" />
            </div>
          ) : isError ? (
            <div className="panel error-state">
              <RefreshCw size={24} />
              <p>Falha ao carregar departamentos.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Em aberto</th>
                  <th>Procedimentos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {departments?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="subtle">{item.description || "Sem descrição"}</div>
                    </td>
                    <td>
                      <span className="tag">{item.openCount}</span>
                    </td>
                    <td>{item.procedures?.length || 0} rotinas</td>
                    <td>
                      <div className="row-actions">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(item)}
                          data-testid={`button-edit-department-${item.id}`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteItem(item)}
                          data-testid={`button-delete-department-${item.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileText size={17} />
              <h2>{selected ? "Editar departamento" : "Novo departamento"}</h2>
            </div>
          </div>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="department-name">Nome</label>
              <Input
                id="department-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Suporte técnico"
                data-testid="input-department-name"
              />
            </div>
            <div className="field">
              <label htmlFor="department-description">Descrição</label>
              <Textarea
                id="department-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Para que este departamento existe?"
                data-testid="textarea-department-description"
              />
            </div>

            {selected?.procedures?.length ? (
              <div>
                <div className="detail-label">Procedimentos cadastrados</div>
                <div className="procedure-list">
                  {selected.procedures.map((item) => (
                    <div className="procedure" key={item.id}>
                      <div className="procedure-title">{item.title}</div>
                      <p>{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="form-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={startCreate}
                data-testid="button-clear-department"
              >
                Limpar
              </Button>
              <Button
                variant="default"
                size="lg"
                disabled={!name.trim() || create.isPending || update.isPending}
                onClick={() => setSaveConfirmOpen(true)}
                data-testid="button-save-department"
              >
                {create.isPending || update.isPending ? "Salvando..." : "Salvar departamento"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        tone="warning"
        title={selected ? "Salvar alterações do departamento?" : "Criar este departamento?"}
        description="Revise os dados antes de aplicar esta alteração à estrutura de atendimento."
        confirmLabel={selected ? "Salvar alterações" : "Criar departamento"}
        details={<strong>{name.trim()}</strong>}
        onConfirm={save}
        testId="button-confirm-save-department"
      />
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tone="danger"
        title="Excluir departamento?"
        description="Esta ação pode afetar atendentes e conversas vinculadas e não deve ser realizada sem revisão."
        confirmLabel="Excluir departamento"
        details={<strong>{deleteTarget?.name}</strong>}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove.mutateAsync({ id: deleteTarget.id });
          setDeleteTarget(null);
        }}
        testId="button-confirm-delete-department"
      />
    </div>
  );
}
