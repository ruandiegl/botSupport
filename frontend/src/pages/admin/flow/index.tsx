import { useState } from "react";
import { Bot, Check, Pencil, RefreshCw } from "lucide-react";
import type { FlowDefinition } from "@/types";
import { useGetFlow, useListDepartments, useUpdateFlow } from "./hooks/use-flow";

export default function FlowAdmin() {
  const { data: flow, isLoading, isError, refetch } = useGetFlow();
  const { data: departments } = useListDepartments();
  const update = useUpdateFlow();

  const [draft, setDraft] = useState<FlowDefinition | null>(null);

  const current = draft || flow;

  const updateField = (field: keyof FlowDefinition, value: string) => {
    if (!current) return;
    setDraft({ ...current, [field]: value });
  };

  const updateOption = (index: number, field: string, value: string) => {
    if (!current) return;
    const options = current.options.map((item, optionIndex) =>
      optionIndex === index ? { ...item, [field]: value } : item
    );
    setDraft({ ...current, options });
  };

  const save = () => {
    if (!current) return;
    update.mutate(
      {
        data: {
          name: current.name,
          greeting: current.greeting,
          menuMessage: current.menuMessage,
          options: current.options,
        },
      },
      {
        onSuccess: () => {
          setDraft(null);
        },
      }
    );
  };

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Administração / automação</div>
          <h1>Fluxo do bot</h1>
          <p className="subtle" style={{ marginTop: 9 }}>
            Ajuste a primeira conversa antes que ela chegue à equipe.
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!current || update.isPending}
          onClick={save}
          data-testid="button-save-flow"
        >
          <Check size={15} /> {update.isPending ? "Publicando..." : "Publicar alterações"}
        </button>
      </div>

      {isLoading ? (
        <div className="panel loading">
          <div className="skeleton short" />
          <div className="skeleton" />
        </div>
      ) : isError ? (
        <div className="panel error-state">
          <RefreshCw size={24} />
          <p>Falha ao carregar fluxo.</p>
          <button className="btn btn-muted" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      ) : current ? (
        <div className="admin-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Bot size={17} />
                <h2>Mapa da conversa</h2>
              </div>
              <span className="subtle">versão publicada</span>
            </div>
            <div className="flow-canvas">
              <div className="flow-node">
                <div className="flow-node-head">
                  <h3>Boas-vindas</h3>
                  <span>Entrada</span>
                </div>
                <p>{current.greeting}</p>
              </div>

              <div className="flow-arrow">↓</div>

              <div className="flow-node highlight">
                <div className="flow-node-head">
                  <h3>Menu principal</h3>
                  <span>Decisão</span>
                </div>
                <p>{current.menuMessage}</p>
              </div>

              {current.options?.map((option, index) => (
                <div key={`${option.label}-${index}`}>
                  <div className="flow-arrow">↓</div>
                  <div className="flow-node">
                    <div className="flow-node-head">
                      <h3>{option.label}</h3>
                      <span>Rota {index + 1}</span>
                    </div>
                    <p>{option.procedureMessage}</p>
                    <div style={{ marginTop: 10 }}>
                      <span className="tag">
                        {departments?.find((item) => item.id === option.departmentId)?.name ||
                          option.departmentId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Pencil size={17} />
                <h2>Editar mensagens</h2>
              </div>
            </div>

            <div className="form-stack">
              <div className="field">
                <label htmlFor="flow-name">Nome do fluxo</label>
                <input
                  id="flow-name"
                  value={current.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  data-testid="input-flow-name"
                />
              </div>

              <div className="field">
                <label htmlFor="flow-greeting">Saudação</label>
                <textarea
                  id="flow-greeting"
                  value={current.greeting}
                  onChange={(event) => updateField("greeting", event.target.value)}
                  data-testid="textarea-flow-greeting"
                />
              </div>

              <div className="field">
                <label htmlFor="flow-menu">Mensagem do menu</label>
                <textarea
                  id="flow-menu"
                  value={current.menuMessage}
                  onChange={(event) => updateField("menuMessage", event.target.value)}
                  data-testid="textarea-flow-menu"
                />
              </div>

              <div className="detail-label" style={{ marginBottom: -4 }}>
                Opções e roteamento
              </div>
              {current.options?.map((option, index) => (
                <div className="option-row" key={`${option.label}-${index}`}>
                  <input
                    value={option.label}
                    onChange={(event) => updateOption(index, "label", event.target.value)}
                    placeholder="Opção"
                    data-testid={`input-flow-option-label-${index}`}
                  />
                  <select
                    value={option.departmentId}
                    onChange={(event) => updateOption(index, "departmentId", event.target.value)}
                    data-testid={`select-flow-option-department-${index}`}
                  >
                    <option value="">Departamento</option>
                    {(departments || []).map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={option.procedureMessage}
                    onChange={(event) => updateOption(index, "procedureMessage", event.target.value)}
                    placeholder="Mensagem de encaminhamento"
                    data-testid={`input-flow-option-message-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
