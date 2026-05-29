"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subtheme as DBSubtheme } from "@/lib/supabase/types";
import {
  Search,
  Plus,
  BookOpen,
  Clock,
  Filter,
  Presentation,
  FileText,
  Flame,
  ShieldPlus,
  Siren,
  Car,
  Layers,
  X,
} from "lucide-react";

/* ═══ Types ═══ */
type Level = "Bronze" | "Prata" | "Ouro";
type Category = "Primeiros Socorros" | "Combate a Incêndio" | "SIPAT";

interface Subtema {
  id: number | string;
  name: string;
  level: Level;
  hours: number;
  category: Category;
  hasCanva: boolean;
  hasPDF: boolean;
  price?: number;
}

/** Converte registro do Supabase para o formato local */
function fromDB(row: DBSubtheme): Subtema {
  return {
    id: row.id,
    name: row.name,
    level: row.level as Level,
    hours: Number(row.hours),
    category: row.category as Category,
    hasCanva: !!row.canva_embed,
    hasPDF: !!row.pdf_url,
    price: Number(row.price || 0),
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ═══ Mock Data (fallback) ═══ */
const MOCK_SUBTEMAS: Subtema[] = [
  // 1. Suporte Básico de Vida (Primeiros Socorros)
  { id: "sbv-b", name: "Suporte Básico de Vida", level: "Bronze", hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "sbv-p", name: "Suporte Básico de Vida", level: "Prata",  hours: 2.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "sbv-o", name: "Suporte Básico de Vida", level: "Ouro",   hours: 3.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 2. Fraturas e Imobilizações (Primeiros Socorros)
  { id: "fra-b", name: "Fraturas e Imobilizações", level: "Bronze", hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "fra-p", name: "Fraturas e Imobilizações", level: "Prata",  hours: 1.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "fra-o", name: "Fraturas e Imobilizações", level: "Ouro",   hours: 2.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 3. Stop the Bleed (Primeiros Socorros)
  { id: "stb-b", name: "Stop the Bleed", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "stb-p", name: "Stop the Bleed", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "stb-o", name: "Stop the Bleed", level: "Ouro",   hours: 2.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 4. Transporte e Manuseio de Vítimas (Primeiros Socorros)
  { id: "tmv-b", name: "Transporte e Manuseio de Vítimas", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: false, hasPDF: true },
  { id: "tmv-p", name: "Transporte e Manuseio de Vítimas", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true,  hasPDF: true },
  { id: "tmv-o", name: "Transporte e Manuseio de Vítimas", level: "Ouro",   hours: 2.0, category: "Primeiros Socorros", hasCanva: true,  hasPDF: true },

  // 5. Casos Clínicos (Primeiros Socorros)
  { id: "cli-b", name: "Casos Clínicos", level: "Bronze", hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "cli-p", name: "Casos Clínicos", level: "Prata",  hours: 2.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "cli-o", name: "Casos Clínicos", level: "Ouro",   hours: 3.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 6. Segurança da Cena (Primeiros Socorros)
  { id: "seg-b", name: "Segurança da Cena", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "seg-p", name: "Segurança da Cena", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "seg-o", name: "Segurança da Cena", level: "Ouro",   hours: 1.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 7. Psicologia do Atendimento (Primeiros Socorros)
  { id: "psi-b", name: "Psicologia do Atendimento", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "psi-p", name: "Psicologia do Atendimento", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "psi-o", name: "Psicologia do Atendimento", level: "Ouro",   hours: 1.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 8. Ferimentos em Tecido Mole (Primeiros Socorros)
  { id: "ftm-b", name: "Ferimentos em Tecido Mole", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "ftm-p", name: "Ferimentos em Tecido Mole", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "ftm-o", name: "Ferimentos em Tecido Mole", level: "Ouro",   hours: 1.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 9. Queimaduras (Primeiros Socorros)
  { id: "que-b", name: "Queimaduras", level: "Bronze", hours: 0.5, category: "Primeiros Socorros", hasCanva: true, hasPDF: false },
  { id: "que-p", name: "Queimaduras", level: "Prata",  hours: 1.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },
  { id: "que-o", name: "Queimaduras", level: "Ouro",   hours: 2.0, category: "Primeiros Socorros", hasCanva: true, hasPDF: true  },

  // 10. Contexto Histórico do Incêndio (Combate a Incêndio)
  { id: "his-b", name: "Contexto Histórico do Incêndio", level: "Bronze", hours: 0.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "his-p", name: "Contexto Histórico do Incêndio", level: "Prata",  hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "his-o", name: "Contexto Histórico do Incêndio", level: "Ouro",   hours: 1.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 11. Uso e Manuseio de Extintores (Combate a Incêndio)
  { id: "ext-b", name: "Uso e Manuseio de Extintores", level: "Bronze", hours: 0.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "ext-p", name: "Uso e Manuseio de Extintores", level: "Prata",  hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "ext-o", name: "Uso e Manuseio de Extintores", level: "Ouro",   hours: 1.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 12. Treinamento para Evacuação (Combate a Incêndio)
  { id: "eva-b", name: "Treinamento para Evacuação", level: "Bronze", hours: 0.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "eva-p", name: "Treinamento para Evacuação", level: "Prata",  hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "eva-o", name: "Treinamento para Evacuação", level: "Ouro",   hours: 2.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 13. Incêndio em Veículos Elétricos (Combate a Incêndio)
  { id: "vel-b", name: "Incêndio em Veículos Elétricos", level: "Bronze", hours: 0.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "vel-p", name: "Incêndio em Veículos Elétricos", level: "Prata",  hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "vel-o", name: "Incêndio em Veículos Elétricos", level: "Ouro",   hours: 2.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 14. Gestão de Brigada (Combate a Incêndio)
  { id: "ges-b", name: "Gestão de Brigada", level: "Bronze", hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "ges-p", name: "Gestão de Brigada", level: "Prata",  hours: 1.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "ges-o", name: "Gestão de Brigada", level: "Ouro",   hours: 2.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 15. Sistemas e Medidas Preventivas (Combate a Incêndio)
  { id: "sys-b", name: "Sistemas e Medidas Preventivas", level: "Bronze", hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "sys-p", name: "Sistemas e Medidas Preventivas", level: "Prata",  hours: 1.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "sys-o", name: "Sistemas e Medidas Preventivas", level: "Ouro",   hours: 2.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 16. Sistema Hidráulico (Prática) (Combate a Incêndio)
  { id: "hid-b", name: "Sistema Hidráulico (Prática)", level: "Bronze", hours: 1.0, category: "Combate a Incêndio", hasCanva: false, hasPDF: true  },
  { id: "hid-p", name: "Sistema Hidráulico (Prática)", level: "Prata",  hours: 2.0, category: "Combate a Incêndio", hasCanva: true,  hasPDF: true  },
  { id: "hid-o", name: "Sistema Hidráulico (Prática)", level: "Ouro",   hours: 3.0, category: "Combate a Incêndio", hasCanva: true,  hasPDF: true  },

  // 17. Vistoria no Contexto de Brigada (Combate a Incêndio)
  { id: "vis-b", name: "Vistoria no Contexto de Brigada", level: "Bronze", hours: 0.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "vis-p", name: "Vistoria no Contexto de Brigada", level: "Prata",  hours: 1.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "vis-o", name: "Vistoria no Contexto de Brigada", level: "Ouro",   hours: 2.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 18. Atividade de Brigada de Incêndio (Combate a Incêndio)
  { id: "act-b", name: "Atividade de Brigada de Incêndio", level: "Bronze", hours: 1.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: false },
  { id: "act-p", name: "Atividade de Brigada de Incêndio", level: "Prata",  hours: 3.0, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },
  { id: "act-o", name: "Atividade de Brigada de Incêndio", level: "Ouro",   hours: 4.5, category: "Combate a Incêndio", hasCanva: true, hasPDF: true  },

  // 19. Direção Segura (SIPAT)
  { id: "dir-b", name: "Direção Segura", level: "Bronze", hours: 0.5, category: "SIPAT", hasCanva: false, hasPDF: true },
  { id: "dir-p", name: "Direção Segura", level: "Prata",  hours: 1.0, category: "SIPAT", hasCanva: true,  hasPDF: true },
  { id: "dir-o", name: "Direção Segura", level: "Ouro",   hours: 2.0, category: "SIPAT", hasCanva: true,  hasPDF: true }
];

/* ═══ Design Tokens ═══ */
const levelConfig: Record<Level, { badge: string; dot: string; label: string }> = {
  Bronze: {
    badge: "bg-amber-800/20 text-amber-500 border border-amber-700/30",
    dot: "bg-amber-500",
    label: "Teórico",
  },
  Prata: {
    badge: "bg-slate-400/20 text-slate-300 border border-slate-500/30",
    dot: "bg-slate-400",
    label: "Teórico + Prático",
  },
  Ouro: {
    badge: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-400",
    label: "Prático Intensivo",
  },
};

const categoryConfig: Record<Category, { color: string; icon: typeof Flame }> = {
  "Primeiros Socorros": { color: "text-emerald-400", icon: ShieldPlus },
  "Combate a Incêndio": { color: "text-orange-400", icon: Flame },
  "SIPAT":              { color: "text-sky-400",     icon: Car },
};

const categories: Category[] = ["Primeiros Socorros", "Combate a Incêndio", "SIPAT"];
const levels: Level[] = ["Bronze", "Prata", "Ouro"];

/* ═══ Component ═══ */
export default function SubtemasPage() {
  const [subtemas, setSubtemas] = useState<Subtema[]>(() =>
    MOCK_SUBTEMAS.map((s) => ({
      ...s,
      price: s.price || (s.level === "Bronze" ? 150 : s.level === "Prata" ? 210 : 300),
    }))
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterLevel, setFilterLevel] = useState<Level | "">("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados de Edição
  const [editingSubtheme, setEditingSubtheme] = useState<Subtema | null>(null);
  const [editName, setEditName] = useState("");
  const [editHours, setEditHours] = useState(1);
  const [editPrice, setEditPrice] = useState(150);
  const [editCategory, setEditCategory] = useState<Category>("Primeiros Socorros");
  const [editLevel, setEditLevel] = useState<Level>("Bronze");
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (sub: Subtema) => {
    setEditingSubtheme(sub);
    setEditName(sub.name);
    setEditHours(sub.hours);
    setEditPrice(sub.price || (sub.level === "Bronze" ? 150 : sub.level === "Prata" ? 210 : 300));
    setEditCategory(sub.category);
    setEditLevel(sub.level);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtheme) return;
    setSaving(true);
    
    const supabase = createClient();
    
    // 1. Tenta atualizar no Supabase se for UUID
    if (typeof editingSubtheme.id === "string" && editingSubtheme.id.length > 10) {
      const { error } = await supabase
        .from("subthemes")
        .update({
          name: editName.trim(),
          hours: Number(editHours),
          price: Number(editPrice),
          category: editCategory,
          level: editLevel
        })
        .eq("id", editingSubtheme.id);
        
      if (error) {
        console.error("Erro ao salvar subtema no Supabase:", error);
      }
    }
    
    // 2. Atualiza no estado local
    setSubtemas((prev) =>
      prev.map((s) =>
        s.id === editingSubtheme.id
          ? {
              ...s,
              name: editName.trim(),
              hours: Number(editHours),
              price: Number(editPrice),
              category: editCategory,
              level: editLevel
            }
          : s
       )
    );
    
    setEditingSubtheme(null);
    setSaving(false);
  };

  // Busca dados reais do Supabase; se falhar, mantém o mock
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("subthemes")
      .select("*")
      .eq("active", true)
      .order("category")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setSubtemas((data as DBSubtheme[]).map(fromDB));
        }
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return subtemas.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        filterCategory === "" || s.category === filterCategory;
      const matchesLevel =
        filterLevel === "" || s.level === filterLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [search, filterCategory, filterLevel]);

  const activeFiltersCount =
    (filterCategory ? 1 : 0) + (filterLevel ? 1 : 0);

  const totalHours = filtered.reduce((acc, s) => acc + s.hours, 0);

  function clearFilters() {
    setFilterCategory("");
    setFilterLevel("");
    setSearch("");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">
              Subtemas
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Blocos de conteúdo modulares — as peças de LEGO dos seus treinamentos.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-fire-gradient-strong text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          Novo Subtema
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: filtered.length, suffix: "subtemas", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
          { label: "Carga Horária", value: totalHours, suffix: "horas", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
          { label: "Categorias", value: new Set(filtered.map((s) => s.category)).size, suffix: "ativas", icon: Layers, color: "text-success", bg: "bg-success/10" },
          { label: "Níveis", value: new Set(filtered.map((s) => s.level)).size, suffix: "distintos", icon: Siren, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary/20"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-foreground leading-tight">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground truncate">{stat.suffix}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar subtema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-all duration-200 ${
              showFilters || activeFiltersCount > 0
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-card border border-border animate-slide-up">
            {/* Category Filter */}
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const cfg = categoryConfig[cat];
                  const active = filterCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(active ? "" : cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary/15 text-primary border border-primary/40 shadow-sm"
                          : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                      }`}
                    >
                      <cfg.icon className={`w-3 h-3 ${active ? "text-primary" : cfg.color}`} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Filter */}
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Nível
              </label>
              <div className="flex flex-wrap gap-2">
                {levels.map((lvl) => {
                  const cfg = levelConfig[lvl];
                  const active = filterLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setFilterLevel(active ? "" : lvl)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary/15 text-primary border border-primary/40 shadow-sm"
                          : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {lvl}
                      <span className="text-[10px] opacity-60">({cfg.label})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors whitespace-nowrap"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Exibindo <span className="text-foreground font-semibold">{filtered.length}</span> de{" "}
          <span className="text-foreground font-semibold">{subtemas.length}</span> subtemas
          {loading && <span className="ml-2 text-primary animate-pulse">· sincronizando...</span>}
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((sub, i) => {
            const lvl = levelConfig[sub.level];
            const cat = categoryConfig[sub.category];
            return (
              <div
                key={sub.id}
                onClick={() => handleOpenEdit(sub)}
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Top Row: Level Badge + Hours & Price */}
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${lvl.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                    {sub.level}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {sub.hours}h
                      </span>
                    </div>
                    <div className="text-xs font-bold text-primary">
                      {formatCurrency(sub.price || 0)}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors leading-snug">
                  {sub.name}
                </h3>

                {/* Level Description */}
                <p className="text-[11px] text-muted-foreground mb-4">
                  {lvl.label}
                </p>

                {/* Category Tag */}
                <div className="flex items-center gap-1.5 mb-4">
                  <cat.icon className={`w-3 h-3 ${cat.color}`} />
                  <span className={`text-[11px] font-medium ${cat.color}`}>
                    {sub.category}
                  </span>
                </div>

                {/* Bottom: Linked content badges */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {sub.hasCanva && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-medium">
                      <Presentation className="w-3 h-3" />
                      Apresentação vinculada
                    </span>
                  )}
                  {sub.hasPDF && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-medium">
                      <FileText className="w-3 h-3" />
                      Apostila vinculada
                    </span>
                  )}
                  {!sub.hasCanva && !sub.hasPDF && (
                    <span className="text-[10px] text-muted-foreground italic">
                      Sem conteúdo vinculado
                    </span>
                  )}
                </div>

                {/* Hover glow overlay */}
                <div className="absolute inset-0 bg-fire-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nenhum subtema encontrado
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tente ajustar os filtros ou o termo de busca para encontrar os blocos de conteúdo desejados.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        </div>
      )}

      {/* ═══ MODAL: Editar Subtema do Catálogo ═══ */}
      {editingSubtheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-base font-bold text-foreground">Editar Subtema do Catálogo</h3>
              </div>
              <button
                onClick={() => setEditingSubtheme(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome do Subtema</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  required
                />
              </div>

              {/* Category & Level (Selects) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="w-full h-10 px-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Primeiros Socorros">Primeiros Socorros</option>
                    <option value="Combate a Incêndio">Combate a Incêndio</option>
                    <option value="SIPAT">SIPAT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nível</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as Level)}
                    className="w-full h-10 px-2 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Prata">Prata</option>
                    <option value="Ouro">Ouro</option>
                  </select>
                </div>
              </div>

              {/* Hours & Price (Numbers) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Carga Horária (horas)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Preço Padrão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingSubtheme(null)}
                  className="flex-1 h-11 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-fire-gradient-strong text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
