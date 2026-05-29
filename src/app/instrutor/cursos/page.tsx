"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CourseCombo, Subtheme } from "@/lib/supabase/types";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Clock,
  DollarSign,
  Layers,
  ChevronRight,
  CheckCircle2,
  X,
  AlertTriangle,
  Flame,
  ShieldPlus,
  Car,
} from "lucide-react";

/* ═══ Types ═══ */
type Level = "Bronze" | "Prata" | "Ouro";
type Category = "Primeiros Socorros" | "Combate a Incêndio" | "SIPAT";

interface ComboWithSubthemes extends CourseCombo {
  subthemeIds: string[];
}

/* ═══ Design Helpers ═══ */
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

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatHours(h: number): string {
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1).replace(".", ",")}h`;
}

/* ═══ MOCK DATA FALLBACKS ═══ */
const MOCK_COMBOS: ComboWithSubthemes[] = [
  { id: "1", key: "basica-8h", label: "Brigada Básica 8h", price: 2400, hours: 8, active: true, created_at: "", updated_at: "", subthemeIds: [] },
  { id: "2", key: "intermediaria-16h", label: "Brigada Intermediária 16h", price: 4800, hours: 16, active: true, created_at: "", updated_at: "", subthemeIds: [] },
  { id: "3", key: "avancada-40h", label: "Brigada Avançada 40h", price: 12000, hours: 40, active: true, created_at: "", updated_at: "", subthemeIds: [] },
  { id: "4", key: "lei-lucas", label: "Lei Lucas", price: 1800, hours: 6, active: true, created_at: "", updated_at: "", subthemeIds: [] },
  { id: "5", key: "reciclagem", label: "Reciclagem (Customizada)", price: 2000, hours: 8, active: true, created_at: "", updated_at: "", subthemeIds: [] }
];

export default function CursosPage() {
  const supabase = createClient();

  /* ═══ States ═══ */
  const [combos, setCombos] = useState<ComboWithSubthemes[]>(MOCK_COMBOS);
  const [subthemes, setSubthemes] = useState<Subtheme[]>([]);
  const [loading, setLoading] = useState(true);

  // States para Edição de Combo
  const [editingCombo, setEditingCombo] = useState<ComboWithSubthemes | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editHours, setEditHours] = useState(0);
  const [editSubthemeIds, setEditSubthemeIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  /* ═══ Fetch Data from Supabase ═══ */
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Carrega subtemas ativos
        const { data: subData, error: subError } = await supabase
          .from("subthemes")
          .select("*")
          .eq("active", true);

        if (subError) throw subError;
        setSubthemes(subData || []);

        // 2. Carrega combos cadastrados
        const { data: comboData, error: comboError } = await supabase
          .from("course_combos")
          .select("*")
          .eq("active", true);

        if (comboError) throw comboError;

        if (comboData && comboData.length > 0) {
          // 3. Para cada combo, resgata as relações em combo_subthemes
          const loadedCombos: ComboWithSubthemes[] = [];

          for (const combo of comboData) {
            const { data: linkData, error: linkError } = await supabase
              .from("combo_subthemes")
              .select("subtheme_id")
              .eq("combo_id", combo.id);

            if (!linkError && linkData) {
              loadedCombos.push({
                ...combo,
                price: Number(combo.price),
                hours: Number(combo.hours),
                subthemeIds: linkData.map((l: any) => l.subtheme_id),
              });
            } else {
              loadedCombos.push({
                ...combo,
                price: Number(combo.price),
                hours: Number(combo.hours),
                subthemeIds: [],
              });
            }
          }
          setCombos(loadedCombos);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase na aba Cursos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  /* ═══ Open Editing Panel ═══ */
  const handleOpenEdit = (combo: ComboWithSubthemes) => {
    setEditingCombo(combo);
    setEditLabel(combo.label);
    setEditPrice(combo.price);
    setEditHours(combo.hours);
    setEditSubthemeIds(new Set(combo.subthemeIds));
  };

  /* ═══ Toggle Subtheme Checklist ═══ */
  const handleToggleSubtheme = (id: string) => {
    setEditSubthemeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ═══ Save/Persist to Supabase and State ═══ */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCombo) return;
    setSaving(true);

    try {
      const newSubthemeIds = Array.from(editSubthemeIds);

      // 1. Tenta persistir no Supabase se o ID for UUID válido
      if (editingCombo.id.length > 10) {
        // A. Atualiza cabeçalho do combo
        const { error: updateError } = await supabase
          .from("course_combos")
          .update({
            label: editLabel.trim(),
            price: Number(editPrice),
            hours: Number(editHours),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCombo.id);

        if (updateError) throw updateError;

        // B. Atualiza as relações em combo_subthemes (deleta antigas, insere novas)
        const { error: deleteError } = await supabase
          .from("combo_subthemes")
          .delete()
          .eq("combo_id", editingCombo.id);

        if (deleteError) throw deleteError;

        if (newSubthemeIds.length > 0) {
          const linksToInsert = newSubthemeIds.map((subId) => ({
            combo_id: editingCombo.id,
            subtheme_id: subId,
          }));

          const { error: insertError } = await supabase
            .from("combo_subthemes")
            .insert(linksToInsert);

          if (insertError) throw insertError;
        }
      }

      // 2. Atualiza localmente
      setCombos((prev) =>
        prev.map((c) =>
          c.id === editingCombo.id
            ? {
                ...c,
                label: editLabel.trim(),
                price: Number(editPrice),
                hours: Number(editHours),
                subthemeIds: newSubthemeIds,
              }
            : c
        )
      );

      setEditingCombo(null);
    } catch (err) {
      console.error("Erro ao salvar combo de treinamento no banco:", err);
      alert("Houve um erro ao salvar os dados no banco de dados. Salvamos no estado local temporário.");
      
      // Fallback local caso dê erro (ex: migração SQL não executada no Supabase ainda)
      setCombos((prev) =>
        prev.map((c) =>
          c.id === editingCombo!.id
            ? {
                ...c,
                label: editLabel.trim(),
                price: Number(editPrice),
                hours: Number(editHours),
                subthemeIds: Array.from(editSubthemeIds),
              }
            : c
        )
      );
      setEditingCombo(null);
    } finally {
      setSaving(false);
    }
  };

  /* ═══ Group Subthemes for Checklist ═══ */
  const groupedSubthemes = useMemo(() => {
    const groups: Record<Category, Subtheme[]> = {
      "Primeiros Socorros": [],
      "Combate a Incêndio": [],
      "SIPAT": [],
    };
    for (const s of subthemes) {
      const cat = (s.category || "Primeiros Socorros") as Category;
      if (groups[cat]) {
        groups[cat].push(s);
      }
    }
    return groups;
  }, [subthemes]);

  /* ── Derived Metrics ── */
  const totalCombos = combos.length;
  const avgHours = useMemo(() => {
    const total = combos.reduce((acc, c) => acc + c.hours, 0);
    return total / (combos.length || 1);
  }, [combos]);
  const avgPrice = useMemo(() => {
    const total = combos.reduce((acc, c) => acc + c.price, 0);
    return total / (combos.length || 1);
  }, [combos]);
  const activeSubthemesInCombos = useMemo(() => {
    const set = new Set<string>();
    combos.forEach((c) => c.subthemeIds.forEach((id) => set.add(id)));
    return set.size;
  }, [combos]);

  return (
    <div className="space-y-6 animate-fade-in text-foreground bg-background">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-fire-gradient-strong flex items-center justify-center shadow-md shadow-primary/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Cursos & Combos
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Configure os pacotes oficiais de treinamento, preços de tabela e as matérias integrantes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total de Cursos", value: totalCombos, suffix: "pacotes cadastrados", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
          { label: "Carga Horária Média", value: avgHours.toFixed(0), suffix: "horas por curso", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
          { label: "Preço Médio Tabela", value: formatCurrency(avgPrice), suffix: "por treinamento", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          { label: "Matérias Associadas", value: activeSubthemesInCombos, suffix: "blocos estruturados", icon: BookOpen, color: "text-warning", bg: "bg-warning/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary/20"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-foreground leading-tight">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground truncate">{stat.suffix}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Help Callout ── */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-primary">Regra Especial: Reciclagem Dinâmica</h4>
          <p className="text-[11px] text-muted-foreground/90 mt-0.5 leading-relaxed">
            O curso de **Reciclagem** é configurado de forma inteligente. As matérias definidas por você abaixo servem como uma ementa sugerida inicial.
            No entanto, no **Hub Comercial**, a Reciclagem é tratada de forma totalmente customizável ("À escolha do comercial") para que o vendedor monte a trilha ideal para o cliente sem bloqueios ou imposições.
          </p>
        </div>
      </div>

      {/* ── Combos Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Sincronizando combos de cursos do Supabase...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {combos.map((combo) => {
            const isReciclagem = combo.key === "reciclagem";
            return (
              <div
                key={combo.id}
                onClick={() => handleOpenEdit(combo)}
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[190px]"
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {isReciclagem ? "Vendas Livres" : "Combo Oficial"}
                    </span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        {formatHours(combo.hours)}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {combo.label}
                  </h3>

                  {/* Subthemes Summary list */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Matérias Integrantes:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {combo.subthemeIds.length > 0 ? (
                        combo.subthemeIds.map((subId) => {
                          const sub = subthemes.find((s) => s.id === subId);
                          if (!sub) return null;
                          return (
                            <span key={subId} className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-foreground font-medium">
                              {sub.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Nenhuma matéria vinculada. Clique para adicionar!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-4 flex-shrink-0">
                  <div className="text-xs font-black text-primary">
                    {formatCurrency(combo.price)}
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Editar Configuração <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Hover overlay glow */}
                <div className="absolute inset-0 bg-fire-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ MODAL: Configurar Curso (Combo & Matérias) ═══ */}
      {editingCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-base font-bold text-foreground">Configurar Estrutura do Curso</h3>
              </div>
              <button
                onClick={() => setEditingCombo(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Name / Price / Hours Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Nome do Curso / Combo</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Preço de Tabela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Duração Recomendada (horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Subtheme Picker checklist */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Selecionar Matérias Integrantes</h4>
                  <p className="text-[10px] text-muted-foreground">Selecione quais blocos modulares compõem a grade deste curso padrão:</p>
                </div>

                {/* Subthemes grouped layout */}
                <div className="space-y-4 border border-border/60 rounded-xl p-4 bg-surface/20 max-h-[350px] overflow-y-auto">
                  {(Object.entries(groupedSubthemes) as [Category, Subtheme[]][]).map(([category, items]) => {
                    if (items.length === 0) return null;
                    const catCfg = categoryConfig[category];
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-border/50 pb-1 flex-shrink-0">
                          <catCfg.icon className={`w-3.5 h-3.5 ${catCfg.color}`} />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${catCfg.color}`}>
                            {category}
                          </span>
                        </div>

                        {/* Checklist items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((sub) => {
                            const isChecked = editSubthemeIds.has(sub.id);
                            const lvl = levelConfig[sub.level as Level];
                            return (
                              <div
                                key={sub.id}
                                onClick={() => handleToggleSubtheme(sub.id)}
                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-primary/5 border-primary/40 shadow-sm"
                                    : "bg-surface border-border hover:bg-surface/75 hover:border-primary/20"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                    isChecked ? "bg-primary border-primary text-white" : "border-border bg-card"
                                  }`}>
                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-foreground truncate">{sub.name}</div>
                                    <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatHours(Number(sub.hours))}
                                    </div>
                                  </div>
                                </div>

                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${lvl.badge} flex-shrink-0`}>
                                  {sub.level}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingCombo(null)}
                  className="flex-1 h-11 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-fire-gradient-strong text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {saving ? "Salvando..." : "Salvar Configuração"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
