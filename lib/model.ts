export type Project = {
  id: string;
  organization_id: string;
  name: string;
  client_name: string;
  location: string;
  service: string;
  status: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
};
export type Item = {
  id: string;
  project_id: string;
  kind: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  amount: number | null;
  position: number;
  visible_to_client: boolean;
  response: string | null;
};
export type Lead = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  stage: string;
  created_at: string;
};
export const money = (n: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    n,
  );
export const date = (s: string | null) =>
  s
    ? new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(
        new Date(s + "T12:00:00"),
      )
    : "Por definir";
export const done = (s: string) =>
  ["concluido", "aprovado", "pago"].includes(s);
export const label = (s: string) =>
  ({
    pendente: "Pendente",
    em_curso: "Em curso",
    concluido: "Concluído",
    aprovado: "Aprovado",
    recusado: "Recusado",
    pago: "Pago",
    novo: "Novo",
    contactado: "Contactado",
    visita: "Visita técnica",
    proposta: "Proposta",
    ganho: "Ganho",
    perdido: "Perdido",
  })[s] ?? s;
export const phases = {
  LSF: [
    "Estudo e projeto",
    "Licenciamento",
    "Preparação e fundações",
    "Estrutura LSF",
    "Envolvente e cobertura",
    "Instalações técnicas",
    "Acabamentos",
    "Vistoria e entrega",
  ],
  Reabilitação: [
    "Diagnóstico e levantamento",
    "Projeto e planeamento",
    "Preparação e demolições",
    "Estrutura e correções",
    "Instalações técnicas",
    "Acabamentos",
    "Vistoria e entrega",
  ],
  Renovação: [
    "Levantamento e escolhas",
    "Planeamento",
    "Preparação",
    "Instalações e execução",
    "Acabamentos",
    "Vistoria e entrega",
  ],
};
export const demoProjects: Project[] = [
  {
    id: "demo-1",
    organization_id: "demo",
    name: "Moradia Horizonte",
    client_name: "Cliente de exemplo",
    location: "Faro",
    service: "LSF",
    status: "em_curso",
    budget: 185000,
    start_date: "2026-09-15",
    end_date: "2027-04-30",
  },
  {
    id: "demo-2",
    organization_id: "demo",
    name: "Apartamento Centro",
    client_name: "Cliente de exemplo",
    location: "Olhão",
    service: "Reabilitação",
    status: "em_curso",
    budget: 48000,
    start_date: "2026-10-01",
    end_date: "2026-12-15",
  },
];
export const demoItems: Item[] = [
  ...phases.LSF.map((title, position) => ({
    id: "phase-" + position,
    project_id: "demo-1",
    kind: "fase",
    title,
    description: "",
    status:
      position < 2 ? "concluido" : position === 2 ? "em_curso" : "pendente",
    due_date: null,
    amount: null,
    position,
    visible_to_client: true,
    response: null,
  })),
  {
    id: "decision-1",
    project_id: "demo-1",
    kind: "decisao",
    title: "Escolher caixilharia e acabamento exterior",
    description:
      "Reunião na obra. Confirmar cor, tipo de vidro e acabamento antes da encomenda.",
    status: "pendente",
    due_date: "2026-10-16",
    amount: null,
    position: 0,
    visible_to_client: true,
    response: null,
  },
  {
    id: "meet-1",
    project_id: "demo-1",
    kind: "reuniao",
    title: "Reunião de decisão no local",
    description:
      "Moradia Horizonte, Faro · 10h00. Rever as amostras da caixilharia.",
    status: "pendente",
    due_date: "2026-10-16",
    amount: null,
    position: 0,
    visible_to_client: true,
    response: null,
  },
  {
    id: "pay-1",
    project_id: "demo-1",
    kind: "pagamento",
    title: "Adjudicação",
    description: "Parcela contratual de exemplo.",
    status: "pago",
    due_date: "2026-09-15",
    amount: 18500,
    position: 0,
    visible_to_client: true,
    response: null,
  },
  {
    id: "pay-2",
    project_id: "demo-1",
    kind: "pagamento",
    title: "Conclusão das fundações",
    description: "Pagamento previsto após validação da fase.",
    status: "pendente",
    due_date: "2026-10-30",
    amount: 37000,
    position: 1,
    visible_to_client: true,
    response: null,
  },
  {
    id: "update-1",
    project_id: "demo-1",
    kind: "atualizacao",
    title: "Preparação das fundações",
    description:
      "Trabalhos de preparação em curso. A equipa acompanha a execução e o calendário.",
    status: "concluido",
    due_date: "2026-10-07",
    amount: null,
    position: 0,
    visible_to_client: true,
    response: null,
  },
];
