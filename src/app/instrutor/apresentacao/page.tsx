"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  QrCode,
  Timer,
  Users,
  Building2,
  BookOpen,
  Zap,
  Radio,
  MonitorPlay,
  SkipBack,
  SkipForward,
  Library,
  X,
  Square,
  Flame,
  Sparkles,
  Signal,
  Clock,
  Search,
  GraduationCap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK DATA — Será substituído por Supabase
   ═══════════════════════════════════════════════════ */

const trainingInfo = {
  name: "Brigada Intermediária (16h)",
  company: "Metalúrgica Aço Forte",
  students: 24,
};

const subthemes = [
  { id: 1, title: "Contexto Histórico", duration: "1h30", completed: true },
  { id: 2, title: "Uso e Manuseio de Extintores", duration: "2h", completed: false },
  { id: 3, title: "Evacuação de Edificações", duration: "2h", completed: false },
  { id: 4, title: "Suporte Básico de Vida", duration: "2h30", completed: false },
  { id: 5, title: "Stop the Bleed", duration: "1h30", completed: false },
  { id: 6, title: "Fraturas e Imobilizações", duration: "2h", completed: false },
  { id: 7, title: "Sistema Hidráulico", duration: "2h30", completed: false },
  { id: 8, title: "Queimaduras", duration: "2h", completed: false },
];

/* ═══ Timer Hook ═══ */
function useTimer() {
  const [seconds, setSeconds] = useState(2732); // 00:45:32
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatted = [
    String(Math.floor(seconds / 3600)).padStart(2, "0"),
    String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
    String(seconds % 60).padStart(2, "0"),
  ].join(":");

  return { seconds, formatted, running, toggle: () => setRunning((r) => !r) };
}

/* ═══════════════════════════════════════════════════
   PRESENTATION HUB PAGE
   ═══════════════════════════════════════════════════ */

export default function ApresentacaoPage() {
  const [activeIndex, setActiveIndex] = useState(1); // "Uso e Manuseio de Extintores"
  const [interactionMode, setInteractionMode] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const timer = useTimer();

  const completedCount = subthemes.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / subthemes.length) * 100);
  const activeSubtheme = subthemes[activeIndex];

  const goToSubtheme = useCallback(
    (index: number) => {
      if (index >= 0 && index < subthemes.length) {
        setActiveIndex(index);
        setLibraryOpen(false);
      }
    },
    []
  );

  /* Keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToSubtheme(Math.min(activeIndex + 1, subthemes.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToSubtheme(Math.max(activeIndex - 1, 0));
      } else if (e.key === "Escape") {
        setLibraryOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToSubtheme]);

  return (
    <div className="flex flex-col h-full -m-4 lg:-m-6 animate-fade-in">
      {/* ═══ Main 3-Column Area ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Subthemes Sidebar ── */}
        <aside
          className={`
            relative flex flex-col border-r border-border bg-card/50
            transition-all duration-300 ease-in-out flex-shrink-0
            ${sidebarCollapsed ? "w-[52px]" : "w-[260px] xl:w-[280px]"}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border flex-shrink-0">
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    Roteiro
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-fire-gradient-strong transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                    {completedCount}/{subthemes.length}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors flex-shrink-0"
              title={sidebarCollapsed ? "Expandir roteiro" : "Recolher roteiro"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Subtheme List */}
          <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {subthemes.map((sub, i) => {
              const isActive = i === activeIndex;
              const isCompleted = sub.completed;

              return (
                <button
                  key={sub.id}
                  onClick={() => goToSubtheme(i)}
                  title={sidebarCollapsed ? sub.title : undefined}
                  className={`
                    group w-full flex items-center gap-2.5 rounded-lg transition-all duration-200
                    ${sidebarCollapsed ? "justify-center px-1 py-2.5" : "px-3 py-2.5 text-left"}
                    ${
                      isActive
                        ? "bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10"
                        : "hover:bg-surface/60 border border-transparent"
                    }
                  `}
                >
                  {/* Step Number / Check */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                      text-[10px] font-bold transition-all duration-200
                      ${
                        isCompleted
                          ? "bg-success/20 text-success"
                          : isActive
                            ? "bg-primary text-white shadow-md shadow-primary/30"
                            : "bg-surface text-muted-foreground group-hover:bg-muted"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>

                  {/* Label */}
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0 animate-fade-in">
                      <span
                        className={`
                          text-xs font-medium leading-tight block truncate
                          ${
                            isActive
                              ? "text-primary"
                              : isCompleted
                                ? "text-muted-foreground line-through"
                                : "text-foreground/80 group-hover:text-foreground"
                          }
                        `}
                      >
                        {sub.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        {sub.duration}
                      </span>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && !sidebarCollapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── CENTER: Presentation Area ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Subtle Bar — Shows current subtheme name */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card/30 flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MonitorPlay className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                {activeSubtheme.title}
              </span>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-surface">
                {activeIndex + 1} de {subthemes.length}
              </span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                AO VIVO
              </span>
            </div>
          </div>

          {/* Presentation Canvas */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Placeholder Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 animate-slide-up">
              {/* Glowing icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-fire-gradient-strong flex items-center justify-center shadow-2xl shadow-primary/30 animate-float">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <div className="absolute -inset-2 bg-fire-gradient-strong rounded-2xl opacity-20 blur-xl animate-pulse-glow" />
              </div>

              <div className="space-y-3 max-w-md">
                <h2 className="text-2xl font-bold text-foreground">
                  Selecione uma turma para iniciar
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A apresentação Canva será exibida aqui. Selecione um subtema no
                  roteiro à esquerda ou inicie a apresentação completa.
                </p>
              </div>

              {/* Quick action */}
              <button className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.97]">
                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                Iniciar Apresentação
              </button>

              {/* Keyboard hint */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
                    ←
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
                    →
                  </kbd>
                  <span>Navegar subtemas</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
                    ESC
                  </kbd>
                  <span>Fechar menus</span>
                </div>
              </div>
            </div>

            {/* Interaction Mode Overlay */}
            {interactionMode && (
              <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto">
                    <Zap className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Modo Interação Ativo
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      A apresentação está pausada. Os alunos estão recebendo a
                      atividade interativa.
                    </p>
                  </div>
                  <button
                    onClick={() => setInteractionMode(false)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-accent text-white text-sm font-semibold transition-all duration-200 hover:bg-accent/90"
                  >
                    <Play className="w-4 h-4" />
                    Retomar Apresentação
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: Info Panel ── */}
        <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] border-l border-border bg-card/30 flex-shrink-0">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Painel de Controle
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Class Info */}
            <div className="px-4 py-4 border-b border-border/50 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Empresa
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {trainingInfo.company}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Treinamento
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {trainingInfo.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Students Connected */}
            <div className="px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {trainingInfo.students}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    alunos conectados
                  </p>
                </div>
                {/* Online pulse */}
                <div className="ml-auto flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span className="text-[9px] text-success font-semibold uppercase">
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Tempo de Aula
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface rounded-lg px-4 py-3 text-center">
                  <span className="text-2xl font-mono font-bold text-foreground tracking-wider">
                    {timer.formatted}
                  </span>
                </div>
                <button
                  onClick={timer.toggle}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                    ${
                      timer.running
                        ? "bg-warning/10 text-warning hover:bg-warning/20"
                        : "bg-success/10 text-success hover:bg-success/20"
                    }
                  `}
                  title={timer.running ? "Pausar timer" : "Retomar timer"}
                >
                  {timer.running ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Button */}
            <div className="px-4 py-4 border-b border-border/50">
              <button className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface hover:bg-muted border border-border transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground block">
                    Gerar QR Code
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Presença dos alunos
                  </span>
                </div>
              </button>
            </div>

            {/* Interaction Mode Toggle */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Modo Interação
                </span>
              </div>
              <button
                onClick={() => setInteractionMode(!interactionMode)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${
                    interactionMode
                      ? "bg-accent text-white shadow-lg shadow-accent/25"
                      : "bg-surface hover:bg-muted border border-border text-foreground hover:border-accent/30"
                  }
                `}
              >
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                    ${interactionMode ? "bg-white/20" : "bg-accent/10"}
                  `}
                >
                  {interactionMode ? (
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <Radio className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <span className="text-sm font-semibold block">
                    {interactionMode ? "Interação Ativa" : "Ativar Interação"}
                  </span>
                  <span
                    className={`text-[10px] ${interactionMode ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    {interactionMode
                      ? "Quiz em andamento..."
                      : "Pausar e enviar quiz"}
                  </span>
                </div>
                {/* Toggle visual */}
                <div
                  className={`
                    w-10 h-5 rounded-full flex items-center transition-all duration-300 flex-shrink-0
                    ${interactionMode ? "bg-white/30 justify-end" : "bg-muted justify-start"}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full mx-0.5 transition-all duration-300
                      ${interactionMode ? "bg-white" : "bg-muted-foreground/50"}
                    `}
                  />
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ Bottom Bar ═══ */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToSubtheme(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium bg-surface text-foreground border border-border transition-all duration-200 hover:bg-muted hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-border"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={() => goToSubtheme(activeIndex + 1)}
            disabled={activeIndex === subthemes.length - 1}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 transition-all duration-200 hover:bg-primary/20 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:border-primary/20"
          >
            <span className="hidden sm:inline">Próximo</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Progress dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {subthemes.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSubtheme(i)}
              title={subthemes[i].title}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${
                  i === activeIndex
                    ? "w-6 bg-primary"
                    : subthemes[i].completed
                      ? "w-1.5 bg-success/60 hover:bg-success"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }
              `}
            />
          ))}
        </div>

        {/* Right: Library + Finish */}
        <div className="flex items-center gap-2">
          {/* Quick Library */}
          <div className="relative">
            <button
              onClick={() => setLibraryOpen(!libraryOpen)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium bg-surface text-foreground border border-border transition-all duration-200 hover:bg-muted hover:border-accent/20"
            >
              <Library className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Biblioteca Rápida</span>
            </button>

            {/* Library Dropdown */}
            {libraryOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLibraryOpen(false)}
                />

                <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-hidden rounded-xl bg-card border border-border shadow-2xl shadow-black/30 z-50 animate-slide-up">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Library className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">
                        Biblioteca Rápida
                      </span>
                    </div>
                    <button
                      onClick={() => setLibraryOpen(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtheme list */}
                  <div className="overflow-y-auto max-h-72 divide-y divide-border/50">
                    {subthemes.map((sub, i) => {
                      const isActive = i === activeIndex;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => goToSubtheme(i)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
                            ${
                              isActive
                                ? "bg-primary/10"
                                : "hover:bg-surface/60"
                            }
                          `}
                        >
                          <div
                            className={`
                              w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                              text-[10px] font-bold
                              ${
                                sub.completed
                                  ? "bg-success/20 text-success"
                                  : isActive
                                    ? "bg-primary text-white"
                                    : "bg-surface text-muted-foreground"
                              }
                            `}
                          >
                            {sub.completed ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              i + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm font-medium block truncate ${
                                isActive
                                  ? "text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {sub.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {sub.duration}
                            </span>
                          </div>
                          {isActive && (
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                              Atual
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Finish Button */}
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-destructive/70 border border-transparent transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20">
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Finalizar Treinamento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
