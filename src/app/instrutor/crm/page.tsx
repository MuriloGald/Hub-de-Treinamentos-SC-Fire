"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Send,
  FileText,
  X,
  Clock,
  ArrowUpRight,
  MessageSquare,
  CalendarDays,
  Layers,
} from "lucide-react";

/* ═══ Types ═══ */
type LeadStage = "novo" | "contatado" | "proposta_enviada" | "negociacao" | "ganho" | "perdido";

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  stage: LeadStage;
  expected_value: number;
  notes: string;
  created_at: string;
}

interface Interaction {
  id: string;
  lead_id: string;
  interaction_type: "ligacao" | "email" | "reuniao" | "nota" | "proposta_enviada";
  content: string;
  created_at: string;
}

/* ═══ Mock Data Fallbacks ═══ */
const MOCK_LEADS: Lead[] = [
  {
    id: "mock-1",
    company_name: "Rodobelo Transportes",
    contact_name: "Carlos Albuquerque",
    contact_phone: "(11) 98888-7777",
    contact_email: "carlos.rodobelo@gmail.com",
    stage: "novo",
    expected_value: 4800,
    notes: "Interesse em fechar Brigada Intermediária para 22 motoristas. Exigência IN28.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    company_name: "Supermercados Pão e Mel",
    contact_name: "Beatriz Santos",
    contact_phone: "(11) 97777-6666",
    contact_email: "beatriz.hr@paomel.com.br",
    stage: "contatado",
    expected_value: 2400,
    notes: "Ligação fria realizada. Beatriz solicitou portfólio completo da Lei Lucas e brigada básica.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    company_name: "Condomínio Spazio Di Fiori",
    contact_name: "Síndico Marcos",
    contact_phone: "(11) 96666-5555",
    contact_email: "spaziodifiori@hotmail.com",
    stage: "proposta_enviada",
    expected_value: 1200,
    notes: "Proposta de SIPAT + Extintores Bronze enviada por e-mail. Aguardando assembleia dos condôminos.",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-4",
    company_name: "Logística Expressa Ltda",
    contact_name: "Fernando Lima",
    contact_phone: "(11) 95555-4444",
    contact_email: "fernando@logexpress.com.br",
    stage: "negociacao",
    expected_value: 12000,
    notes: "Reunião comercial feita. Estão pedindo desconto de 10% no combo de Brigada Avançada 40h B2B.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-5",
    company_name: "Indústrias MetalLeve",
    contact_name: "Renata Souza",
    contact_phone: "(11) 94444-3333",
    contact_email: "renata.souza@metalleve.com.br",
    stage: "ganho",
    expected_value: 4800,
    notes: "Fechado! Contrato assinado e turma de Brigada Intermediária gerada no Cockpit.",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-6",
    company_name: "Hospital Santa Clara",
    contact_name: "Dr. Roberto",
    contact_phone: "(11) 93333-2222",
    contact_email: "roberto@santaclarahosp.com.br",
    stage: "perdido",
    expected_value: 8000,
    notes: "Perdido por preço. Fecharam com concorrente local por R$6.500.",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_INTERACTIONS: Record<string, Interaction[]> = {
  "mock-2": [
    {
      id: "int-1",
      lead_id: "mock-2",
      interaction_type: "ligacao",
      content: "Ligação inicial para apresentação do portfólio. Beatriz se mostrou muito simpática.",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "mock-3": [
    {
      id: "int-2",
      lead_id: "mock-3",
      interaction_type: "email",
      content: "Envio formal do orçamento em PDF com subtemas IN28 e custos detalhados.",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "mock-4": [
    {
      id: "int-3",
      lead_id: "mock-4",
      interaction_type: "reuniao",
      content: "Reunião de alinhamento com engenheiro de segurança. Pediram adequações na carga prática.",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "int-4",
      lead_id: "mock-4",
      interaction_type: "nota",
      content: "Nota: O Diretor Financeiro precisa dar a palavra final sobre o desconto solicitado.",
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "mock-5": [
    {
      id: "int-5",
      lead_id: "mock-5",
      interaction_type: "proposta_enviada",
      content: "Assinatura eletrônica concluída via sistema SC Fire.",
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

const STAGE_CONFIG: Record<LeadStage, { label: string; color: string; border: string; bg: string }> = {
  novo: { label: "Novo Lead", color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
  contatado: { label: "Contatado", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
  proposta_enviada: { label: "Proposta Enviada", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
  negociacao: { label: "Em Negociação", color: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5" },
  ganho: { label: "Fechado / Ganho", color: "text-success", border: "border-success/20", bg: "bg-success/5" },
  perdido: { label: "Perdido", color: "text-destructive", border: "border-destructive/20", bg: "bg-destructive/5" },
};

const INTERACTION_ICONS = {
  ligacao: "📞",
  email: "✉️",
  reuniao: "🤝",
  nota: "📝",
  proposta_enviada: "💰",
};

export default function CRMPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* Drawer Lead Detail States */
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [newInteractionType, setNewInteractionType] = useState<Interaction["interaction_type"]>("nota");
  const [newInteractionContent, setNewInteractionContent] = useState("");

  /* New Lead Modal States */
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newExpectedValue, setNewExpectedValue] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  /* Load Leads */
  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crm_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("CRM database table not ready or error. Falling back to interactive mock data:", error.message);
        setLeads(MOCK_LEADS);
      } else if (data && data.length > 0) {
        setLeads(data as Lead[]);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.warn("DB connection error, using mock fallback data.");
      setLeads(MOCK_LEADS);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  /* Load interactions for a specific lead */
  const loadInteractions = useCallback(async (leadId: string) => {
    setLoadingInteractions(true);
    try {
      const { data, error } = await supabase
        .from("crm_interactions")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("crm_interactions table not ready, using mock interactions fallback.");
        setInteractions(MOCK_INTERACTIONS[leadId] || []);
      } else {
        setInteractions((data as Interaction[]) || []);
      }
    } catch (err) {
      setInteractions(MOCK_INTERACTIONS[leadId] || []);
    } finally {
      setLoadingInteractions(false);
    }
  }, [supabase]);

  const selectLead = (lead: Lead) => {
    setSelectedLead(lead);
    loadInteractions(lead.id);
  };

  /* Add new Opportunity/Lead */
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newCompany.trim() || !newContactName.trim() || !newContactPhone.trim() || !newContactEmail.trim()) {
      setFormError("Por favor, preencha todos os campos de contato obrigatórios.");
      return;
    }

    const val = parseFloat(newExpectedValue) || 0;

    startTransition(async () => {
      try {
        const payload = {
          company_name: newCompany.trim(),
          contact_name: newContactName.trim(),
          contact_phone: newContactPhone.trim(),
          contact_email: newContactEmail.trim(),
          expected_value: val,
          notes: newNotes.trim() || "Nenhuma observação cadastrada.",
          stage: "novo" as LeadStage,
        };

        const { data, error } = await supabase
          .from("crm_leads")
          .insert(payload)
          .select()
          .single();

        if (error) {
          // Mock append fallback so the UI works immediately
          const mockNewLead: Lead = {
            id: `mock-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
          };
          setLeads((prev) => [mockNewLead, ...prev]);
        } else if (data) {
          setLeads((prev) => [data as Lead, ...prev]);
        }

        // Reset
        setNewCompany("");
        setNewContactName("");
        setNewContactPhone("");
        setNewContactEmail("");
        setNewExpectedValue("");
        setNewNotes("");
        setNewLeadModalOpen(false);
      } catch (err) {
        setFormError("Erro de conexão ao banco. Criando lead offline.");
      }
    });
  };

  /* Add new Interaction */
  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteractionContent.trim() || !selectedLead) return;

    try {
      const payload = {
        lead_id: selectedLead.id,
        interaction_type: newInteractionType,
        content: newInteractionContent.trim(),
      };

      const { data, error } = await supabase
        .from("crm_interactions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Fallback local append
        const mockNewInt: Interaction = {
          id: `int-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
        };
        setInteractions((prev) => [mockNewInt, ...prev]);
      } else if (data) {
        setInteractions((prev) => [data as Interaction, ...prev]);
      }

      setNewInteractionContent("");
    } catch (err) {
      console.error("Error creating interaction:", err);
    }
  };

  /* Drag or Change Lead Stage */
  const handleChangeStage = async (leadId: string, nextStage: LeadStage) => {
    // Update local state first for instant snappy response
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: nextStage } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stage: nextStage } : null));
    }

    try {
      await supabase
        .from("crm_leads")
        .update({ stage: nextStage })
        .eq("id", leadId);
    } catch (err) {
      console.error("Error updating stage in DB:", err);
    }
  };

  /* Delete Lead */
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta oportunidade?")) return;

    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSelectedLead(null);

    try {
      await supabase.from("crm_leads").delete().eq("id", leadId);
    } catch (err) {
      console.error("Error deleting lead in DB:", err);
    }
  };

  /* Filter Leads */
  const filteredLeads = leads.filter((l) => {
    const term = search.toLowerCase();
    return (
      l.company_name.toLowerCase().includes(term) ||
      l.contact_name.toLowerCase().includes(term) ||
      l.notes.toLowerCase().includes(term)
    );
  });

  /* Calculate Metrics */
  const activeLeads = leads.filter((l) => l.stage !== "ganho" && l.stage !== "perdido");
  const totalPipeline = activeLeads.reduce((acc, curr) => acc + Number(curr.expected_value), 0);
  const wonLeads = leads.filter((l) => l.stage === "ganho");
  const wonTotalValue = wonLeads.reduce((acc, curr) => acc + Number(curr.expected_value), 0);
  const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12 h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            CRM & Funil de Vendas B2B
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie novos contatos, envie propostas e acompanhe o pipeline comercial.
          </p>
        </div>
        <button
          onClick={() => setNewLeadModalOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-fire-gradient-strong text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {/* ── Financial Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pipeline Ativo</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">
              {totalPipeline.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">{activeLeads.length} leads em negociação</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Receita Fechada</p>
            <h3 className="text-xl font-bold text-success mt-0.5">
              {wonTotalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">{wonLeads.length} contratos ganhos</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Taxa de Conversão</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{conversionRate}%</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Negociações fechadas com sucesso</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface/80 flex items-center justify-center text-muted-foreground flex-shrink-0 border border-border/50">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total de Oportunidades</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{leads.length}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Leads cadastrados no total</p>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar leads por empresa, contato ou notas..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all"
        />
      </div>

      {/* ── Kanban Columns Grid ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando funil de vendas...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 flex gap-4 min-h-[500px] items-stretch">
          {(["novo", "contatado", "proposta_enviada", "negociacao", "ganho", "perdido"] as LeadStage[]).map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.stage === stage);
            const columnTotal = columnLeads.reduce((acc, curr) => acc + Number(curr.expected_value), 0);
            const conf = STAGE_CONFIG[stage];

            return (
              <div
                key={stage}
                className="flex-shrink-0 w-80 rounded-xl bg-surface border border-border/60 flex flex-col h-full"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-current ${conf.color}`} />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{conf.label}</h3>
                    <span className="text-[10px] bg-card text-muted-foreground px-1.5 py-0.5 rounded-md border border-border font-medium">
                      {columnLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {columnTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Column Body / Cards List */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px] min-h-[350px]">
                  {columnLeads.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 border-2 border-dashed border-border/40 rounded-lg">
                      <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Nenhum Lead</p>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => selectLead(lead)}
                        className={`group relative rounded-xl border p-4 hover:bg-card/50 transition-all duration-300 hover:border-primary/20 hover:shadow-md cursor-pointer block text-left bg-card ${conf.border} ${conf.bg}`}
                      >
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {lead.company_name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                          <User className="w-3 h-3 flex-shrink-0" /> {lead.contact_name}
                        </p>

                        <p className="text-xs text-foreground font-semibold mt-3">
                          {lead.expected_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>

                        {/* Card bottom info */}
                        <div className="flex items-center justify-between border-t border-border/40 mt-3 pt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium flex items-center gap-0.5">
                            Gerenciar <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════
         LEAD DETAIL DRAWER SIDEBAR
         ════════════════════════════════════════════ */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedLead(null)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-border flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STAGE_CONFIG[selectedLead.stage].border} ${STAGE_CONFIG[selectedLead.stage].color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {STAGE_CONFIG[selectedLead.stage].label}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mt-2">{selectedLead.company_name}</h2>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions / Value */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-surface border border-border/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Valor Estimado</span>
                  <h4 className="text-base font-bold text-foreground mt-1">
                    {selectedLead.expected_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </h4>
                </div>
                <div className="bg-surface border border-border/80 rounded-xl p-3.5 flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Data do Cadastro</span>
                  <h4 className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(selectedLead.created_at).toLocaleDateString("pt-BR")}
                  </h4>
                </div>
              </div>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Informações de Contato</h3>
                <div className="space-y-2.5 rounded-xl bg-surface border border-border/50 p-4 text-sm text-foreground">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{selectedLead.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${selectedLead.contact_phone}`} className="hover:underline hover:text-primary">
                      {selectedLead.contact_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedLead.contact_email}`} className="hover:underline hover:text-primary">
                      {selectedLead.contact_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notas / Necessidades</h3>
                <div className="rounded-xl border border-border bg-surface/30 p-4 text-xs leading-relaxed text-muted-foreground">
                  {selectedLead.notes}
                </div>
              </div>

              {/* Stage Progress Controller */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Estágio do Funil</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["novo", "contatado", "proposta_enviada", "negociacao", "ganho", "perdido"] as LeadStage[]).map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleChangeStage(selectedLead.id, stage)}
                      className={`h-8 rounded-lg text-[10px] font-bold transition-all border ${
                        selectedLead.stage === stage
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {STAGE_CONFIG[stage].label.split(" / ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Hub Connector Button */}
              {selectedLead.stage !== "ganho" && (
                <div className="p-1 rounded-xl bg-fire-gradient/10 border border-primary/20 flex flex-col space-y-2">
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Proposta do Hub Comercial
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Crie um pacote de treinamentos B2B personalizado para este lead. O fechamento do contrato moverá este lead automaticamente para Ganho.
                    </p>
                  </div>
                  <Link
                    href={`/instrutor/comercial?companyName=${encodeURIComponent(selectedLead.company_name)}&leadId=${selectedLead.id}`}
                    className="h-10 rounded-lg bg-fire-gradient-strong text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Montar Proposta no Hub <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Interactive Timeline of Activity / Logs */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Histórico de Atividades</h3>

                {/* Add new activity form */}
                <form onSubmit={handleCreateInteraction} className="space-y-3 bg-surface border border-border/60 rounded-xl p-4">
                  <div className="flex gap-2">
                    {(["nota", "ligacao", "email", "reuniao"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewInteractionType(type)}
                        className={`h-7 px-2.5 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 capitalize ${
                          newInteractionType === type
                            ? "bg-card border-primary text-primary"
                            : "bg-surface border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{INTERACTION_ICONS[type]}</span>
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <textarea
                      value={newInteractionContent}
                      onChange={(e) => setNewInteractionContent(e.target.value)}
                      placeholder={`Registrar uma atividade ou nota para ${selectedLead.company_name}...`}
                      className="w-full min-h-[70px] max-h-[120px] rounded-lg bg-card border border-border text-xs text-foreground p-3 focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="submit"
                      disabled={!newInteractionContent.trim()}
                      className="absolute right-2.5 bottom-2.5 w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center hover:bg-primary/95 transition-colors disabled:opacity-30 disabled:hover:bg-primary cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>

                {/* Timeline rendering */}
                {loadingInteractions ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="relative border-l border-border ml-3 pl-5 space-y-5">
                    {interactions.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground text-center py-4">Nenhuma atividade registrada.</p>
                    ) : (
                      interactions.map((int) => (
                        <div key={int.id} className="relative group">
                          {/* Indicator Dot */}
                          <span className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] shadow-sm">
                            {INTERACTION_ICONS[int.interaction_type] || "📝"}
                          </span>
                          {/* Info card */}
                          <div className="rounded-xl border border-border bg-surface/20 p-3 text-xs leading-relaxed text-foreground">
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1.5">
                              <span className="font-semibold uppercase tracking-wider text-primary">
                                {int.interaction_type}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(int.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">{int.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Drawer */}
            <div className="p-4 border-t border-border flex-shrink-0 bg-surface/35 flex justify-between gap-4">
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="h-10 px-4 rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir Oportunidade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
         NEW LEAD MODAL
         ════════════════════════════════════════════ */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNewLeadModalOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/50">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Cadastrar Nova Oportunidade B2B
              </h2>
              <button
                onClick={() => setNewLeadModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-card flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 1: Company details */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dados da Empresa</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nome da Empresa (ex: Transportadora Alfa)"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Lead contact details */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Informações do Contato</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nome do Decisor (ex: Carlos HR)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Telefone (ex: (11) 99999-8888)"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="E-mail Corporativo (ex: decisor@empresa.com)"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Grid 3: Value and Notes */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    placeholder="Valor previsto do contrato (ex: 4800)"
                    value={newExpectedValue}
                    onChange={(e) => setNewExpectedValue(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Notas / Observações Iniciais</label>
                  <textarea
                    placeholder="Detalhes sobre a ementa IN28, número de alunos, exigências específicas..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full h-20 p-3.5 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all placeholder:text-muted-foreground/60 resize-none"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setNewLeadModalOpen(false)}
                  className="h-11 px-5 rounded-lg bg-surface border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-11 px-5 rounded-lg bg-fire-gradient-strong text-white font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Oportunidade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
