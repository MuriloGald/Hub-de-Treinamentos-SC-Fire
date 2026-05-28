"use client";

import { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
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
  AlertCircle,
  Link2,
  Copy,
} from "lucide-react";

/* ═══ Types ═══ */
interface Company {
  name: string;
}

interface Training {
  id: string;
  name: string;
  total_hours: number;
}

interface ClassFromDB {
  id: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  qr_code_token: string;
  scheduled_at: string;
  started_at: string | null;
  company: Company;
  training: Training;
}

interface Subtheme {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  canva_embed: string | null;
  category: string;
  level: string;
  description: string | null;
}

interface Attendance {
  checked_in_at: string;
  student: {
    full_name: string;
    email: string;
    cpf: string;
  };
}

/* ═══ Timer Hook ═══ */
function useTimer(initialSeconds = 0, isRunning = false) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(isRunning);

  useEffect(() => {
    setRunning(isRunning);
  }, [isRunning]);

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

  return { seconds, formatted, running, setRunning, toggle: () => setRunning((r) => !r) };
}

function ApresentacaoCockpit() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");
  const [isPending, startTransition] = useTransition();

  /* ═══ States ═══ */
  const [classes, setClasses] = useState<ClassFromDB[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [activeClass, setActiveClass] = useState<ClassFromDB | null>(null);

  /* ═══ URL Class Autoselect ═══ */
  useEffect(() => {
    if (classIdParam && classes.length > 0 && !activeClass) {
      const match = classes.find((c) => c.id === classIdParam);
      if (match) {
        setActiveClass(match);
        if (match.interaction_mode) {
          setInteractionMode(match.interaction_mode);
        }
      }
    }
  }, [classIdParam, classes, activeClass]);

  const [subthemes, setSubthemes] = useState<Subtheme[]>([]);
  const [loadingSubthemes, setLoadingSubthemes] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  const [interactionMode, setInteractionMode] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Calcula o tempo decorrido desde o started_at
  const [initialSeconds, setInitialSeconds] = useState(0);
  const timer = useTimer(initialSeconds, activeClass?.status === "em_andamento");

  const completedCount = subthemes.filter((s) => s.completed).length;
  const progressPercent = subthemes.length > 0 ? Math.round((completedCount / subthemes.length) * 100) : 0;
  const activeSubtheme = subthemes[activeIndex];

  /* ═══ Fetch Classes ═══ */
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          id, status, qr_code_token, scheduled_at, started_at,
          company:companies(name),
          training:trainings(id, name, total_hours)
        `)
        .in("status", ["agendada", "em_andamento"])
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setClasses((data as any[]) || []);
    } catch (err) {
      console.error("Erro ao buscar turmas:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /* ═══ Fetch Subthemes when Class Selected ═══ */
  const fetchSubthemes = useCallback(async (trainingId: string) => {
    setLoadingSubthemes(true);
    try {
      const { data, error } = await supabase
        .from("training_subthemes")
        .select(`
          sort_order, is_mandatory,
          subtheme:subthemes(id, name, hours, level, category, canva_embed, description)
        `)
        .eq("training_id", trainingId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Subtheme[] = data.map((row: any, i) => ({
          id: row.subtheme.id,
          title: row.subtheme.name,
          duration: `${row.subtheme.hours}h`,
          completed: i < activeIndex, // Marca os anteriores como concluídos
          canva_embed: row.subtheme.canva_embed,
          category: row.subtheme.category,
          level: row.subtheme.level,
          description: row.subtheme.description,
        }));
        setSubthemes(mapped);
      } else {
        setSubthemes([]);
      }
    } catch (err) {
      console.error("Erro ao buscar subtemas:", err);
    } finally {
      setLoadingSubthemes(false);
    }
  }, [supabase, activeIndex]);

  useEffect(() => {
    if (activeClass) {
      fetchSubthemes(activeClass.training.id);

      // Calcula tempo decorrido do timer
      if (activeClass.started_at) {
        const start = new Date(activeClass.started_at).getTime();
        const now = new Date().getTime();
        const diffSeconds = Math.max(0, Math.floor((now - start) / 1000));
        setInitialSeconds(diffSeconds);
      } else {
        setInitialSeconds(0);
      }
    }
  }, [activeClass, fetchSubthemes]);

  /* ═══ Sync Active Subtheme to Supabase ═══ */
  useEffect(() => {
    if (activeClass && activeClass.status === "em_andamento" && subthemes.length > 0) {
      const subthemeId = subthemes[activeIndex]?.id;
      if (subthemeId) {
        supabase
          .from("classes")
          .update({ active_subtheme_id: subthemeId })
          .eq("id", activeClass.id)
          .then(({ error }) => {
            if (error) console.error("Erro ao sincronizar subtema no Supabase:", error);
          });
      }
    }
  }, [activeIndex, subthemes, activeClass, supabase]);

  /* ═══ Sync Interaction Mode to Supabase ═══ */
  useEffect(() => {
    if (activeClass && activeClass.status === "em_andamento") {
      supabase
        .from("classes")
        .update({ interaction_mode: interactionMode })
        .eq("id", activeClass.id)
        .then(({ error }) => {
          if (error) console.error("Erro ao atualizar modo de interação no Supabase:", error);
        });
    }
  }, [interactionMode, activeClass, supabase]);

  /* ═══ Fetch Attendances (Polling 5s) ═══ */
  const fetchAttendances = useCallback(async () => {
    if (!activeClass) return;
    try {
      const { data, error } = await supabase
        .from("attendances")
        .select(`
          checked_in_at,
          student:students(full_name, email, cpf)
        `)
        .eq("class_id", activeClass.id)
        .order("checked_in_at", { ascending: false });

      if (error) throw error;
      setAttendances((data as any[]) || []);
    } catch (err) {
      console.error("Erro ao buscar presenças:", err);
    }
  }, [supabase, activeClass]);

  useEffect(() => {
    if (activeClass && activeClass.status === "em_andamento") {
      fetchAttendances();
      const interval = setInterval(fetchAttendances, 5000);
      return () => clearInterval(interval);
    }
  }, [activeClass, fetchAttendances]);

  /* ═══ Start Class Action ═══ */
  const startClass = async () => {
    if (!activeClass) return;
    startTransition(async () => {
      try {
        const startTime = new Date().toISOString();
        const { error } = await supabase
          .from("classes")
          .update({
            status: "em_andamento",
            started_at: startTime,
          })
          .eq("id", activeClass.id);

        if (error) throw error;

        // Atualiza estado local
        setActiveClass((prev) =>
          prev
            ? {
                ...prev,
                status: "em_andamento",
                started_at: startTime,
              }
            : null
        );
        timer.setRunning(true);
      } catch (err) {
        console.error("Erro ao iniciar turma:", err);
      }
    });
  };

  /* ═══ Finish Class Action ═══ */
  const finishClass = async () => {
    if (!activeClass) return;
    const confirm = window.confirm("Deseja realmente finalizar esta aula? Isso registrará a conclusão oficial no banco de dados.");
    if (!confirm) return;

    startTransition(async () => {
      try {
        const { error } = await supabase
          .from("classes")
          .update({
            status: "concluida",
            finished_at: new Date().toISOString(),
          })
          .eq("id", activeClass.id);

        if (error) throw error;
        router.push("/instrutor/dashboard");
      } catch (err) {
        console.error("Erro ao finalizar turma:", err);
      }
    });
  };

  const goToSubtheme = useCallback(
    (index: number) => {
      if (index >= 0 && index < subthemes.length) {
        setActiveIndex(index);
        setLibraryOpen(false);

        // Atualiza dinamicamente as conclusões
        setSubthemes((prev) =>
          prev.map((sub, i) => ({
            ...sub,
            completed: i < index,
          }))
        );
      }
    },
    [subthemes.length]
  );

  /* Keyboard shortcuts */
  useEffect(() => {
    if (activeClass?.status !== "em_andamento") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToSubtheme(Math.min(activeIndex + 1, subthemes.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToSubtheme(Math.max(activeIndex - 1, 0));
      } else if (e.key === "Escape") {
        setLibraryOpen(false);
        setQrModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToSubtheme, subthemes.length, activeClass]);

  /* Build QR Code Link */
  const getCheckInUrl = () => {
    if (!activeClass) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/aluno/check-in?token=${activeClass.qr_code_token}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getCheckInUrl());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  /* ═══════════════════════════════════════════════════
     VIEW 1: Turma Selection View (Tela Inicial)
     ═══════════════════════════════════════════════════ */
  if (!activeClass) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden px-6 py-12">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] animate-float" />

        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Cockpit de Apresentação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Selecione uma Turma para Iniciar
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Escolha a turma ativa para começar a orquestração do treinamento presencial e liberação dos slides do Canva.
            </p>
          </div>

          {loadingClasses ? (
            <div className="glass rounded-2xl p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Buscando turmas ativas no Supabase...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center space-y-6 max-w-xl mx-auto border border-border">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Nenhuma Turma Cadastrada</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Não encontramos nenhuma turma com status **Agendada** ou **Em Andamento** associada ao seu usuário.
                  <br />
                  As turmas são criadas automaticamente ao aprovar propostas no **Hub Comercial**.
                </p>
              </div>
              <button
                onClick={() => router.push("/instrutor/comercial")}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/45 transition-all duration-200"
              >
                Ir ao Hub Comercial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="glass rounded-2xl p-6 border border-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-black/25"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          cls.status === "em_andamento"
                            ? "bg-success/20 text-success border border-success/30"
                            : "bg-warning/20 text-warning border border-warning/30"
                        }`}
                      >
                        {cls.status === "em_andamento" ? "Em Andamento" : "Agendada"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {cls.scheduled_at
                          ? new Date(cls.scheduled_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                          : "Sem data"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="text-base font-bold text-foreground truncate">{cls.company?.name || "Empresa"}</h3>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-sm font-semibold text-muted-foreground truncate">{cls.training?.name || "Treinamento"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 mt-6">
                    <button
                      onClick={() => setActiveClass(cls)}
                      className="w-full h-11 rounded-xl bg-surface border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
                    >
                      <span>Abrir Cockpit</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     VIEW 2: Turma Agendada (Tela de Espera / Início)
     ═══════════════════════════════════════════════════ */
  if (activeClass.status === "agendada") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden px-6">
        {/* Close Button to return to selection */}
        <button
          onClick={() => setActiveClass(null)}
          className="absolute top-6 right-6 p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors z-20"
          title="Voltar para seleção"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-xl text-center space-y-8 glass rounded-2xl p-8 border border-border shadow-2xl">
          <div className="relative inline-flex mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-warning/20 flex items-center justify-center shadow-lg text-warning animate-float">
              <Clock className="w-10 h-10" />
            </div>
            <div className="absolute -inset-2 bg-warning rounded-2xl opacity-10 blur-xl animate-pulse-glow" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Aguardando Início da Aula</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Você selecionou a turma da empresa **{activeClass.company?.name}** para o treinamento **{activeClass.training?.name}**.
              <br />
              Clique no botão abaixo para dar início oficial. Isso notificará o sistema e abrirá o roteiro do apresentador Canva.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border/50 text-left space-y-2.5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Empresa:</span>
              <span className="font-semibold text-foreground">{activeClass.company?.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Curso:</span>
              <span className="font-semibold text-foreground">{activeClass.training?.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Carga Horária:</span>
              <span className="font-semibold text-foreground">{activeClass.training?.total_hours} horas</span>
            </div>
          </div>

          <button
            onClick={startClass}
            disabled={isPending}
            className="w-full max-w-xs h-12 rounded-xl bg-fire-gradient-strong text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/45 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 mx-auto disabled:opacity-75 disabled:pointer-events-none"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Iniciando Turma...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Iniciar Treinamento
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     VIEW 3: Cockpit Principal (Aula Em Andamento)
     ═══════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full -m-4 lg:-m-6 animate-fade-in relative">
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
                  <span className="text-xs font-semibold text-foreground truncate">Roteiro Comercial</span>
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
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Subtheme List */}
          <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {loadingSubthemes ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                {!sidebarCollapsed && <p className="text-[10px] text-muted-foreground">Carregando roteiro...</p>}
              </div>
            ) : subthemes.length === 0 ? (
              <div className="py-8 text-center px-4">
                {!sidebarCollapsed && <p className="text-xs text-muted-foreground">Nenhum subtema vinculado ao treinamento comercial.</p>}
              </div>
            ) : (
              subthemes.map((sub, i) => {
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
                      ${isActive ? "bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10" : "hover:bg-surface/60 border border-transparent"}
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
                      {isCompleted ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                    </div>

                    {/* Label */}
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0 animate-fade-in">
                        <span
                          className={`
                            text-xs font-semibold leading-tight block truncate
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-1 rounded-sm uppercase tracking-wider ${
                              sub.level === "Ouro"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : sub.level === "Prata"
                                  ? "bg-slate-400/20 text-slate-300"
                                  : "bg-amber-600/20 text-amber-500"
                            }`}
                          >
                            {sub.level}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{sub.duration}</span>
                        </div>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && !sidebarCollapsed && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* ── CENTER: Presentation Area (Iframe Canva ou Mensagem de Cadastro) ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Subtle Bar — Shows current subtheme name */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card/30 flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MonitorPlay className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">{activeSubtheme?.title || "Carregando..."}</span>
              {subthemes.length > 0 && (
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-surface">
                  {activeIndex + 1} de {subthemes.length}
                </span>
              )}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">AULA ATIVA</span>
            </div>
          </div>

          {/* Presentation Canvas */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-card/20">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

            {/* Canva Iframe Renders Here */}
            {activeSubtheme ? (
              activeSubtheme.canva_embed ? (
                <div className="w-full h-full relative z-10 p-2 sm:p-4">
                  <iframe
                    src={activeSubtheme.canva_embed}
                    className="w-full h-full rounded-xl border border-border bg-black shadow-2xl"
                    allowFullScreen
                    allow="fullscreen"
                  />
                </div>
              ) : (
                /* Premium Alert for Empty Canva Embed Link */
                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-md animate-slide-up">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive animate-float">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">Apresentação Canva Não Vinculada</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Não encontramos um link de incorporação do Canva configurado no banco de dados para o subtema:
                      <br />
                      <strong className="text-foreground">"{activeSubtheme.title}"</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface border border-border/50 text-left space-y-1.5 w-full text-xs">
                    <p className="text-muted-foreground">
                      **Como resolver:** Vá até a página de **Gerenciamento de Subtemas**, edite este subtema e cole o link de incorporação gerado pelo Canva (*Compartilhar ➔ Incorporar ➔ Link de incorporação inteligente*).
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}

            {/* Interaction Mode Overlay */}
            {interactionMode && (
              <div className="absolute inset-0 z-20 bg-background/85 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                <div className="text-center space-y-4 max-w-sm px-6">
                  <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto text-accent animate-pulse">
                    <Zap className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Modo Interação Ativo</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      A tela do Canva foi pausada nos celulares dos alunos. O **Provão Interativo** referente ao subtema **"{activeSubtheme?.title}"** foi disparado nos PWAs conectados.
                    </p>
                  </div>
                  <button
                    onClick={() => setInteractionMode(false)}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-current" />
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
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Painel de Controle</span>
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
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Empresa</p>
                  <p className="text-xs font-bold text-foreground truncate">{activeClass.company?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Treinamento</p>
                  <p className="text-xs font-bold text-foreground truncate">{activeClass.training?.name}</p>
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
                  <p className="text-sm font-bold text-foreground">{attendances.length}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">alunos presentes</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span className="text-[9px] text-success font-bold uppercase">Online</span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Tempo de Aula</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface rounded-lg px-4 py-3 text-center border border-border/50">
                  <span className="text-xl font-mono font-bold text-foreground tracking-wider">{timer.formatted}</span>
                </div>
                <button
                  onClick={timer.toggle}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                    ${timer.running ? "bg-warning/10 text-warning hover:bg-warning/20" : "bg-success/10 text-success hover:bg-success/20"}
                  `}
                  title={timer.running ? "Pausar cronômetro" : "Retomar cronômetro"}
                >
                  {timer.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
            </div>

            {/* QR Code Button */}
            <div className="px-4 py-4 border-b border-border/50">
              <button
                onClick={() => setQrModalOpen(true)}
                className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface hover:bg-muted border border-border transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground block">Gerar QR Code</span>
                  <span className="text-[10px] text-muted-foreground">Presença escaneável</span>
                </div>
              </button>
            </div>

            {/* Interaction Mode Toggle */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Provão Interativo</span>
              </div>
              <button
                onClick={() => setInteractionMode(!interactionMode)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${interactionMode ? "bg-accent text-white shadow-lg shadow-accent/25" : "bg-surface hover:bg-muted border border-border text-foreground hover:border-accent/30"}
                `}
              >
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                    ${interactionMode ? "bg-white/20" : "bg-accent/10"}
                  `}
                >
                  <Radio className="w-5 h-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-sm font-semibold block truncate">{interactionMode ? "Interação Ativa" : "Ativar Interação"}</span>
                  <span className={`text-[10px] block truncate ${interactionMode ? "text-white/70" : "text-muted-foreground"}`}>
                    {interactionMode ? "Quiz enviado..." : "Pausar e enviar quiz"}
                  </span>
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
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-surface text-foreground border border-border transition-all duration-200 hover:bg-muted hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-border"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={() => goToSubtheme(activeIndex + 1)}
            disabled={activeIndex === subthemes.length - 1}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 transition-all duration-200 hover:bg-primary/20 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:border-primary/20"
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
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-surface text-foreground border border-border transition-all duration-200 hover:bg-muted hover:border-accent/20"
            >
              <Library className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Biblioteca Rápida</span>
            </button>

            {/* Library Dropdown */}
            {libraryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLibraryOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-hidden rounded-xl bg-card border border-border shadow-2xl shadow-black/30 z-50 animate-slide-up">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Library className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">Biblioteca Rápida</span>
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
                            ${isActive ? "bg-primary/10" : "hover:bg-surface/60"}
                          `}
                        >
                          <div
                            className={`
                              w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                              text-[10px] font-bold
                              ${sub.completed ? "bg-success/20 text-success" : isActive ? "bg-primary text-white" : "bg-surface text-muted-foreground"}
                            `}
                          >
                            {sub.completed ? <Check className="w-3 h-3" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-semibold block truncate ${isActive ? "text-primary" : "text-foreground"}`}>{sub.title}</span>
                            <span className="text-[10px] text-muted-foreground">{sub.duration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Finish Button */}
          <button
            onClick={finishClass}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold text-destructive/70 border border-transparent transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 disabled:opacity-50"
          >
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Finalizar Treinamento</span>
          </button>
        </div>
      </div>

      {/* ═══ MODAL: QR Code Presença (Real-Time check-in monitor) ═══ */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in max-h-[90vh]">
            
            {/* Close Modal Button */}
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: QR Code Image */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border text-center space-y-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">CHECK-IN DIGITAL</span>
              <h3 className="text-lg font-extrabold text-foreground">Escaneie o QR Code</h3>
              
              <div className="relative p-2 bg-white rounded-xl shadow-inner shadow-black/10">
                {/* Generates a REAL, scannable QR Code using the api.qrserver.com public API */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(getCheckInUrl())}`}
                  alt="QR Code Presença"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg bg-white"
                />
              </div>

              <div className="w-full space-y-2">
                <p className="text-[10px] text-muted-foreground leading-normal max-w-xs mx-auto">
                  Aponte a câmera do celular para registrar a presença georreferenciada.
                </p>
                
                {/* Copyable Check-In Link */}
                <div className="flex items-center gap-1.5 bg-surface border border-border/50 rounded-lg p-1.5 max-w-xs mx-auto">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] font-mono text-foreground truncate flex-1 text-left">{getCheckInUrl()}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 rounded bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    title="Copiar Link"
                  >
                    {copyFeedback ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Checked-in Students */}
            <div className="w-full md:w-[280px] p-6 bg-surface/20 flex flex-col overflow-hidden max-h-[50vh] md:max-h-none">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50 flex-shrink-0">
                <Users className="w-4 h-4 text-success" />
                <span className="text-xs font-bold text-foreground">
                  Alunos Presentes ({attendances.length})
                </span>
                <span className="relative flex h-1.5 w-1.5 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
              </div>

              {/* Attendance List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {attendances.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center animate-pulse text-muted-foreground">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Aguardando check-in dos alunos...
                    </p>
                  </div>
                ) : (
                  attendances.map((att, i) => (
                    <div
                      key={att.student.cpf + i}
                      className="p-2.5 rounded-lg bg-surface border border-border/50 flex items-center gap-2.5 animate-slide-up"
                    >
                      <div className="w-2 h-2 rounded-full bg-success flex-shrink-0 animate-pulse" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {att.student.full_name}
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          {new Date(att.checked_in_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApresentacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Carregando Cockpit de Apresentação...
          </p>
        </div>
      </div>
    }>
      <ApresentacaoCockpit />
    </Suspense>
  );
}
