"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

/* ═══ Types ═══ */
type ContractStatus = "ativo" | "expirando" | "expirado";

interface B2BContract {
  id: string;
  company_name: string;
  company_type: string;
  training_name: string;
  value: number;
  status: ContractStatus;
  started_at: string;
  expires_at: string;
}

/* ═══ Mock B2B Contracts Data ═══ */
const MOCK_CONTRACTS: B2BContract[] = [
  {
    id: "contract-1",
    company_name: "Metalúrgica Aço Forte",
    company_type: "Indústria",
    training_name: "Brigada Intermediária (16h) — IN28 Completo",
    value: 4800,
    status: "expirando",
    started_at: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(), // 350 days ago
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),   // 15 days from now
  },
  {
    id: "contract-2",
    company_name: "Escola Municipal Horizonte",
    company_type: "Escola",
    training_name: "Lei Lucas — Primeiros Socorros nas Escolas",
    value: 2400,
    status: "expirado",
    started_at: new Date(Date.now() - 395 * 24 * 60 * 60 * 1000).toISOString(), // 395 days ago
    expires_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),   // Expired 30 days ago
  },
  {
    id: "contract-3",
    company_name: "Indústria Química SafeChem",
    company_type: "Indústria",
    training_name: "Brigada Avançada (40h) — Combate Intensivo",
    value: 12000,
    status: "ativo",
    started_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    expires_at: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000).toISOString(),  // 245 days remaining
  },
  {
    id: "contract-4",
    company_name: "Têxtil Nova Era",
    company_type: "Indústria",
    training_name: "Brigada Básica (8h) — Combate e P.S.",
    value: 2400,
    status: "ativo",
    started_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "contract-5",
    company_name: "Colégio São Jorge",
    company_type: "Escola",
    training_name: "Lei Lucas — Primeiros Socorros + Selo de Segurança",
    value: 3600,
    status: "ativo",
    started_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 285 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "contract-6",
    company_name: "Cerâmica Estrela do Sul",
    company_type: "Indústria",
    training_name: "SIPAT 2026 — Segurança do Trabalho & Prevenção",
    value: 1200,
    status: "ativo",
    started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string; border: string; desc: string }> = {
  ativo: {
    label: "Conforme B2B",
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/20",
    desc: "Treinamento de Brigada e licença IN28 dentro da validade legal.",
  },
  expirando: {
    label: "Alerta de Expiração",
    color: "text-warning",
    bg: "bg-warning/5",
    border: "border-warning/20",
    desc: "Certificado vence em menos de 60 dias. Crítico para renovação!",
  },
  expirado: {
    label: "Fora de Conformidade",
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    desc: "Empresa irregular perante a IN28. Risco de multa e interdição.",
  },
};

export default function ContractsPage() {
  const supabase = createClient();
  const [contracts, setContracts] = useState<B2BContract[]>(MOCK_CONTRACTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ContractStatus | "all">("all");

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      // Tenta buscar contratos cadastrados em crm_contracts
      const { data, error } = await supabase
        .from("crm_contracts")
        .select(`
          id, value, status, started_at, expires_at,
          company:companies(name, type),
          training:trainings(name)
        `)
        .order("expires_at", { ascending: true });

      if (error) {
        console.warn("crm_contracts table not available, using mock contracts data.");
        setContracts(MOCK_CONTRACTS);
      } else if (data && data.length > 0) {
        const mapped = (data as any[]).map((row) => ({
          id: row.id,
          company_name: row.company?.name ?? "Empresa Cliente",
          company_type: row.company?.type ?? "Indústria",
          training_name: row.training?.name ?? "Treinamento Corporativo",
          value: Number(row.value),
          status: row.status as ContractStatus,
          started_at: row.started_at,
          expires_at: row.expires_at,
        }));
        setContracts(mapped);
      } else {
        setContracts(MOCK_CONTRACTS); // fallback se banco estiver vazio
      }
    } catch (err) {
      setContracts(MOCK_CONTRACTS);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  /* Calculate Summary Metrics */
  const totalContracts = contracts.length;
  const activeContractsVal = contracts.reduce((acc, c) => acc + (c.status === "ativo" ? c.value : 0), 0);
  const totalMRR = contracts.reduce((acc, c) => acc + c.value, 0) / 12; // MRR aproximado (anualizado)
  const expiringCount = contracts.filter((c) => c.status === "expirando").length;
  const expiredCount = contracts.filter((c) => c.status === "expirado").length;

  /* Filter Contracts */
  const filtered = contracts.filter((c) => {
    const matchSearch =
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.training_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary animate-pulse-glow" />
            Contratos B2B & Radar de Recorrência
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Radar de conformidade IN28: gerencie renovações recorrentes e mantenha seus clientes em dia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expiringCount + expiredCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-warning/10 text-warning border border-warning/20 animate-pulse-glow">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{expiringCount + expiredCount} empresas expiram em breve!</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Previsão Mensal (MRR)</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">
              {totalMRR.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </h3>
            <p className="text-[9px] text-muted-foreground mt-1">Estimativa de receita recorrente</p>
          </div>
        </div>

        {/* Total Active Contracts */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Empresas Conformes</p>
            <h3 className="text-xl font-bold text-success mt-0.5">
              {contracts.filter((c) => c.status === "ativo").length} / {totalContracts}
            </h3>
            <p className="text-[9px] text-muted-foreground mt-1">Com alvará da IN28 ativo</p>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning flex-shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Atenção Crítica</p>
            <h3 className="text-xl font-bold text-warning mt-0.5">{expiringCount}</h3>
            <p className="text-[9px] text-muted-foreground mt-1">Expirando em menos de 60 dias</p>
          </div>
        </div>

        {/* Out of Compliance */}
        <div className="rounded-xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Vencidos / Irregulares</p>
            <h3 className="text-xl font-bold text-destructive mt-0.5">{expiredCount}</h3>
            <p className="text-[9px] text-muted-foreground mt-1">Necessitam reciclagem urgente</p>
          </div>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-surface border border-border flex-shrink-0">
          {(
            [
              { key: "all", label: "Todos Contratos" },
              { key: "ativo", label: "Conformes (IN28)" },
              { key: "expirando", label: "Próximos do Vencimento" },
              { key: "expirado", label: "Vencidos" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                filterStatus === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[9px] opacity-60">
                {tab.key === "all"
                  ? totalContracts
                  : contracts.filter((c) => c.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa ou curso contratado..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* ── B2B Contracts Compliance Table ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Escaneando radar de recorrência...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Shield className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-foreground font-semibold">Nenhum contrato encontrado</h3>
                <p className="text-xs text-muted-foreground mt-1">Ajuste os filtros de busca para encontrar registros.</p>
              </div>
            ) : (
              filtered.map((contract) => {
                const conf = STATUS_CONFIG[contract.status];
                const daysLeft = Math.ceil(
                  (new Date(contract.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={contract.id}
                    className={`flex flex-col lg:flex-row lg:items-center gap-4 p-5 hover:bg-surface/30 transition-colors border-l-4 ${
                      contract.status === "ativo"
                        ? "border-l-success"
                        : contract.status === "expirando"
                          ? "border-l-warning animate-pulse-glow"
                          : "border-l-destructive"
                    }`}
                  >
                    {/* B2B Client Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {contract.company_name}
                        </h3>
                        <span className="text-[9px] bg-surface text-muted-foreground px-2 py-0.5 rounded border border-border/80 font-medium">
                          {contract.company_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {contract.training_name}
                      </p>
                    </div>

                    {/* Expiration Radar Bar */}
                    <div className="flex-shrink-0 w-full lg:w-44 flex flex-col items-start lg:items-end gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${conf.border} ${conf.color} ${conf.bg}`}>
                        {conf.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {contract.status === "expirado" ? (
                          <span className="text-destructive font-bold">Vencido há {Math.abs(daysLeft)} dias</span>
                        ) : contract.status === "expirando" ? (
                          <span className="text-warning font-semibold">Vence em {daysLeft} dias!</span>
                        ) : (
                          <span>Vence em {daysLeft} dias</span>
                        )}
                      </span>
                    </div>

                    {/* Date limits */}
                    <div className="flex-shrink-0 hidden md:flex items-center gap-4 text-xs text-muted-foreground border-l border-border pl-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Início</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {new Date(contract.started_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Vencimento</p>
                        <p className={`font-semibold mt-0.5 ${contract.status === "expirado" ? "text-destructive" : "text-foreground"}`}>
                          {new Date(contract.expires_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {/* Contract Value */}
                    <div className="flex-shrink-0 lg:w-28 text-left lg:text-right border-t lg:border-t-0 border-border/50 pt-3 lg:pt-0">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Valor Fechado</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">
                        {contract.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>

                    {/* Renewal trigger button B2B / Auto-resell */}
                    <div className="flex-shrink-0 lg:pl-3 flex justify-end">
                      {contract.status !== "ativo" ? (
                        <Link
                          href={`/instrutor/comercial?companyName=${encodeURIComponent(contract.company_name)}`}
                          className="h-9 px-4 rounded-lg bg-fire-gradient-strong text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Renovar Contrato B2B
                        </Link>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground/30">
                          <CheckCircle2 className="w-4 h-4 text-success/40" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
