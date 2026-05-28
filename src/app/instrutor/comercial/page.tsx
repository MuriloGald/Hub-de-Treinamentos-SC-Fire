"use client";

import { useState, useMemo, useCallback, useEffect, useTransition, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Package,
  Clock,
  DollarSign,
  Shield,
  Search,
  X,
  Sparkles,
  GripVertical,
  Flame,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Calendar,
  MapPin,
  Lock,
  Unlock,
  MonitorPlay,
} from "lucide-react";

/* ═══ Types ═══ */
type Level = "Bronze" | "Prata" | "Ouro";
type Category = "Primeiros Socorros" | "Combate a Incêndio" | "SIPAT";

interface Subtheme {
  id: string;
  name: string;
  category: Category;
  level: Level;
  hours: number;
  price: number;
  mandatory?: boolean;
}

interface SelectedSubtheme {
  subtheme: Subtheme;
  quantity: number;
}

type ComboKey =
  | "basica-8h"
  | "intermediaria-16h"
  | "avancada-40h"
  | "lei-lucas"
  | "customizado";

interface ComboOption {
  key: ComboKey;
  label: string;
  price: number;
  hours: number;
  requiredIds: string[];
}

interface Company {
  id: string;
  name: string;
  type: string;
}

/* ═══ Formatters ═══ */
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatHours(h: number): string {
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1).replace(".", ",")}h`;
}

/* ═══ Design Helpers ═══ */
const levelColors: Record<Level, string> = {
  Bronze: "bg-amber-800/20 text-amber-500 border-amber-700/30",
  Prata: "bg-slate-400/20 text-slate-300 border-slate-500/30",
  Ouro: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const levelDot: Record<Level, string> = {
  Bronze: "bg-amber-500",
  Prata: "bg-slate-400",
  Ouro: "bg-yellow-400",
};

const categoryIcons: Record<Category, string> = {
  "Primeiros Socorros": "🩺",
  "Combate a Incêndio": "🔥",
  SIPAT: "🛡️",
};

function ComercialContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCompanyName = searchParams.get("companyName");
  const queryLeadId = searchParams.get("leadId");

  const [leadId, setLeadId] = useState<string | null>(queryLeadId);
  const [isPending, startTransition] = useTransition();

  /* ═══ RBAC (User Role) State ═══ */
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"diretor" | "coordenador" | "instrutor">("instrutor");

  /* ═══ Supabase Loaded States ═══ */
  const [dbSubthemes, setDbSubthemes] = useState<Subtheme[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  /* ═══ UI States ═══ */
  const [selectedCombo, setSelectedCombo] = useState<ComboKey>("customizado");
  const [selectedItems, setSelectedItems] = useState<SelectedSubtheme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(["Primeiros Socorros", "Combate a Incêndio", "SIPAT"])
  );
  const [comboDropdownOpen, setComboDropdownOpen] = useState(false);

  /* ── Finalize Contract / Class Generation Modal States ── */
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyType, setNewCompanyType] = useState("Indústria");
  const [scheduledDate, setScheduledDate] = useState("");
  const [classLocation, setClassLocation] = useState("");
  const [classNotes, setClassNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ═══ User Identity / Role Check ═══ */
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setUserEmail(user.email);
          const metaRole = user.user_metadata?.role;
          const emailLower = user.email.toLowerCase();

          if (metaRole === "diretor" || emailLower === "galdinomus@gmail.com" || emailLower.startsWith("diretor")) {
            setUserRole("diretor");
          } else if (metaRole === "coordenador" || emailLower.startsWith("coordenador") || emailLower.includes("coord")) {
            setUserRole("coordenador");
          } else {
            setUserRole("instrutor");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar papel do usuário:", err);
      }
    }
    checkUser();
  }, [supabase]);

  const hasReorderingAccess = userRole === "diretor" || userRole === "coordenador";

  useEffect(() => {
    if (queryCompanyName && companies.length > 0) {
      const match = companies.find(
        (c) => c.name.toLowerCase() === queryCompanyName.toLowerCase()
      );
      if (match) {
        setSelectedCompanyId(match.id);
        setIsNewCompany(false);
      } else {
        setIsNewCompany(true);
        setNewCompanyName(queryCompanyName);
        setSelectedCompanyId("");
      }
    }
  }, [queryCompanyName, companies]);

  /* ═══ Load Subthemes and Companies ═══ */
  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Subthemes from DB
      const { data: subthemesData, error: subError } = await supabase
        .from("subthemes")
        .select("id, name, category, level, hours, price, active")
        .eq("active", true);

      if (subError) throw subError;

      const mappedSubthemes: Subtheme[] = (subthemesData || []).map((row: any) => {
        // Regras de matérias obrigatórias da IN28 para os combos:
        const mandatoryNames = [
          "Suporte Básico de Vida",
          "Fraturas e Imobilizações",
          "Contexto Histórico do Incêndio",
          "Uso e Manuseio de Extintores",
          "Treinamento para Evacuação",
        ];
        return {
          id: row.id,
          name: row.name,
          category: row.category as Category,
          level: row.level as Level,
          hours: Number(row.hours),
          price: Number(row.price),
          mandatory: mandatoryNames.some((n) => row.name.toLowerCase().includes(n.toLowerCase())),
        };
      });
      setDbSubthemes(mappedSubthemes);

      // 2. Fetch Companies from DB
      const { data: companiesData, error: compError } = await supabase
        .from("companies")
        .select("id, name, type, active")
        .eq("active", true)
        .order("name", { ascending: true });

      if (compError) throw compError;
      setCompanies((companiesData as Company[]) || []);
    } catch (err) {
      console.error("Erro ao buscar dados comerciais:", err);
    } finally {
      setLoadingData(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /* ── IN28 mandatory IDs based on fetched subthemes ── */
  const IN28_MANDATORY_IDS = useMemo(
    () => dbSubthemes.filter((s) => s.mandatory).map((s) => s.id),
    [dbSubthemes]
  );

  /* ── Base Combo Options ── */
  const comboOptions: ComboOption[] = useMemo(() => {
    // SBV, Extintores, Evacuação, SBV, Fraturas, stop the bleed, etc.
    const findIdsByNames = (names: string[]) =>
      dbSubthemes.filter((s) => names.some((n) => s.name.toLowerCase().includes(n.toLowerCase()))).map((s) => s.id);

    return [
      {
        key: "customizado",
        label: "Customizado (Sem Combo)",
        price: 0,
        hours: 0,
        requiredIds: [],
      },
      {
        key: "basica-8h",
        label: "Brigada Básica 8h",
        price: 2400,
        hours: 8,
        requiredIds: findIdsByNames([
          "Suporte Básico de Vida",
          "Uso e Manuseio de Extintores",
          "Contexto Histórico",
          "Segurança da Cena",
          "Treinamento para Evacuação",
        ]),
      },
      {
        key: "intermediaria-16h",
        label: "Brigada Intermediária 16h",
        price: 4800,
        hours: 16,
        requiredIds: findIdsByNames([
          "Suporte Básico de Vida",
          "Uso e Manuseio de Extintores",
          "Contexto Histórico",
          "Segurança da Cena",
          "Treinamento para Evacuação",
          "Fraturas e Imobilizações",
          "Stop the Bleed",
          "Queimaduras",
        ]),
      },
      {
        key: "avancada-40h",
        label: "Brigada Avançada 40h",
        price: 12000,
        hours: 40,
        requiredIds: IN28_MANDATORY_IDS,
      },
      {
        key: "lei-lucas",
        label: "Lei Lucas",
        price: 1800,
        hours: 6,
        requiredIds: findIdsByNames([
          "Suporte Básico de Vida",
          "Segurança da Cena",
          "Psicologia do Atendimento",
          "Ferimentos em Tecido Mole",
        ]),
      },
    ];
  }, [dbSubthemes, IN28_MANDATORY_IDS]);

  /* ── Derived Data ── */
  const activeCombo = useMemo(
    () => comboOptions.find((c) => c.key === selectedCombo) || comboOptions[0],
    [comboOptions, selectedCombo]
  );
  const isBrigadaPackage = ["basica-8h", "intermediaria-16h", "avancada-40h"].includes(selectedCombo);

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((si) => si.subtheme.id)),
    [selectedItems]
  );

  const comboSubthemeIds = useMemo(
    () => new Set(activeCombo.requiredIds),
    [activeCombo]
  );

  const addOnItems = useMemo(
    () => selectedItems.filter((si) => !comboSubthemeIds.has(si.subtheme.id)),
    [selectedItems, comboSubthemeIds]
  );

  const totalHours = useMemo(
    () => selectedItems.reduce((sum, si) => sum + si.subtheme.hours * si.quantity, 0),
    [selectedItems]
  );

  const totalPrice = useMemo(() => {
    if (selectedCombo === "customizado") {
      return selectedItems.reduce((sum, si) => sum + si.subtheme.price * si.quantity, 0);
    }
    const addOnPrice = addOnItems.reduce((sum, si) => sum + si.subtheme.price * si.quantity, 0);
    return activeCombo.price + addOnPrice;
  }, [selectedItems, addOnItems, activeCombo, selectedCombo]);

  /* IN28 compliance check */
  const complianceStatus = useMemo(() => {
    if (!isBrigadaPackage) return { compliant: true, missing: [] as string[], present: [] as string[] };
    const requiredIds = activeCombo.requiredIds;
    const missing = requiredIds.filter((id) => !selectedIds.has(id));
    const present = requiredIds.filter((id) => selectedIds.has(id));
    return { compliant: missing.length === 0, missing, present };
  }, [isBrigadaPackage, activeCombo, selectedIds]);

  /* Filter subthemes by search */
  const filteredSubthemes = useMemo(() => {
    if (!searchQuery.trim()) return dbSubthemes;
    const q = searchQuery.toLowerCase();
    return dbSubthemes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q)
    );
  }, [searchQuery, dbSubthemes]);

  /* Grouped subthemes */
  const groupedSubthemes = useMemo(() => {
    const groups: Record<Category, Subtheme[]> = {
      "Primeiros Socorros": [],
      "Combate a Incêndio": [],
      SIPAT: [],
    };
    for (const s of filteredSubthemes) {
      groups[s.category].push(s);
    }
    return groups;
  }, [filteredSubthemes]);

  /* ── Actions ── */
  const addSubtheme = useCallback(
    (sub: Subtheme) => {
      if (selectedIds.has(sub.id)) return;
      setSelectedItems((prev) => [...prev, { subtheme: sub, quantity: 1 }]);
    },
    [selectedIds]
  );

  const removeSubtheme = useCallback((id: string) => {
    setSelectedItems((prev) => prev.filter((si) => si.subtheme.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((si) =>
        si.subtheme.id === id
          ? { ...si, quantity: Math.max(1, si.quantity + delta) }
          : si
      )
    );
  }, []);

  /* Move item in the list up or down (Reordering) */
  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      if (!hasReorderingAccess) {
        alert("A alteração da ordem das matérias para combos IN28 é restrita a Diretores e Coordenadores.");
        return;
      }
      if (direction === "up" && index === 0) return;
      if (direction === "down" && index === selectedItems.length - 1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      const newItems = [...selectedItems];
      const [removed] = newItems.splice(index, 1);
      newItems.splice(newIndex, 0, removed);
      setSelectedItems(newItems);
    },
    [selectedItems, hasReorderingAccess]
  );

  const handleComboChange = useCallback(
    (key: ComboKey) => {
      setSelectedCombo(key);
      setComboDropdownOpen(false);
      const combo = comboOptions.find((c) => c.key === key)!;
      if (key === "customizado") return;

      // Auto-populate required subthemes
      const currentIds = new Set(selectedItems.map((si) => si.subtheme.id));
      const newItems = [...selectedItems];
      for (const reqId of combo.requiredIds) {
        if (!currentIds.has(reqId)) {
          const sub = dbSubthemes.find((s) => s.id === reqId);
          if (sub) newItems.push({ subtheme: sub, quantity: 1 });
        }
      }
      setSelectedItems(newItems);
    },
    [selectedItems, comboOptions, dbSubthemes]
  );

  const clearAll = useCallback(() => {
    setSelectedItems([]);
    setSelectedCombo("customizado");
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  /* ═══ Generate Class and Training DB Action ═══ */
  const handleFinalizeContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedItems.length === 0) {
      setErrorMessage("Por favor, monte uma trilha de subtemas antes de fechar o contrato.");
      return;
    }

    if (!isNewCompany && !selectedCompanyId) {
      setErrorMessage("Por favor, selecione um cliente cadastrado.");
      return;
    }

    if (isNewCompany && !newCompanyName.trim()) {
      setErrorMessage("Por favor, preencha o nome da nova empresa.");
      return;
    }

    if (!scheduledDate) {
      setErrorMessage("Por favor, selecione uma data e horário de agendamento.");
      return;
    }

    startTransition(async () => {
      try {
        let companyId = selectedCompanyId;

        // 1. Cadastra nova empresa se selecionado
        if (isNewCompany) {
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .insert({
              name: newCompanyName.trim(),
              type: newCompanyType,
            })
            .select("id")
            .single();

          if (companyError) throw companyError;
          companyId = companyData.id;
        }

        // 2. Insere treinamento no banco
        const trainingName = `${activeCombo.label} — ${isNewCompany ? newCompanyName : companies.find((c) => c.id === selectedCompanyId)?.name}`;
        const { data: trainingData, error: trainingError } = await supabase
          .from("trainings")
          .insert({
            name: trainingName,
            description: `Trilha comercial composta por ${selectedItems.length} subtemas.`,
            base_price: totalPrice,
            total_hours: totalHours,
            combo_type: selectedCombo === "customizado" ? "customizado" : selectedCombo.split("-")[0],
          })
          .select("id")
          .single();

        if (trainingError) throw trainingError;
        const trainingId = trainingData.id;

        // 3. Insere subtemas vinculados respeitando a ordem comercial (sort_order)
        const subthemesToInsert = selectedItems.map((si, index) => ({
          training_id: trainingId,
          subtheme_id: si.subtheme.id,
          sort_order: index,
          is_mandatory: !!si.subtheme.mandatory,
        }));

        const { error: subthemesLinkError } = await supabase
          .from("training_subthemes")
          .insert(subthemesToInsert);

        if (subthemesLinkError) throw subthemesLinkError;

        // 4. Insere a nova turma vinculada agendada
        const { error: classError } = await supabase.from("classes").insert({
          company_id: companyId,
          training_id: trainingId,
          status: "agendada",
          scheduled_at: new Date(scheduledDate).toISOString(),
          location: classLocation.trim() || "Presencial / Sede Cliente",
          notes: classNotes.trim() || null,
        });

        if (classError) throw classError;

        // 4.5. Se originado de um lead do CRM, atualiza o status no CRM para ganho
        if (leadId) {
          const { error: leadUpdateError } = await supabase
            .from("crm_leads")
            .update({ stage: "ganho" })
            .eq("id", leadId);
          if (leadUpdateError) console.error("Erro ao atualizar lead para ganho:", leadUpdateError);
        }

        // 5. Success
        setContractModalOpen(false);
        setSuccessModalOpen(true);
      } catch (err: any) {
        console.error("Erro ao gerar contrato comercial:", err);
        setErrorMessage(err.message || "Erro de conexão ao banco. Tente novamente.");
      }
    });
  };

  return (
    <div className="animate-fade-in h-full flex flex-col relative">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fire-gradient-strong flex items-center justify-center shadow-md shadow-primary/20">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hub Comercial</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Monte propostas B2B em tempo real e agende turmas oficiais.
              </p>
            </div>
          </div>
        </div>

        {/* Access Role Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              hasReorderingAccess
                ? "bg-success/10 text-success border-success/30"
                : "bg-surface text-muted-foreground border-border"
            }`}
          >
            {hasReorderingAccess ? <Unlock className="w-3.5 h-3.5 animate-pulse" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="capitalize">Perfil: {userRole}</span>
          </div>

          {isBrigadaPackage && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                complianceStatus.compliant
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-warning/10 text-warning border-warning/30 animate-pulse-glow"
              }`}
            >
              {complianceStatus.compliant ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Conforme IN28 ✓
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  IN28 Pendente ({complianceStatus.missing.length} itens)
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {loadingData ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando catálogo de subtemas do Supabase...</p>
        </div>
      ) : (
        /* ── Main Layout ── */
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
          {/* ════════════════════════════════════════════
             LEFT PANEL — Montagem de Trilha (2/3)
             ════════════════════════════════════════════ */}
          <div className="xl:col-span-2 flex flex-col min-h-0">
            <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Montagem de Trilha</h2>
                  <span className="text-[11px] text-muted-foreground ml-1">({dbSubthemes.length} subtemas disponíveis)</span>
                </div>
              </div>

              {/* Search */}
              <div className="px-5 py-3 border-b border-border flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar subtema por nome, categoria ou nível..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subtheme Categories */}
              <div className="flex-1 overflow-y-auto">
                {(Object.entries(groupedSubthemes) as [Category, Subtheme[]][]).map(([category, items]) => (
                  <div key={category}>
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border hover:bg-surface transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{categoryIcons[category]}</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{category}</span>
                        <span className="text-[10px] text-muted-foreground">({items.length})</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          expandedCategories.has(category) ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>

                    {/* Category Items */}
                    {expandedCategories.has(category) && (
                      <div className="divide-y divide-border/50">
                        {items.map((sub) => {
                          const isSelected = selectedIds.has(sub.id);
                          const isRequiredByCombo = comboSubthemeIds.has(sub.id);
                          const isMissing = isBrigadaPackage && complianceStatus.missing.includes(sub.id);
                          const isPresent = isBrigadaPackage && complianceStatus.present.includes(sub.id);

                          return (
                            <div
                              key={sub.id}
                              onClick={() => !isSelected && addSubtheme(sub)}
                              className={`
                                group flex items-center gap-4 px-5 py-3.5 transition-all duration-200 
                                ${isSelected ? "bg-primary/5 cursor-default" : "hover:bg-surface/70 cursor-pointer"}
                              `}
                            >
                              {/* Grip / Status Indicator */}
                              <div className="flex-shrink-0 w-5">
                                {isPresent && <CheckCircle2 className="w-4 h-4 text-success" />}
                                {isMissing && <AlertTriangle className="w-4 h-4 text-destructive" />}
                                {!isPresent && !isMissing && (
                                  <GripVertical className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`text-sm font-semibold truncate transition-colors ${
                                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                                    }`}
                                  >
                                    {sub.name}
                                  </h3>
                                  {sub.mandatory && isBrigadaPackage && (
                                    <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                      IN28
                                    </span>
                                  )}
                                  {isRequiredByCombo && selectedCombo !== "customizado" && (
                                    <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                                      Combo
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatHours(sub.hours)}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {formatCurrency(sub.price)}
                                  </span>
                                </div>
                              </div>

                              {/* Level Badge */}
                              <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border ${levelColors[sub.level]}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${levelDot[sub.level]}`} />
                                {sub.level}
                              </span>

                              {/* Add Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isSelected) addSubtheme(sub);
                                }}
                                disabled={isSelected}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                  isSelected
                                    ? "bg-primary/10 text-primary cursor-default"
                                    : "bg-surface text-muted-foreground hover:bg-primary hover:text-white hover:scale-110"
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
             RIGHT PANEL — Resumo da Proposta (1/3)
             ════════════════════════════════════════════ */}
          <div className="flex flex-col min-h-0">
            <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-semibold text-foreground">Resumo da Proposta</h2>
                </div>
                {selectedItems.length > 0 && (
                  <button onClick={clearAll} className="text-[11px] text-destructive hover:text-destructive/80 font-medium transition-colors">
                    Limpar tudo
                  </button>
                )}
              </div>

              {/* Combo Selector */}
              <div className="px-5 py-3 border-b border-border flex-shrink-0">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Pacote Base</label>
                <div className="relative">
                  <button
                    onClick={() => setComboDropdownOpen(!comboDropdownOpen)}
                    className="w-full flex items-center justify-between h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground hover:border-primary/40 transition-all focus:outline-none"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Flame className="w-4 h-4 text-primary flex-shrink-0" />
                      {activeCombo.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${comboDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {comboDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setComboDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg bg-card border border-border shadow-xl shadow-black/30 overflow-hidden">
                        {comboOptions.map((combo) => (
                          <button
                            key={combo.key}
                            onClick={() => handleComboChange(combo.key)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                              combo.key === selectedCombo ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface"
                            }`}
                          >
                            <span className="font-semibold">{combo.label}</span>
                            {combo.price > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(combo.price)}</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Selected Subthemes List with Arrow Reordering */}
              <div className="flex-1 overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">Nenhum subtema selecionado</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">Selecione subtemas na lateral esquerda ou escolha um pacote base.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    <div className="px-5 py-2 bg-surface/50 border-b border-border flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Matérias Selecionadas</span>
                      {!hasReorderingAccess && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border">
                          <Lock className="w-2.5 h-2.5" /> Reordenar bloqueado
                        </span>
                      )}
                    </div>

                    {selectedItems.map((si, i) => (
                      <div key={si.subtheme.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-surface/30 transition-colors">
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${levelDot[si.subtheme.level]}`} />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-foreground truncate">{si.subtheme.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{formatHours(si.subtheme.hours)}</span>
                            {selectedCombo === "customizado" && (
                              <span className="text-[10px] text-muted-foreground">{formatCurrency(si.subtheme.price * si.quantity)}</span>
                            )}
                          </div>
                        </div>

                        {/* Reordering Arrow Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => moveItem(i, "up")}
                            disabled={i === 0 || !hasReorderingAccess}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                              !hasReorderingAccess
                                ? "opacity-30 border-transparent text-muted-foreground/20 cursor-not-allowed"
                                : i === 0
                                  ? "border-transparent text-muted-foreground/30 cursor-not-allowed"
                                  : "border-border bg-surface text-foreground hover:bg-muted hover:border-primary/20"
                            }`}
                            title={!hasReorderingAccess ? "Ordem bloqueada (Necessário perfil Diretor/Coordenador)" : "Mover matéria para cima"}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveItem(i, "down")}
                            disabled={i === selectedItems.length - 1 || !hasReorderingAccess}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                              !hasReorderingAccess
                                ? "opacity-30 border-transparent text-muted-foreground/20 cursor-not-allowed"
                                : i === selectedItems.length - 1
                                  ? "border-transparent text-muted-foreground/30 cursor-not-allowed"
                                  : "border-border bg-surface text-foreground hover:bg-muted hover:border-primary/20"
                            }`}
                            title={!hasReorderingAccess ? "Ordem bloqueada (Necessário perfil Diretor/Coordenador)" : "Mover matéria para baixo"}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Quantity controls inside Custom proposal */}
                        {selectedCombo === "customizado" && (
                          <div className="flex items-center gap-1 flex-shrink-0 border border-border/50 rounded bg-surface">
                            <button
                              onClick={() => updateQuantity(si.subtheme.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-4 text-center text-[10px] font-bold text-foreground">{si.quantity}</span>
                            <button
                              onClick={() => updateQuantity(si.subtheme.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => removeSubtheme(si.subtheme.id)}
                          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div className="border-t border-border flex-shrink-0 bg-surface/10">
                {/* Totals */}
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-semibold">
                      <Clock className="w-4 h-4" /> Total de Horas
                    </span>
                    <span className="font-bold text-foreground">{formatHours(totalHours)}</span>
                  </div>
                  {selectedCombo !== "customizado" && (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Pacote Base ({activeCombo.label})</span>
                        <span className="font-semibold text-foreground">{formatCurrency(activeCombo.price)}</span>
                      </div>
                      {addOnItems.length > 0 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Adicionais adicionados</span>
                          <span className="font-semibold text-foreground">
                            + {formatCurrency(addOnItems.reduce((sum, si) => sum + si.subtheme.price * si.quantity, 0))}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="h-px bg-border my-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-primary" /> Total da Proposta
                    </span>
                    <span className="text-lg font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Confirm Sale / Generate Class Button */}
                <div className="px-5 pb-5 pt-1">
                  <button
                    onClick={() => setContractModalOpen(true)}
                    disabled={selectedItems.length === 0}
                    className="w-full h-12 rounded-xl bg-fire-gradient-strong text-white text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/45 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Fechar Contrato / Gerar Turma
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Fechar Contrato e Gerar Turma no Banco ═══ */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Consolidar Contrato Comercial</h3>
              </div>
              <button
                onClick={() => {
                  setContractModalOpen(false);
                  setErrorMessage(null);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFinalizeContract} className="p-6 space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* B2B Client Type Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Cliente B2B</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCompany(!isNewCompany);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-primary font-bold hover:text-primary-hover transition-colors"
                  >
                    {isNewCompany ? "Selecionar Existente" : "+ Criar Novo Cliente"}
                  </button>
                </div>

                {isNewCompany ? (
                  /* New Company Input Form */
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">NOVA EMPRESA CLIENTE</span>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Nome Fantasia / Razão Social"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Ramo de Atuação</label>
                      <select
                        value={newCompanyType}
                        onChange={(e) => setNewCompanyType(e.target.value)}
                        className="w-full h-10 px-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                      >
                        <option value="Indústria">Indústria</option>
                        <option value="Escola">Escola / Faculdade</option>
                        <option value="Outros">Outros Ramo</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Existing Company Selection Dropdown */
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  >
                    <option value="">-- Selecione o cliente cadastrado --</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name} ({comp.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Class Scheduling Date & Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Agendamento da Aula
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                {/* Class Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Local do Treinamento
                  </label>
                  <input
                    type="text"
                    placeholder="Sede da empresa / Centro de Treinamento"
                    value={classLocation}
                    onChange={(e) => setClassLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Observações Técnicas / Pedido</label>
                <textarea
                  placeholder="Instruções para o instrutor de brigada (ex: Trazer simulador de fumaça, etc.)."
                  value={classNotes}
                  onChange={(e) => setClassNotes(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setContractModalOpen(false);
                    setErrorMessage(null);
                  }}
                  className="flex-1 h-11 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-11 rounded-xl bg-fire-gradient-strong text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Venda
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Sucesso total da operação comercial ═══ */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-scale-in">
            {/* Celebrate Glowing Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success animate-float shadow-lg shadow-success/15 border border-success/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="absolute -inset-2 bg-success rounded-full opacity-10 blur-xl animate-pulse-glow" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Venda Consolidada & Turma Agendada!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                O treinamento foi salvo com sucesso, vinculando as matérias exatamente na ordem definida por você. 
                <br />
                A nova turma está **Agendada** e pronta no banco de dados para ser orquestrada.
              </p>
            </div>

            {/* Direct Link to the Presentation Cockpit! */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  setSuccessModalOpen(false);
                  router.push("/instrutor/apresentacao");
                }}
                className="w-full h-12 rounded-xl bg-fire-gradient-strong text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/45 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" />
                Ir para o Cockpit de Apresentação
              </button>
              <button
                onClick={() => {
                  setSuccessModalOpen(false);
                  clearAll();
                }}
                className="w-full h-11 rounded-xl bg-surface border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
              >
                Voltar ao Comercial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComercialPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando Hub Comercial...</p>
      </div>
    }>
      <ComercialContent />
    </Suspense>
  );
}
