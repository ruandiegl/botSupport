import { useState } from "react";
import { Plus, LayoutDashboard, Pencil, Trash2, FileText, RefreshCw } from "lucide-react";
import type { Department } from "@/types";
import {
  useListDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./hooks/use-departments";

export default function DepartmentAdmin() {
  const { data: departments, isLoading, isError, refetch } = useListDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const [selected, setSelected] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

  const save = () => {
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

    const done = () => {
      startCreate();
    };

    if (selected) {
      update.mutate({ id: selected.id, data }, { onSuccess: done });
    } else {
      create.mutate({ data }, { onSuccess: done });
    }
  };

  const deleteItem = (item: Department) => {
    if (window.confirm(`Remover o departamento ${item.name}?`)) {
      remove.mutate({ id: item.id });
    }
  };

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Administração / estrutura</div>
          <h1>Departamentos</h1>
          <p className="subtle" style={{ marginTop: 9 }}>
            Organize a fila e deixe os procedimentos à mão de quem atende.
          </p>
        </div>
        <button
          className="btn btn-accent"
          onClick={startCreate}
          data-testid="button-new-department"
        >
          <Plus size={15} /> Novo departamento
        </button>
      </div>

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
              <button className="btn btn-muted" onClick={() => refetch()}>
                Tentar novamente
              </button>
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
                        <button
                          className="btn btn-ghost"
                          onClick={() => startEdit(item)}
                          data-testid={`button-edit-department-${item.id}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => deleteItem(item)}
                          data-testid={`button-delete-department-${item.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
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
              <input
                id="department-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Suporte técnico"
                data-testid="input-department-name"
              />
            </div>
            <div className="field">
              <label htmlFor="department-description">Descrição</label>
              <textarea
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
              <button
                className="btn btn-muted"
                onClick={startCreate}
                data-testid="button-clear-department"
              >
                Limpar
              </button>
              <button
                className="btn btn-primary"
                disabled={!name.trim() || create.isPending || update.isPending}
                onClick={save}
                data-testid="button-save-department"
              >
                {create.isPending || update.isPending ? "Salvando..." : "Salvar departamento"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
