"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Brand from "./Brand";
import { supabase } from "@/lib/supabase";
import {
  type Project,
  type Item,
  type Lead,
  demoProjects,
  demoItems,
  phases,
  date,
  money,
  done,
  label,
} from "@/lib/model";
const tabs = [
  ["resumo", "Visão geral"],
  ["obras", "Obras"],
  ["comercial", "CRM comercial"],
  ["fase", "Fases"],
  ["decisao", "Decisões"],
  ["reuniao", "Reuniões"],
  ["pagamento", "Pagamentos"],
  ["documento", "Documentos"],
  ["atualizacao", "Diário de obra"],
];
export default function Workspace({
  demo = false,
  portal = false,
}: {
  demo?: boolean;
  portal?: boolean;
}) {
  const [projects, setProjects] = useState<Project[]>(demo ? demoProjects : []),
    [items, setItems] = useState<Item[]>(demo ? demoItems : []),
    [leads, setLeads] = useState<Lead[]>([]),
    [selected, setSelected] = useState(demo ? "demo-1" : ""),
    [tab, setTab] = useState("resumo"),
    [clientView, setClientView] = useState(portal),
    [staff, setStaff] = useState(false),
    [organization, setOrganization] = useState(""),
    [loading, setLoading] = useState(!demo),
    [message, setMessage] = useState(""),
    [modal, setModal] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [response, setResponse] = useState("");
  async function load() {
    if (!supabase) return;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      window.location.assign("/acesso");
      return;
    }
    const m = await supabase
      .from("memberships")
      .select("organization_id,role")
      .eq("user_id", user.id);
    if (m.error) throw m.error;
    const member = m.data?.find((x) => ["admin", "staff"].includes(x.role));
    setStaff(!!member);
    setOrganization(member?.organization_id ?? "");
    if (!member) setClientView(true);
    const [p, i, l] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("work_items").select("*").order("position"),
      member
        ? supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (p.error || i.error || l.error) throw p.error ?? i.error ?? l.error;
    setProjects(p.data ?? []);
    setItems(i.data ?? []);
    setLeads(l.data ?? []);
    setSelected((old) =>
      p.data?.some((x) => x.id === old) ? old : (p.data?.[0]?.id ?? ""),
    );
  }
  useEffect(() => {
    if (demo) return;
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    void load()
      .catch(() => {
        if (active)
          setMessage(
            "Não foi possível carregar os dados. Verifique a ligação e as permissões.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setProjects([]);
        setItems([]);
        setLeads([]);
        window.location.assign("/acesso");
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [demo]);
  const canEdit = (demo || staff) && !clientView,
    project = projects.find((p) => p.id === selected),
    current = items.filter(
      (i) => i.project_id === selected && (!clientView || i.visible_to_client),
    ),
    phaseItems = current.filter((i) => i.kind === "fase"),
    progress = phaseItems.length
      ? Math.round(
          (100 * phaseItems.filter((i) => done(i.status)).length) /
            phaseItems.length,
        )
      : 0,
    payments = current.filter((i) => i.kind === "pagamento"),
    pending = current
      .filter(
        (i) =>
          ["decisao", "reuniao", "pagamento"].includes(i.kind) &&
          !done(i.status) &&
          i.status !== "recusado",
      )
      .sort((a, b) =>
        (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"),
      );
  async function mutate(task: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await task();
      if (!demo) await load();
      setModal("");
      setResponse("");
      setMessage(
        demo
          ? "Alteração aplicada apenas à demonstração."
          : "Alteração guardada.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  async function update(item: Item, status: string) {
    await mutate(async () => {
      if (demo) {
        setItems((old) =>
          old.map((i) => (i.id === item.id ? { ...i, status } : i)),
        );
        return;
      }
      const { data, error } = await supabase!
        .from("work_items")
        .update({ status })
        .eq("id", item.id)
        .select("id");
      if (error) throw error;
      if (!data?.length)
        throw new Error("Sem permissão para alterar este registo.");
    });
  }
  async function decide(item: Item, status: string) {
    await mutate(async () => {
      if (demo) {
        setItems((old) =>
          old.map((i) => (i.id === item.id ? { ...i, status, response } : i)),
        );
        return;
      }
      const { error } = await supabase!.rpc("respond_to_decision", {
        decision_id: item.id,
        answer: status,
        comment: response,
      });
      if (error) throw error;
    });
  }
  async function create(fd: FormData) {
    await mutate(async () => {
      if (modal === "obra") {
        const service = String(fd.get("service")) as keyof typeof phases;
        const p: Project = {
          id: demo ? crypto.randomUUID() : "",
          organization_id: organization,
          name: String(fd.get("name")).trim(),
          client_name: String(fd.get("client_name")).trim(),
          location: String(fd.get("location")).trim(),
          service,
          status: "pendente",
          budget: Number(fd.get("budget")),
          start_date: String(fd.get("start_date")) || null,
          end_date: String(fd.get("end_date")) || null,
        };
        if (p.start_date && p.end_date && p.end_date < p.start_date)
          throw new Error("A entrega deve ser posterior ao início.");
        if (demo) {
          setProjects((old) => [...old, p]);
          setItems((old) => [
            ...old,
            ...phases[service].map((title, position) => ({
              id: crypto.randomUUID(),
              project_id: p.id,
              kind: "fase",
              title,
              description: "",
              status: "pendente",
              due_date: null,
              amount: null,
              position,
              visible_to_client: true,
              response: null,
            })),
          ]);
          setSelected(p.id);
        } else {
          const { error, data } = await supabase!.rpc("create_project", {
            org_id: organization,
            project_name: p.name,
            customer_name: p.client_name,
            project_location: p.location,
            project_service: service,
            project_budget: p.budget,
            starts: p.start_date,
            ends: p.end_date,
            phase_titles: phases[service],
          });
          if (error) throw error;
          setSelected(data);
        }
        setTab("resumo");
        return;
      }
      if (modal === "lead") {
        const row = {
          organization_id: organization,
          name: String(fd.get("name")),
          email: String(fd.get("email")),
          phone: String(fd.get("phone")),
          service: String(fd.get("service")),
          message: String(fd.get("message")),
          stage: "novo",
        };
        if (demo)
          setLeads((old) => [
            ...old,
            {
              ...row,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
            },
          ]);
        else {
          const { error } = await supabase!.from("leads").insert(row);
          if (error) throw error;
        }
        return;
      }
      if (modal === "acesso") {
        const { error } = await supabase!.rpc("grant_project_access", {
          target_project: selected,
          customer_email: String(fd.get("email")).trim(),
        });
        if (error) throw error;
        return;
      }
      if (!project) throw new Error("Selecione uma obra.");
      const entry: Item = {
        id: demo ? crypto.randomUUID() : "",
        project_id: project.id,
        kind: modal,
        title: String(fd.get("title")).trim(),
        description: String(fd.get("description")),
        due_date: String(fd.get("due_date")) || null,
        amount: modal === "pagamento" ? Number(fd.get("amount")) : null,
        status: "pendente",
        position: current.length,
        visible_to_client: fd.get("visible") === "on",
        response: null,
      };
      if (demo) setItems((old) => [...old, entry]);
      else {
        const { id, ...row } = entry;
        const { error } = await supabase!.from("work_items").insert(row);
        if (error) throw error;
      }
    });
  }
  function itemCard(item: Item) {
    return (
      <article className="item-card" key={item.id}>
        <div className="item-top">
          <span className={"badge " + item.status}>{label(item.status)}</span>
          <span>{date(item.due_date)}</span>
        </div>
        <h3>{item.title}</h3>
        {item.description && <p className="prewrap">{item.description}</p>}
        {item.amount !== null && (
          <strong className="amount">{money(item.amount)}</strong>
        )}
        {item.response && (
          <p>
            <b>Resposta do cliente:</b> {item.response}
          </p>
        )}
        {!clientView && !item.visible_to_client && (
          <small>Visível apenas à equipa</small>
        )}
        {canEdit && (
          <label className="inline-label">
            Estado
            <select
              value={item.status}
              disabled={busy}
              onChange={(e) => void update(item, e.target.value)}
            >
              {(item.kind === "pagamento"
                ? ["pendente", "pago"]
                : item.kind === "decisao"
                  ? ["pendente"]
                  : ["pendente", "em_curso", "concluido"]
              )
                .concat(
                  item.kind === "decisao" && item.status !== "pendente"
                    ? [item.status]
                    : [],
                )
                .map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
            </select>
          </label>
        )}
        {clientView &&
          item.kind === "decisao" &&
          item.status === "pendente" && (
            <button
              className="secondary"
              onClick={() => {
                setResponse("");
                setModal("responder:" + item.id);
              }}
            >
              Responder à decisão
            </button>
          )}
      </article>
    );
  }
  if (loading) return <main className="loading">A carregar a sua área…</main>;
  if (!demo && !supabase)
    return (
      <main className="login">
        <Brand />
        <h1>A ligação está a ser preparada.</h1>
        <p>A base de dados da Precision Building ainda não está configurada.</p>
        <Link className="button" href="/demonstracao">
          Ver demonstração
        </Link>
      </main>
    );
  return (
    <div className="workspace">
      <aside>
        <Brand />
        <div className="workspace-label">
          {clientView ? "PORTAL DO CLIENTE" : "GESTÃO DA EMPRESA"}
        </div>
        <nav>
          {tabs
            .filter(
              ([id]) => !clientView || !["comercial", "obras"].includes(id),
            )
            .map(([id, title]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => {
                  setTab(id);
                  setQuery("");
                }}
              >
                <span className="nav-icon">
                  {
                    (
                      {
                        resumo: "◫",
                        obras: "▤",
                        comercial: "◈",
                        fase: "≡",
                        decisao: "◇",
                        reuniao: "◷",
                        pagamento: "€",
                        documento: "▱",
                        atualizacao: "⊞",
                      } as Record<string, string>
                    )[id]
                  }
                </span>
                {title}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          {(demo || staff) && (
            <button
              className="secondary"
              onClick={() => {
                setClientView(!clientView);
                setTab("resumo");
              }}
            >
              {clientView ? "Ver gestão interna" : "Ver portal do cliente"}
            </button>
          )}
          {!demo && (
            <button
              className="secondary"
              onClick={() => void supabase!.auth.signOut()}
            >
              Terminar sessão
            </button>
          )}
          <Link href="/">Website público</Link>
          <small>Precision Building · v0.1</small>
        </div>
      </aside>
      <div className="workspace-content">
        {demo && (
          <div className="demo-bar">
            DEMONSTRAÇÃO · Dados fictícios · Alterações temporárias
            <Link href="/acesso">Acesso real</Link>
          </div>
        )}
        <header className="workspace-header">
          <span>{clientView ? "A minha obra" : "Centro de operações"}</span>
          <label>
            Obra
            <select
              aria-label="Selecionar obra"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {!projects.length && <option value="">Sem obras</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main className="dashboard">
          <div className="page-title">
            <div>
              <div className="eyebrow">
                {project?.location ?? "PRECISION BUILDING"}
                {project ? " / " + project.service : ""}
              </div>
              <h1>
                {tab === "resumo"
                  ? clientView
                    ? "Acompanhe cada passo."
                    : "Tudo no seu lugar."
                  : tabs.find((t) => t[0] === tab)?.[1]}
              </h1>
              <p>
                {project
                  ? project.name + " · " + project.client_name
                  : "Crie a primeira obra para começar."}
              </p>
            </div>
            {canEdit && (
              <button
                disabled={busy}
                onClick={() =>
                  setModal(
                    tab === "comercial"
                      ? "lead"
                      : tab === "obras" || !project
                        ? "obra"
                        : tab === "resumo"
                          ? "decisao"
                          : tab,
                  )
                }
              >
                +{" "}
                {tab === "comercial"
                  ? "Novo contacto"
                  : tab === "obras" || !project
                    ? "Nova obra"
                    : tab === "resumo"
                      ? "Nova decisão"
                      : "Adicionar"}
              </button>
            )}
          </div>
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
          {canEdit && project && !demo && (
            <button className="text-link" onClick={() => setModal("acesso")}>
              Associar cliente à obra
            </button>
          )}
          {tab === "resumo" && (
            <>
              <div className="stats">
                <article>
                  <span>Progresso por fases</span>
                  <strong>
                    {progress}
                    <small>%</small>
                  </strong>
                  <progress max={100} value={progress} />
                </article>
                <article>
                  <span>
                    {clientView ? "A sua participação" : "Ações pendentes"}
                  </span>
                  <strong>{pending.length}</strong>
                  <small>Decisões, reuniões e pagamentos</small>
                </article>
                <article>
                  <span>Próxima entrega prevista</span>
                  <strong className="date-stat">
                    {date(project?.end_date ?? null)}
                  </strong>
                  <small>Calendário da obra</small>
                </article>
                <article>
                  <span>Pagamentos por realizar</span>
                  <strong className="date-stat">
                    {money(
                      payments
                        .filter((i) => i.status !== "pago")
                        .reduce((s, i) => s + (i.amount ?? 0), 0),
                    )}
                  </strong>
                  <small>Parcelas registadas</small>
                </article>
              </div>
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-title">
                    <h2>O que acontece a seguir</h2>
                    <span>{pending.length} ações</span>
                  </div>
                  {pending.length ? (
                    pending.slice(0, 5).map(itemCard)
                  ) : (
                    <p className="empty">Sem ações pendentes nesta obra.</p>
                  )}
                </section>
                <section className="panel">
                  <div className="panel-title">
                    <h2>Fases da obra</h2>
                    <button
                      className="text-link"
                      onClick={() => setTab("fase")}
                    >
                      Ver todas
                    </button>
                  </div>
                  <ol className="timeline">
                    {phaseItems.map((i) => (
                      <li key={i.id} className={i.status}>
                        <span className="phase-dot">
                          {done(i.status) ? "✓" : i.position + 1}
                        </span>
                        <div>
                          <b>{i.title}</b>
                          <small>
                            {label(i.status)} · {date(i.due_date)}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {!phaseItems.length && (
                    <p className="empty">Ainda não existem fases.</p>
                  )}
                </section>
              </div>
              <section className="panel">
                <h2>Últimas atualizações</h2>
                {current
                  .filter((i) => i.kind === "atualizacao")
                  .slice(-3)
                  .reverse()
                  .map(itemCard)}
                {!current.some((i) => i.kind === "atualizacao") && (
                  <p className="empty">
                    As atualizações da equipa aparecerão aqui.
                  </p>
                )}
              </section>
            </>
          )}
          {tab === "obras" && (
            <>
              <label>
                Pesquisar obras
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome, cliente ou local"
                />
              </label>
              <div className="cards">
                {projects
                  .filter((p) =>
                    (p.name + p.client_name + p.location)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <article className="item-card" key={p.id}>
                      <span className="badge">{p.service}</span>
                      <h2>{p.name}</h2>
                      <p>
                        {p.client_name} · {p.location}
                      </p>
                      <strong>{money(p.budget)}</strong>
                      <p>Entrega: {date(p.end_date)}</p>
                      <button
                        className="secondary"
                        onClick={() => {
                          setSelected(p.id);
                          setTab("resumo");
                        }}
                      >
                        Abrir obra
                      </button>
                    </article>
                  ))}
              </div>
            </>
          )}
          {tab === "comercial" && (
            <>
              <label>
                Pesquisar contactos
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nome ou email"
                />
              </label>
              <div className="pipeline">
                {[
                  "novo",
                  "contactado",
                  "visita",
                  "proposta",
                  "ganho",
                  "perdido",
                ].map((stage) => (
                  <section key={stage}>
                    <h2>
                      {label(stage)}{" "}
                      <small>
                        {leads.filter((l) => l.stage === stage).length}
                      </small>
                    </h2>
                    {leads
                      .filter(
                        (l) =>
                          l.stage === stage &&
                          (l.name + l.email)
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                      )
                      .map((l) => (
                        <article className="item-card" key={l.id}>
                          <h3>{l.name}</h3>
                          <p>{l.service}</p>
                          <a href={"mailto:" + l.email}>{l.email}</a>
                          <p>{l.phone}</p>
                          <p>{l.message}</p>
                          <label>
                            Etapa
                            <select
                              value={l.stage}
                              disabled={busy}
                              onChange={(e) => {
                                const next = e.target.value;
                                void mutate(async () => {
                                  if (demo)
                                    setLeads((old) =>
                                      old.map((x) =>
                                        x.id === l.id
                                          ? { ...x, stage: next }
                                          : x,
                                      ),
                                    );
                                  else {
                                    const { data, error } = await supabase!
                                      .from("leads")
                                      .update({ stage: next })
                                      .eq("id", l.id)
                                      .select("id");
                                    if (error) throw error;
                                    if (!data?.length)
                                      throw new Error("Sem permissão.");
                                  }
                                });
                              }}
                            >
                              {[
                                "novo",
                                "contactado",
                                "visita",
                                "proposta",
                                "ganho",
                                "perdido",
                              ].map((s) => (
                                <option key={s} value={s}>
                                  {label(s)}
                                </option>
                              ))}
                            </select>
                          </label>
                        </article>
                      ))}
                  </section>
                ))}
              </div>
              {!leads.length && (
                <p className="empty">
                  Ainda não existem contactos. Adicione o primeiro.
                </p>
              )}
            </>
          )}
          {!["resumo", "obras", "comercial"].includes(tab) && (
            <>
              <div className="cards">
                {current.filter((i) => i.kind === tab).map(itemCard)}
              </div>
              {!current.some((i) => i.kind === tab) && (
                <p className="empty">Ainda não existem registos nesta área.</p>
              )}
              {tab === "documento" && (
                <p className="muted">
                  Nesta versão os documentos são registados por título e
                  referência. O carregamento de ficheiros privados será
                  integrado após a ligação ao Supabase.
                </p>
              )}
            </>
          )}
        </main>
      </div>
      {modal && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="panel-title">
              <h2 id="modal-title">
                {modal.startsWith("responder:")
                  ? "Responder à decisão"
                  : modal === "obra"
                    ? "Nova obra"
                    : modal === "lead"
                      ? "Novo contacto"
                      : modal === "acesso"
                        ? "Dar acesso ao cliente"
                        : "Novo registo"}
              </h2>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => setModal("")}
              >
                Fechar
              </button>
            </div>
            {modal.startsWith("responder:") ? (
              <>
                <p>
                  {current.find((i) => i.id === modal.split(":")[1])?.title}
                </p>
                <label>
                  Observações
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    maxLength={4000}
                  />
                </label>
                <div className="actions">
                  <button
                    disabled={busy}
                    onClick={() =>
                      void decide(
                        current.find((i) => i.id === modal.split(":")[1])!,
                        "aprovado",
                      )
                    }
                  >
                    Aprovar
                  </button>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      void decide(
                        current.find((i) => i.id === modal.split(":")[1])!,
                        "recusado",
                      )
                    }
                  >
                    Pedir alteração
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void create(new FormData(e.currentTarget));
                }}
              >
                {modal === "obra" ? (
                  <>
                    <label>
                      Nome da obra
                      <input name="name" required maxLength={200} />
                    </label>
                    <label>
                      Nome do cliente
                      <input name="client_name" required maxLength={200} />
                    </label>
                    <label>
                      Local
                      <input name="location" required maxLength={200} />
                    </label>
                    <label>
                      Serviço
                      <select name="service">
                        <option>LSF</option>
                        <option>Reabilitação</option>
                        <option>Renovação</option>
                      </select>
                    </label>
                    <label>
                      Orçamento contratual (€)
                      <input
                        name="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        Início
                        <input name="start_date" type="date" />
                      </label>
                      <label>
                        Entrega prevista
                        <input name="end_date" type="date" />
                      </label>
                    </div>
                  </>
                ) : modal === "lead" ? (
                  <>
                    <label>
                      Nome
                      <input name="name" required />
                    </label>
                    <label>
                      Email
                      <input name="email" type="email" required />
                    </label>
                    <label>
                      Telefone
                      <input name="phone" />
                    </label>
                    <label>
                      Serviço
                      <select name="service">
                        <option>LSF</option>
                        <option>Reabilitação</option>
                        <option>Renovação</option>
                      </select>
                    </label>
                    <label>
                      Notas
                      <textarea name="message" />
                    </label>
                  </>
                ) : modal === "acesso" ? (
                  <>
                    <p>
                      O cliente deve ter uma conta criada no Supabase Auth. Esta
                      operação associa essa conta à obra selecionada.
                    </p>
                    <label>
                      Email do cliente
                      <input name="email" type="email" required />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Título
                      <input name="title" required maxLength={200} />
                    </label>
                    <label>
                      Descrição / local / referência
                      <textarea name="description" maxLength={4000} />
                    </label>
                    <label>
                      Data prevista
                      <input name="due_date" type="date" />
                    </label>
                    {modal === "pagamento" && (
                      <label>
                        Valor (€)
                        <input
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                        />
                      </label>
                    )}
                    <label className="check">
                      <input name="visible" type="checkbox" defaultChecked />
                      Visível ao cliente
                    </label>
                  </>
                )}
                <button disabled={busy}>
                  {busy ? "A guardar…" : "Guardar"}
                </button>
              </form>
            )}
            {message && <p role="alert">{message}</p>}
          </section>
        </div>
      )}
    </div>
  );
}
