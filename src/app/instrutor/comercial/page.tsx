"use client";

import { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

type Level = "Bronze" | "Prata" | "Ouro";
type Category = "Primeiros Socorros" | "Combate a Incêndio" | "SIPAT";

interface Subtheme {
  id: string;
  name: string;
  category: Category;
  level: Level;
  hours: number;
  price: number;
  mandatory?: boolean; // Required for Brigada IN28
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

/* ═══════════════════════════════════════════════════
   MOCK DATA — 19 Subthemes
   ═══════════════════════════════════════════════════ */

const LEVEL_PRICES: Record<Level, number> = {
  Bronze: 150,
  Prata: 210,
  Ouro: 300,
};

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

const subthemes: Subtheme[] = [
  // ── Primeiros Socorros ──
  { id: "ps-01", name: "Suporte Básico de Vida (SBV)", category: "Primeiros Socorros", level: "Prata", hours: 2, price: LEVEL_PRICES.Prata, mandatory: true },
  { id: "ps-02", name: "Desfibrilador Externo Automático (DEA)", category: "Primeiros Socorros", level: "Ouro", hours: 1.5, price: LEVEL_PRICES.Ouro },
  { id: "ps-03", name: "Imobilização e Transporte de Vítimas", category: "Primeiros Socorros", level: "Bronze", hours: 1.5, price: LEVEL_PRICES.Bronze, mandatory: true },
  { id: "ps-04", name: "Stop the Bleed — Controle de Hemorragias", category: "Primeiros Socorros", level: "Prata", hours: 1, price: LEVEL_PRICES.Prata },
  { id: "ps-05", name: "Queimaduras e Lesões Térmicas", category: "Primeiros Socorros", level: "Bronze", hours: 1, price: LEVEL_PRICES.Bronze, mandatory: true },
  { id: "ps-06", name: "Emergências Clínicas (Desmaio, Convulsão, AVC)", category: "Primeiros Socorros", level: "Prata", hours: 1.5, price: LEVEL_PRICES.Prata },
  { id: "ps-07", name: "Psicologia do Atendimento de Emergência", category: "Primeiros Socorros", level: "Bronze", hours: 0.5, price: LEVEL_PRICES.Bronze },

  // ── Combate a Incêndio ──
  { id: "ci-01", name: "Teoria do Fogo e Triângulo do Fogo", category: "Combate a Incêndio", level: "Bronze", hours: 1, price: LEVEL_PRICES.Bronze, mandatory: true },
  { id: "ci-02", name: "Uso e Manuseio de Extintores", category: "Combate a Incêndio", level: "Ouro", hours: 1.5, price: LEVEL_PRICES.Ouro, mandatory: true },
  { id: "ci-03", name: "Hidrantes e Mangueiras de Combate", category: "Combate a Incêndio", level: "Ouro", hours: 2, price: LEVEL_PRICES.Ouro },
  { id: "ci-04", name: "Evacuação de Edificações", category: "Combate a Incêndio", level: "Bronze", hours: 1, price: LEVEL_PRICES.Bronze, mandatory: true },
  { id: "ci-05", name: "Abandono de Área e Ponto de Encontro", category: "Combate a Incêndio", level: "Bronze", hours: 0.5, price: LEVEL_PRICES.Bronze, mandatory: true },
  { id: "ci-06", name: "Ventilação Tática (PPV)", category: "Combate a Incêndio", level: "Ouro", hours: 2, price: LEVEL_PRICES.Ouro },
  { id: "ci-07", name: "Resgate em Espaço Confinado", category: "Combate a Incêndio", level: "Ouro", hours: 2.5, price: LEVEL_PRICES.Ouro },

  // ── SIPAT ──
  { id: "sp-01", name: "Prevenção de Acidentes no Trabalho", category: "SIPAT", level: "Bronze", hours: 1, price: LEVEL_PRICES.Bronze },
  { id: "sp-02", name: "Ergonomia e Saúde Ocupacional", category: "SIPAT", level: "Bronze", hours: 1, price: LEVEL_PRICES.Bronze },
  { id: "sp-03", name: "Gestão de Riscos e Mapeamento de Perigos", category: "SIPAT", level: "Prata", hours: 1.5, price: LEVEL_PRICES.Prata },
  { id: "sp-04", name: "NRs Aplicáveis (NR-23, NR-10, NR-35)", category: "SIPAT", level: "Prata", hours: 2, price: LEVEL_PRICES.Prata },
  { id: "sp-05", name: "Cultura de Segurança e Liderança", category: "SIPAT", level: "Ouro", hours: 1.5, price: LEVEL_PRICES.Ouro },
];

/* ── IN28 mandatory IDs ── */
const IN28_MANDATORY_IDS = subthemes.filter((s) => s.mandatory).map((s) => s.id);

/* ── Base Combos ── */
const comboOptions: ComboOption[] = [
  {
    key: "customizado",
    label: "Customizado",
    price: 0,
    hours: 0,
    requiredIds: [],
  },
  {
    key: "basica-8h",
    label: "Brigada Básica 8h",
    price: 2400,
    hours: 8,
    requiredIds: ["ps-01", "ps-03", "ps-05", "ci-01", "ci-02", "ci-04", "ci-05"],
  },
  {
    key: "intermediaria-16h",
    label: "Brigada Intermediária 16h",
    price: 4800,
    hours: 16,
    requiredIds: ["ps-01", "ps-03", "ps-04", "ps-05", "ps-06", "ci-01", "ci-02", "ci-03", "ci-04", "ci-05"],
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
    requiredIds: ["ps-01", "ps-03", "ps-05", "ps-07"],
  },
];

/* ═══════════════════════════════════════════════════
   FORMATTERS
   ═══════════════════════════════════════════════════ */

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatHours(h: number): string {
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1).replace(".", ",")}h`;
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export default function ComercialPage() {
  const [selectedCombo, setSelectedCombo] = useState<ComboKey>("customizado");
  const [selectedItems, setSelectedItems] = useState<SelectedSubtheme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(["Primeiros Socorros", "Combate a Incêndio", "SIPAT"])
  );
  const [comboDropdownOpen, setComboDropdownOpen] = useState(false);

  /* ── Derived Data ── */
  const activeCombo = comboOptions.find((c) => c.key === selectedCombo)!;
  const isBrigadaPackage = ["basica-8h", "intermediaria-16h", "avancada-40h"].includes(selectedCombo);

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((si) => si.subtheme.id)),
    [selectedItems]
  );

  const comboSubthemeIds = useMemo(
    () => new Set(activeCombo.requiredIds),
    [activeCombo]
  );

  /* Items that belong to the combo vs add-ons */
  const comboItems = useMemo(
    () => selectedItems.filter((si) => comboSubthemeIds.has(si.subtheme.id)),
    [selectedItems, comboSubthemeIds]
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
    if (!searchQuery.trim()) return subthemes;
    const q = searchQuery.toLowerCase();
    return subthemes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
          const sub = subthemes.find((s) => s.id === reqId);
          if (sub) newItems.push({ subtheme: sub, quantity: 1 });
        }
      }
      setSelectedItems(newItems);
    },
    [selectedItems]
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

  return (
    <div className="animate-fade-in h-full flex flex-col">
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
                Monte propostas e ementas para reuniões com clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Badge */}
        {isBrigadaPackage && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              complianceStatus.compliant
                ? "bg-success/10 text-success border border-success/30"
                : "bg-warning/10 text-warning border border-warning/30 animate-pulse-glow"
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
                {complianceStatus.missing.length} itens obrigatórios pendentes
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Main Layout ── */}
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
                <h2 className="text-sm font-semibold text-foreground">
                  Montagem de Trilha
                </h2>
                <span className="text-[11px] text-muted-foreground ml-1">
                  ({subthemes.length} subtemas disponíveis)
                </span>
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
              {(Object.entries(groupedSubthemes) as [Category, Subtheme[]][]).map(
                ([category, items]) => (
                  <div key={category}>
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-surface/50 border-b border-border hover:bg-surface transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{categoryIcons[category]}</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({items.length})
                        </span>
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
                          const isMissing =
                            isBrigadaPackage &&
                            complianceStatus.missing.includes(sub.id);
                          const isPresent =
                            isBrigadaPackage &&
                            complianceStatus.present.includes(sub.id);

                          return (
                            <div
                              key={sub.id}
                              onClick={() => !isSelected && addSubtheme(sub)}
                              className={`
                                group flex items-center gap-4 px-5 py-3.5 transition-all duration-200 
                                ${isSelected
                                  ? "bg-primary/5 cursor-default"
                                  : "hover:bg-surface/70 cursor-pointer"
                                }
                              `}
                            >
                              {/* Grip / Status Indicator */}
                              <div className="flex-shrink-0 w-5">
                                {isPresent && (
                                  <CheckCircle2 className="w-4 h-4 text-success" />
                                )}
                                {isMissing && (
                                  <AlertTriangle className="w-4 h-4 text-destructive" />
                                )}
                                {!isPresent && !isMissing && (
                                  <GripVertical className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`text-sm font-medium truncate transition-colors ${
                                      isSelected
                                        ? "text-primary"
                                        : "text-foreground group-hover:text-primary"
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
                                    <Clock className="w-3 h-3" />
                                    {formatHours(sub.hours)}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(sub.price)}
                                  </span>
                                </div>
                              </div>

                              {/* Level Badge */}
                              <span
                                className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border ${levelColors[sub.level]}`}
                              >
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${levelDot[sub.level]}`}
                                />
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
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              )}
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
                <h2 className="text-sm font-semibold text-foreground">
                  Resumo da Proposta
                </h2>
              </div>
              {selectedItems.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] text-destructive hover:text-destructive/80 font-medium transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {/* Combo Selector */}
            <div className="px-5 py-3 border-b border-border flex-shrink-0">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Pacote Base
              </label>
              <div className="relative">
                <button
                  onClick={() => setComboDropdownOpen(!comboDropdownOpen)}
                  className="w-full flex items-center justify-between h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-primary" />
                    {activeCombo.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      comboDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {comboDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setComboDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg bg-card border border-border shadow-xl shadow-black/30 overflow-hidden animate-fade-in">
                      {comboOptions.map((combo) => (
                        <button
                          key={combo.key}
                          onClick={() => handleComboChange(combo.key)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                            combo.key === selectedCombo
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-surface"
                          }`}
                        >
                          <span className="font-medium">{combo.label}</span>
                          {combo.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(combo.price)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Combo Price Info */}
              {selectedCombo !== "customizado" && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Shield className="w-3 h-3 text-primary" />
                  Preço base do pacote: {formatCurrency(activeCombo.price)} —{" "}
                  {formatHours(activeCombo.hours)}
                </div>
              )}
            </div>

            {/* Selected Subthemes List */}
            <div className="flex-1 overflow-y-auto">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Nenhum subtema selecionado
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Clique nos subtemas à esquerda ou selecione um pacote base.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Combo Items Section */}
                  {comboItems.length > 0 && selectedCombo !== "customizado" && (
                    <div>
                      <div className="px-5 py-2 bg-primary/5 border-b border-border">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          Incluído no Pacote
                        </span>
                      </div>
                      <div className="divide-y divide-border/50">
                        {comboItems.map((si) => (
                          <SelectedSubthemeRow
                            key={si.subtheme.id}
                            item={si}
                            isComboItem
                            onRemove={removeSubtheme}
                            onUpdateQty={updateQuantity}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-ons Section */}
                  {(addOnItems.length > 0 || selectedCombo === "customizado") && (
                    <div>
                      {selectedCombo !== "customizado" && addOnItems.length > 0 && (
                        <div className="px-5 py-2 bg-accent/5 border-b border-border">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                            Adicionais
                          </span>
                        </div>
                      )}
                      <div className="divide-y divide-border/50">
                        {(selectedCombo === "customizado" ? selectedItems : addOnItems).map(
                          (si) => (
                            <SelectedSubthemeRow
                              key={si.subtheme.id}
                              item={si}
                              isComboItem={false}
                              onRemove={removeSubtheme}
                              onUpdateQty={updateQuantity}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            <div className="border-t border-border flex-shrink-0">
              {/* Pricing Tiers Legend */}
              <div className="px-5 py-3 border-b border-border/50">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Referência de Níveis
                </p>
                <div className="flex items-center gap-3">
                  {(["Bronze", "Prata", "Ouro"] as Level[]).map((lvl) => (
                    <div key={lvl} className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${levelDot[lvl]}`}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {lvl}: {formatCurrency(LEVEL_PRICES[lvl])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Total de Horas
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatHours(totalHours)}
                  </span>
                </div>
                {selectedCombo !== "customizado" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pacote Base</span>
                      <span className="text-foreground">
                        {formatCurrency(activeCombo.price)}
                      </span>
                    </div>
                    {addOnItems.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Adicionais</span>
                        <span className="text-foreground">
                          +{" "}
                          {formatCurrency(
                            addOnItems.reduce(
                              (sum, si) => sum + si.subtheme.price * si.quantity,
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Total da Proposta
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* IN28 compliance (in panel) */}
              {isBrigadaPackage && (
                <div
                  className={`mx-5 mb-3 px-3 py-2.5 rounded-lg text-[11px] font-medium flex items-center gap-2 ${
                    complianceStatus.compliant
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {complianceStatus.compliant ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      Trilha conforme IN28 — todos os itens obrigatórios incluídos.
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Faltam {complianceStatus.missing.length} subtema(s) obrigatório(s) pela IN28.
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                <button
                  disabled={selectedItems.length === 0}
                  className="w-full h-11 rounded-lg bg-fire-gradient-strong text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Proposta
                </button>
                <button
                  disabled={selectedItems.length === 0}
                  className="w-full h-11 rounded-lg bg-surface border border-border text-foreground text-sm font-semibold transition-all duration-200 hover:bg-surface/80 hover:border-primary/30 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Exportar Ementa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUB-COMPONENT: Selected Subtheme Row
   ═══════════════════════════════════════════════════ */

function SelectedSubthemeRow({
  item,
  isComboItem,
  onRemove,
  onUpdateQty,
}: {
  item: SelectedSubtheme;
  isComboItem: boolean;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
}) {
  const { subtheme, quantity } = item;

  return (
    <div className="group flex items-center gap-3 px-5 py-3 hover:bg-surface/30 transition-colors">
      {/* Level dot */}
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full ${levelDot[subtheme.level]}`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium text-foreground truncate">
          {subtheme.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatHours(subtheme.hours)}
          </span>
          {!isComboItem && (
            <span className="text-[10px] text-muted-foreground">
              {formatCurrency(subtheme.price * quantity)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onUpdateQty(subtheme.id, -1)}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-xs font-semibold text-foreground">
          {quantity}
        </span>
        <button
          onClick={() => onUpdateQty(subtheme.id, 1)}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(subtheme.id)}
        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
