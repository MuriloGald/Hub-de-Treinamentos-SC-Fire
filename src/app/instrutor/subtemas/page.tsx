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
  };
}

/* ═══ Mock Data (fallback) ═══ */
const MOCK_SUBTEMAS: Subtema[] = [
  { id: 1,  name: "Suporte Básico de Vida",           level: "Prata",  hours: 2,   category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 2,  name: "Uso e Manuseio de Extintores",     level: "Ouro",   hours: 1.5, category: "Combate a Incêndio",   hasCanva: true,  hasPDF: true  },
  { id: 3,  name: "Stop the Bleed",                   level: "Prata",  hours: 1,   category: "Primeiros Socorros",   hasCanva: true,  hasPDF: false },
  { id: 4,  name: "Fraturas e Imobilizações",         level: "Prata",  hours: 1.5, category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 5,  name: "Transporte e Manuseio de Vítimas", level: "Ouro",   hours: 1,   category: "Primeiros Socorros",   hasCanva: false, hasPDF: true  },
  { id: 6,  name: "Casos Clínicos",                   level: "Ouro",   hours: 2,   category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 7,  name: "Segurança da Cena",                level: "Bronze", hours: 0.5, category: "Primeiros Socorros",   hasCanva: true,  hasPDF: false },
  { id: 8,  name: "Psicologia do Atendimento",        level: "Bronze", hours: 0.5, category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 9,  name: "Contexto Histórico do Incêndio",   level: "Bronze", hours: 1,   category: "Combate a Incêndio",   hasCanva: true,  hasPDF: false },
  { id: 10, name: "Atividade de Brigada de Incêndio",  level: "Ouro",   hours: 3,   category: "Combate a Incêndio",   hasCanva: true,  hasPDF: true  },
  { id: 11, name: "Treinamento para Evacuação",        level: "Prata",  hours: 1,   category: "Combate a Incêndio",   hasCanva: true,  hasPDF: true  },
  { id: 12, name: "Incêndio em Veículos Elétricos",    level: "Prata",  hours: 1,   category: "Combate a Incêndio",   hasCanva: true,  hasPDF: false },
  { id: 13, name: "Direção Segura",                    level: "Bronze", hours: 1,   category: "SIPAT",                hasCanva: false, hasPDF: true  },
  { id: 14, name: "Ferimentos em Tecido Mole",         level: "Bronze", hours: 1,   category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 15, name: "Queimaduras",                       level: "Prata",  hours: 1,   category: "Primeiros Socorros",   hasCanva: true,  hasPDF: true  },
  { id: 16, name: "Gestão de Brigada",                 level: "Bronze", hours: 1.5, category: "Combate a Incêndio",   hasCanva: true,  hasPDF: false },
  { id: 17, name: "Sistemas e Medidas Preventivas",    level: "Bronze", hours: 1.5, category: "Combate a Incêndio",   hasCanva: true,  hasPDF: true  },
  { id: 18, name: "Sistema Hidráulico (Prática)",      level: "Ouro",   hours: 2,   category: "Combate a Incêndio",   hasCanva: false, hasPDF: true  },
  { id: 19, name: "Vistoria no Contexto de Brigada",   level: "Bronze", hours: 1,   category: "Combate a Incêndio",   hasCanva: true,  hasPDF: false },
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
  const [subtemas, setSubtemas] = useState<Subtema[]>(MOCK_SUBTEMAS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterLevel, setFilterLevel] = useState<Level | "">("");
  const [showFilters, setShowFilters] = useState(false);

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
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Top Row: Level Badge + Hours */}
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${lvl.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                    {sub.level}
                  </span>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold text-foreground">
                      {sub.hours}h
                    </span>
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
    </div>
  );
}
