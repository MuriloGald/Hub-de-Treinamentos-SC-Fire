"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  Building2,
  GraduationCap,
  Clock,
  CalendarDays,
  Filter,
  MoreVertical,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ═══ Mock Data ═══ */
type ClassStatus = "em_andamento" | "agendada" | "concluida";

interface TrainingClass {
  id: string | number;
  company: string;
  companyType: "Indústria" | "Escola" | "Outros";
  training: string;
  hours: number;
  startDate: string;
  endDate: string;
  students: number;
  progress: number;
  status: ClassStatus;
}

const MOCK_CLASSES: TrainingClass[] = [
  {
    id: 1,
    company: "Metalúrgica Aço Forte",
    companyType: "Indústria",
    training: "Brigada Intermediária",
    hours: 16,
    startDate: "20/05/2026",
    endDate: "22/05/2026",
    students: 24,
    progress: 50,
    status: "em_andamento",
  },
  {
    id: 2,
    company: "Escola Municipal Horizonte",
    companyType: "Escola",
    training: "Lei Lucas — Primeiros Socorros",
    hours: 4,
    startDate: "30/05/2026",
    endDate: "30/05/2026",
    students: 35,
    progress: 0,
    status: "agendada",
  },
  {
    id: 3,
    company: "Indústria Química SafeChem",
    companyType: "Indústria",
    training: "Brigada Avançada",
    hours: 40,
    startDate: "02/06/2026",
    endDate: "13/06/2026",
    students: 18,
    progress: 25,
    status: "em_andamento",
  },
  {
    id: 4,
    company: "Têxtil Nova Era",
    companyType: "Indústria",
    training: "Brigada Básica",
    hours: 8,
    startDate: "10/04/2026",
    endDate: "11/04/2026",
    students: 30,
    progress: 100,
    status: "concluida",
  },
  {
    id: 5,
    company: "Colégio São Jorge",
    companyType: "Escola",
    training: "Lei Lucas — Primeiros Socorros",
    hours: 4,
    startDate: "15/04/2026",
    endDate: "15/04/2026",
    students: 42,
    progress: 100,
    status: "concluida",
  },
  {
    id: 6,
    company: "Cerâmica Estrela do Sul",
    companyType: "Indústria",
    training: "SIPAT 2026",
    hours: 4,
    startDate: "05/06/2026",
    endDate: "05/06/2026",
    students: 60,
    progress: 0,
    status: "agendada",
  },
];

const statusConfig: Record<
  ClassStatus,
  { label: string; color: string; icon: typeof Play }
> = {
  em_andamento: {
    label: "Em Andamento",
    color: "bg-primary/15 text-primary",
    icon: Play,
  },
  agendada: {
    label: "Agendada",
    color: "bg-accent/15 text-accent",
    icon: CalendarDays,
  },
  concluida: {
    label: "Concluída",
    color: "bg-success/15 text-success",
    icon: CheckCircle2,
  },
};

const companyTypeIcon = {
  Indústria: Building2,
  Escola: GraduationCap,
  Outros: AlertCircle,
};

export default function TurmasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "all">("all");
  const [classes, setClasses] = useState<TrainingClass[]>(MOCK_CLASSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("classes")
      .select(`
        id, status, scheduled_at, started_at, finished_at,
        company:companies(name, type),
        training:trainings(name, total_hours)
      `)
      .order("scheduled_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: TrainingClass[] = (data as any[]).map((row, i) => ({
            id: row.id,
            company: row.company?.name ?? "Empresa",
            companyType: (row.company?.type ?? "Outros") as TrainingClass["companyType"],
            training: row.training?.name ?? "Treinamento",
            hours: Number(row.training?.total_hours ?? 0),
            startDate: row.scheduled_at
              ? new Date(row.scheduled_at).toLocaleDateString("pt-BR")
              : "—",
            endDate: row.finished_at
              ? new Date(row.finished_at).toLocaleDateString("pt-BR")
              : "—",
            students: 0,
            progress:
              row.status === "concluida" ? 100 :
              row.status === "em_andamento" ? 50 : 0,
            status: row.status as ClassStatus,
          }));
          setClasses(mapped);
        }
        setLoading(false);
      });
  }, []);

  const filtered = classes.filter((cls) => {
    const matchSearch =
      cls.company.toLowerCase().includes(search.toLowerCase()) ||
      cls.training.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || cls.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: classes.length,
    em_andamento: classes.filter((c) => c.status === "em_andamento").length,
    agendada: classes.filter((c) => c.status === "agendada").length,
    concluida: classes.filter((c) => c.status === "concluida").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Turmas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas turmas de treinamento ativas e agendadas.
          </p>
        </div>
        <Link
          id="new-turma-btn"
          href="/instrutor/comercial"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-fire-gradient-strong text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </Link>
      </div>

      {/* ── Tabs / Filters ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-surface border border-border">
          {(
            [
              { key: "all", label: "Todas" },
              { key: "em_andamento", label: "Em Andamento" },
              { key: "agendada", label: "Agendadas" },
              { key: "concluida", label: "Concluídas" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                statusFilter === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="turmas-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa ou treinamento..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* ── Class Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((cls) => {
          const StatusIcon = statusConfig[cls.status].icon;
          const CompanyIcon =
            companyTypeIcon[cls.companyType] || Building2;

          return (
            <Link
              key={cls.id}
              href={`/instrutor/apresentacao?classId=${cls.id}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer block text-left"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                    <CompanyIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {cls.company}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {cls.companyType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig[cls.status].color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[cls.status].label}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Training Info */}
              <div className="mb-4">
                <h4 className="text-foreground font-semibold text-sm">
                  {cls.training}
                </h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cls.students} alunos
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {cls.startDate}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground font-medium">
                    {cls.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cls.progress === 100 ? "bg-success" : "bg-fire-gradient-strong"}`}
                    style={{ width: `${cls.progress}%` }}
                  />
                </div>
              </div>

              {/* Hover action */}
              {cls.status === "em_andamento" && (
                <div className="absolute bottom-0 left-0 right-0 h-0 group-hover:h-12 bg-primary/10 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden border-t border-primary/20">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Continuar Treinamento
                  </span>
                </div>
              )}

              {/* Glow */}
              <div className="absolute inset-0 bg-fire-gradient opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-foreground font-semibold">
            Nenhuma turma encontrada
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou crie uma nova turma.
          </p>
        </div>
      )}
    </div>
  );
}
