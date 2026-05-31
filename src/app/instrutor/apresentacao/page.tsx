"use client";

import { useState, useEffect, useCallback, useRef, useTransition, useMemo, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  // Main Cockpit Icons
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
  
  // BNI Cockpit Icons
  ArrowLeftRight,
  FileText,
  Maximize2,
  Minimize2,
  LogOut,
  Mail,
  MessageSquare,
  Globe,
  Award,
  ShieldCheck,
  PartyPopper,
  Activity,
  AlertTriangle,
  Coins,
  ShieldAlert,
  GitCommit,
  ClipboardSignature,
  FileCheck2,
  AlertOctagon,
  HeartHandshake,
  Warehouse,
  PencilRuler,
  Sliders,
  TrendingDown,
  Wind,
  BatteryCharging,
  Construction,
  HeartPulse,
  Factory,
  FileSearch,
  ClipboardCheck,
  RefreshCw,
  DoorClosed,
  Laptop,
  CheckCircle,
  Briefcase,
  Key,
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
  interaction_mode?: boolean;
  active_subtheme_id?: string | null;
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

/* ═══ Helper: Sanitize Canva Presentation Link for Iframe Embedding ═══ */
function cleanCanvaUrl(url: string | null): string {
  if (!url) return "";
  
  let target = url.trim();

  // 1. Se colou a tag <iframe> inteira, extrai o src
  if (target.toLowerCase().includes("<iframe")) {
    const match = target.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      target = match[1];
    }
  }

  // 2. Se for link do Canva, garante formato de embed (?embed)
  if (target.includes("canva.com/")) {
    const baseUrl = target.split("?")[0];
    if (baseUrl.endsWith("/view") || baseUrl.endsWith("/watch")) {
      return `${baseUrl}?embed`;
    } else if (baseUrl.match(/\/design\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/) || baseUrl.match(/\/design\/[a-zA-Z0-9_-]+$/)) {
      return `${baseUrl}/view?embed`;
    }
    return `${baseUrl}?embed`;
  }

  return target;
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

/* ═══ Presentation Slide Databases (6 slides per deck, Video Slide 6 omitted) ═══ */
const SPEAKER_NOTES: Record<string, Record<number, { title: string; speech: string; bullets: string[] }>> = {
  eventos: {
    1: {
      title: "Slide 1: Abertura, Origem & Portfólio (Tempo: 1:00)",
      speech: "Bom dia, membros do BNI! Meu nome é Paulo Roberto Ramos e represento a SC Fire. Nossa história começou com muita energia: nascemos em 2012, no festival Planeta Atlântida e logo na sequência atuamos na Copa do Mundo de 2014 em Porto Alegre...",
      bullets: [
        "Apresente-se com voz firme e postura confiante.",
        "Destaque a autoridade fundadora: Planeta Atlântida (2012) e FIFA Copa do Mundo (2014).",
        "Explique o portfólio triplo: Eventos (nosso carro-chefe), Projetos de PPCI fixos e Treinamento de Brigadas."
      ]
    },
    2: {
      title: "Slide 2: Setor em Floripa & Os Riscos (Tempo: 1:00)",
      speech: "Para a comunidade de Florianópolis, o setor de serviços e turismo de eventos é vital: representa 76,1% do PIB municipal...",
      bullets: [
        "Apresente os números estratégicos: serviços correspondem a 76,1% do PIB de Floripa.",
        "Diga o faturamento: Grandes eventos movimentam mais de R$ 100 Milhões em apenas 1 mês na cidade.",
        "Dores do cliente: Falhas geram embargos na véspera, danos à reputação e sérias consequências civis e criminais."
      ]
    },
    3: {
      title: "Slide 3: O Flow do Nosso Trabalho (Tempo: 1:10)",
      speech: "Para blindar os organizadores de eventos, a SC Fire desenvolveu um fluxo cirúrgico em 4 etapas: Análise, Documentação, Dimensionamento e Operação...",
      bullets: [
        "Fase 1 (Briefing): Mapeamento de riscos, cálculo de lotação e vistorias de palcos/tendas.",
        "Fase 2 (Documentação): Projetos de segurança temporários, ARTs e trâmite ágil junto ao CBMSC.",
        "Fase 3 (Dimensionamento): Dimensionamento exato e legal de brigada particular.",
        "Fase 4 (Operação): Vistoria técnica no dia do evento e brigada ativa em prontidão."
      ]
    },
    4: {
      title: "Slide 4: Estudo de Caso — O Acidente do Centrosul 2015 (Tempo: 1:00)",
      speech: "E para entendermos a gravidade do que evitamos, eu trago o acidente emblemático do Centrosul em 2015, quando um painel de LED de uma tonelada desabou...",
      bullets: [
        "Fale sobre o painel de LED de uma tonelada que desabou no Centrosul in 2015, ferindo 6 pessoas.",
        "Causas: projeto alterado sem aval dos Bombeiros e sem engenheiro responsável (falha de ART).",
        "A resposta SC Fire: Para nós, a segurança estrutural é lei. Exigimos ARTs de montagem e mantemos vistorias rígidas."
      ]
    },
    5: {
      title: "Slide 5: Como nos Indicar (Tempo: 1:00)",
      speech: "Eu procuro conexões estratégicas com Organizadores de Eventos (sociais e corporativos), Agências de Live Marketing e proprietários de Centros de Eventos, Buffets ou Espaços...",
      bullets: [
        "Nossos parceiros ideais no BNI: Organizadores de Eventos, Agências de Live Marketing e donos de Espaços e Centros de Convenções.",
        "Gatilhos de conversa para ouvir: 'Não consigo liberar o alvará temporário e meu evento é sábado', 'O bombeiro barrou meu projeto de palco'."
      ]
    },
    6: {
      title: "Slide 6: Fechamento & Contato (Tempo: 1:00)",
      speech: "Lembre-se: em segurança de eventos, a sorte não é um plano de ação viável. Escaneie o QR Code para acessar nosso Instagram, seguir a SC Fire e conhecer o nosso dia a dia operacional!",
      bullets: [
        "Aponte para o slide destacando seu nome, foto e o QR Code direcionando para o perfil do Instagram.",
        "Bordão Final: 'SC Fire: A segurança que seu evento precisa, a tranquilidade que você merece!'"
      ]
    }
  },
  projetos: {
    1: {
      title: "Slide 1: Capa & Credenciais da Engenharia (Tempo: 1:00)",
      speech: "Bom dia, membros do BNI! Meu nome é Dione Borges, Engenheira Civil e especialista de referência no setor de projetos da SC Fire Engenharia. A nossa história com segurança à vida começou de forma grandiosa: nascemos em 2012 no festival Planeta Atlântida...",
      bullets: [
        "Apresente-se com postura técnica de engenharia e voz firme.",
        "Destaque a autoridade fundadora e as credenciais de alta complexidade.",
        "Apresente os três pilares de projetos: PPCI Predial, Regularização (AVCB) e Alto Desempenho."
      ]
    },
    2: {
      title: "Slide 2: A Documentação Legal & Os Riscos (Tempo: 1:00)",
      speech: "O Atestado de Vistoria do Corpo de Bombeiros (ou Habite-se predial) é o escudo legal e patrimonial do seu negócio. Operar sem ele expõe síndicos e donos de empresas a riscos brutais...",
      bullets: [
        "Explique o conceito de AVCB / Alvará de Bombeiros como proteção patrimonial ativa.",
        "Destaque as consequências de operar irregular: Perda de cobertura de seguro, autos de infração e processos civis/criminais.",
        "Diga que a SC Fire cuida de todo o processo de vistorias técnicas e protocolos."
      ]
    },
    3: {
      title: "Slide 3: PPCI Além do Novo — Layout & Ocupação (Tempo: 1:10)",
      speech: "Muitos pensam que o PPCI é só para prédios novos, mas isso é um grande mito! Mudanças de layout e alterações de ocupação exigem a atualização obrigatória do projeto preventivo...",
      bullets: [
        "Desmistifique que PPCI serve apenas para obras novas.",
        "Explique os gatilhos: Alteração de Layout (divisórias, mezaninos que afetam rotas de fuga) e Mudança de Ocupação (escritório que vira restaurante)."
      ]
    },
    4: {
      title: "Slide 4: Engenharia de Elite — Projeto Baseado em Desempenho (Tempo: 1:00)",
      speech: "O que fazer quando as normas tradicionais exigem obras inviáveis ou que custariam centenas de milhares de reais? Aplicamos a Engenharia de Desempenho...",
      bullets: [
        "Apresente o conceito de PBD (Projeto Baseado em Desempenho) como alternativa científica e legal às regras prescritivas rígidas e caras.",
        "Destaque a otimização de custos e economia de materiais obtida através de cálculos de evacuação real de pessoas."
      ]
    },
    5: {
      title: "Slide 5: Dinâmica de Fluidos (CFD) & Veículos Elétricos (Tempo: 0:50)",
      speech: "E como aplicamos essa engenharia de ponta? Através da fluidodinâmica computacional (CFD) regulamentada pela IN 23 do CBMSC para recargas de carros elétricos em garagens...",
      bullets: [
        "Explique as exigências da Instrução Normativa 23 (IN 23) do CBMSC sobre o risco de baterias de lítio em subsolos.",
        "Apresente a Fluidodinâmica Computacional (CFD) como modelagem 3D computacional de dispersão de calor e fumaça."
      ]
    },
    6: {
      title: "Slide 6: Fechamento & Instagram (Tempo: 1:00)",
      speech: "Lembre-se: em segurança de projetos prediais, a sorte não é um plano de ação viável. Escaneie o QR Code para acessar nosso Instagram, seguir a SC Fire e conhecer o nosso dia a dia operacional!",
      bullets: [
        "Aponte para o slide destacando seu nome, foto e o QR Code direcionando para o perfil do Instagram.",
        "Bordão Final: 'SC Fire: A segurança que seu projeto precisa, a tranquilidade que você merece!'"
      ]
    }
  },
  treinamentos: {
    1: {
      title: "Slide 1: Capa & Credenciais da Formação (Tempo: 1:00)",
      speech: "Bom dia, parceiros do BNI! Sou o Sargento BM Murilo Galdino, especialista de referência em Treinamentos e Brigadas da SC Fire. Toda a nossa autoridade operacional acumulada em grandes escalas nós aplicamos na capacitação técnica de brigadas orgânicas e corporativas...",
      bullets: [
        "Apresente-se com voz dinâmica de instrutor militar.",
        "Explique o portfólio de cursos: Brigadas Orgânicas (IN 28), Brigadistas Particulares e Primeiros Socorros homologados."
      ]
    },
    2: {
      title: "Slide 2: A Exigência Técnica da IN 28 (Tempo: 1:00)",
      speech: "A implantação da brigada de incêndio sob a Instrução Normativa 28 do CBMSC é obrigatória para obter o alvará preventivo e o Habite-se. O PIBI é o nosso foco de regularização...",
      bullets: [
        "Explique o conceito da IN 28 do CBMSC e o PIBI (Plano de Implantação da Brigada de Incêndio).",
        "Diferencie Brigadistas Orgânicos (colaboradores locais) de Brigadistas Particulares (bombeiros civis contratados)."
      ]
    },
    3: {
      title: "Slide 3: Teoria Alinhada à Prática Realista (Tempo: 1:10)",
      speech: "Treinamento medíocre coloca lives em risco. Nosso método foca em teoria aplicada, combate a princípios de chamas com calor real e primeiros socorros de RCP...",
      bullets: [
        "Fase 1 (Teoria): Química básica do fogo e detecção de riscos prediais.",
        "Fase 2 (Prática): Combatendo chamas com extintores e mangueiras sob calor real.",
        "Fase 3 (Primeiros Socorros): RCP (massagem), desobstrução, contenção de hemorragias (Lei Lucas).",
        "Fase 4 (Evacuação): Controle de pânico coletivo e rotas de fuga."
      ]
    },
    4: {
      title: "Slide 4: Diferenciais Técnicos SC Fire (Tempo: 1:00)",
      speech: "Não vendemos certificados rápidos e vazios na internet. Oferecemos instrutores engenheiros e bombeiros credenciados na DAT/CBMSC e pistas de treinamento realista de fogo...",
      bullets: [
        "Apresente a seriedade técnica da SC Fire: instrutores credenciados e homologados no CBMSC.",
        "Destaque a pista física de calor real para simulação ativa e quebra de pânico."
      ]
    },
    5: {
      title: "Slide 5: Ação Rápida em 60 Segundos (Tempo: 0:50)",
      speech: "O tempo médio dos bombeiros oficiais chegarem devido ao trânsito é maior que 10 minutos. O primeiro minuto combatido pelo brigadista orgânico evita uma tragédia...",
      bullets: [
        "Apresente a matemática do tempo de resposta: 1 minuto da brigada local contra 10+ minutos do caminhão oficial.",
        "A brigada é o escudo que evita que pequenos incidentes destruam galpões ou escritórios inteiros."
      ]
    },
    6: {
      title: "Slide 6: Fechamento & Instagram (Tempo: 1:00)",
      speech: "Lembre-se: em treinamentos de emergência, a sorte não é um plano de ação viável. Escaneie o QR Code, siga o nosso Instagram e capacite quem constrói o seu negócio!",
      bullets: [
        "Aponte para o slide destacando seu nome, foto e o QR Code direcionando para o perfil do Instagram.",
        "Bordão Final: 'SC Fire: A segurança que sua equipe precisa, a tranquilidade que você merece!'"
      ]
    }
  },
  consultoria: {
    1: {
      title: "Slide 1: Capa & Credenciais da Consultoria (Tempo: 1:00)",
      speech: "Bom dia, membros do BNI! Sou Paulo Roberto Ramos e represento a SC Fire Consultoria. Atuamos como consultores técnicos auditando grandes edificações comerciais...",
      bullets: [
        "Apresente-se com voz sóbria de consultor técnico corporativo.",
        "Defina as três frentes: Vistoria Diagnóstica, Laudos de Conformidade e Renovação de Alvará (AVCB)."
      ]
    },
    2: {
      title: "Slide 2: Por que Consultoria Preventiva? (Tempo: 1:00)",
      speech: "A maioria dos gestores e síndicos só se lembra dos bombeiros quando a fiscalização oficial bate de surpresa na porta. A consultoria diagnóstica age antes da dor...",
      bullets: [
        "Explique o valor da auditoria prévia antes da fiscalização oficial.",
        "Os riscos do atraso: Multas pesadas, embargos surpresa de portas fechadas e recusa de seguradoras prediais."
      ]
    },
    3: {
      title: "Slide 3: Vistoria Preventiva de Diagnóstico (Tempo: 1:10)",
      speech: "Nossa pré-vistoria técnica age de forma implacável caçando falhas ocultas em hidrantes, extintores, sinalizações fotoluminescentes, portas corta-fogo e SPDA...",
      bullets: [
        "Apresente as 4 fases da pré-vistoria técnica: 1. Equipamentos, 2. Rotas de Fuga, 3. Compartimentação, 4. Instalações (SPDA/Gás)."
      ]
    },
    4: {
      title: "Slide 4: Laudos & Relatórios de Engenharia (Tempo: 1:00)",
      speech: "Entregamos um Laudo Técnico de Conformidade e um Relatório de Engenharia oficial. Ele serve de bússola para a manutenção predial e prova documental ativa de compliance...",
      bullets: [
        "Explique o valor do Laudo de Engenharia assinado por especialistas da SC Fire.",
        "O documento serve de guia sem rodeios para a equipe predial e blinda o síndico civilmente."
      ]
    },
    5: {
      title: "Slide 5: Assessoria em Renovação sem Dores (Tempo: 0:50)",
      speech: "Renovar o atestado predial dos bombeiros gera enorme estresse. Assumimos 100% dessa responsabilidade: protocolamos nos portais digitais e acompanhamos o vistoriador no dia...",
      bullets: [
        "Identifique a maior dor do síndico comercial: o estresse do vencimento do atestado de bombeiros.",
        "Nossa assessoria atua no processo digital completo do CBMSC, agendando e acompanhando a vistoria oficial até a entrega do alvará na mão."
      ]
    },
    6: {
      title: "Slide 6: Fechamento & Instagram (Tempo: 1:00)",
      speech: "Em segurança de grandes edificações comerciais, a prevenção ativa é a única apólice real de sobrevivência. Não espere a fiscalização, chame a SC Fire Consultoria!",
      bullets: [
        "Aponte para o slide destacando seu nome, foto e o QR Code direcionando para o perfil do Instagram.",
        "Bordão Final: 'SC Fire: A segurança que seu projeto precisa, a tranquilidade que você merece!'"
      ]
    }
  }
};

const SLIDE_TARGETS_CUMULATIVE = [60, 120, 190, 250, 300, 420];

function UnifiedApresentacaoPageContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");
  const [isPending, startTransition] = useTransition();

  /* ═══ Core Main Cockpit States ═══ */
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

  // Class Timer
  const [initialSeconds, setInitialSeconds] = useState(0);
  const classTimer = useTimer(initialSeconds, activeClass?.status === "em_andamento");

  const completedCount = subthemes.filter((s) => s.completed).length;
  const progressPercent = subthemes.length > 0 ? Math.round((completedCount / subthemes.length) * 100) : 0;
  const activeSubtheme = subthemes[activeIndex];

  /* ═══ Core BNI Cockpit States ═══ */
  const [activeDeck, setActiveDeck] = useState<"eventos" | "projetos" | "treinamentos" | "consultoria" | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(420); // 7 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const slideContentRef = useRef<HTMLDivElement>(null);
  const bniTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          completed: i < activeIndex,
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

        setActiveClass((prev) =>
          prev
            ? {
                ...prev,
                status: "em_andamento",
                started_at: startTime,
              }
            : null
        );
        classTimer.setRunning(true);
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

  /* Keyboard shortcuts for Classes */
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

  /* ═══ Keyboard Event Listeners for BNI navigation ═══ */
  useEffect(() => {
    if (!activeDeck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextBniSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevBniSlide();
          break;
        case "p":
        case "P":
          e.preventDefault();
          setNotesOpen((o) => !o);
          break;
        case "t":
        case "T":
          e.preventDefault();
          setIsTestMode((t) => !t);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDeck, currentSlideIndex]);

  /* ═══ Handle BNI Timer Tick ═══ */
  useEffect(() => {
    if (!isRunning) {
      if (bniTimerIntervalRef.current) clearInterval(bniTimerIntervalRef.current);
      return;
    }

    const speed = isTestMode ? 100 : 1000;
    bniTimerIntervalRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          setIsRunning(false);
          if (bniTimerIntervalRef.current) clearInterval(bniTimerIntervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, speed);

    return () => {
      if (bniTimerIntervalRef.current) clearInterval(bniTimerIntervalRef.current);
    };
  }, [isRunning, isTestMode]);

  /* ═══ Dynamic Responsive Scaling Engine (Fit-to-Screen) for BNI ═══ */
  const adjustBniScale = () => {
    const slideContent = slideContentRef.current;
    if (!slideContent) return;

    const isMobile = window.innerWidth <= 768;
    const baseWidth = 1200;
    const baseHeight = 680;
    
    const paddingX = isMobile ? 30 : 180;
    const paddingY = isMobile ? 80 : 120;

    let availableWidth = window.innerWidth - paddingX;
    let availableHeight = window.innerHeight - paddingY;

    if (notesOpen && !isMobile) {
      availableWidth -= 420;
    }

    let scale;
    if (isMobile && window.innerHeight > window.innerWidth) {
      scale = availableWidth / baseWidth;
      scale = Math.max(scale, 0.28);
    } else {
      scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);
      scale = Math.max(scale, 0.35);
    }
    scale = Math.min(scale, 1.1);

    slideContent.style.transform = `scale(${scale})`;
    slideContent.style.transformOrigin = isMobile ? "top left" : "center center";
  };

  useEffect(() => {
    if (activeDeck) {
      adjustBniScale();
      window.addEventListener("resize", adjustBniScale);
      return () => window.removeEventListener("resize", adjustBniScale);
    }
  }, [activeDeck, currentSlideIndex, notesOpen]);

  useEffect(() => {
    if (activeDeck) {
      const intervals = [50, 150, 300, 450];
      intervals.forEach((ms) => {
        setTimeout(adjustBniScale, ms);
      });
    }
  }, [notesOpen]);

  /* ═══ Core BNI Slide Navigation Actions ═══ */
  const nextBniSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, 5));
  };

  const prevBniSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectBniDeck = (deck: "eventos" | "projetos" | "treinamentos" | "consultoria") => {
    setActiveDeck(deck);
    setCurrentSlideIndex(0);
    setTimeRemaining(420);
    setIsRunning(true);
  };

  const handleExitBniDeck = () => {
    setActiveDeck(null);
    setIsRunning(false);
    setIsTestMode(false);
  };

  /* ═══ BNI Pacing calculations ═══ */
  const getBniPaceStatus = () => {
    const elapsedSeconds = 420 - timeRemaining;
    const targetEnd = SLIDE_TARGETS_CUMULATIVE[currentSlideIndex];
    const targetStart = currentSlideIndex === 0 ? 0 : SLIDE_TARGETS_CUMULATIVE[currentSlideIndex - 1];
    const buffer = 15;

    if (elapsedSeconds < targetStart - buffer) {
      return { text: "Adiantado", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    } else if (elapsedSeconds > targetEnd + buffer) {
      return { text: "Atrasado", color: "text-red-500 bg-red-500/10 border-red-500/20" };
    } else {
      return { text: "No Ritmo", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
  };

  const pace = getBniPaceStatus();
  const bniMinutes = Math.floor(timeRemaining / 60);
  const bniSeconds = timeRemaining % 60;
  const bniProgressPercentage = (timeRemaining / 420) * 100;
  
  const bniActiveNote = activeDeck ? SPEAKER_NOTES[activeDeck][currentSlideIndex + 1] : null;

  /* ═══════════════════════════════════════════════════
     VIEW 1: MODO BNI APRESENTAÇÃO ATIVO
     ═══════════════════════════════════════════════════ */
  if (activeDeck) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090a0e] text-white flex flex-col font-sans overflow-hidden">
        {/* Glowing Background */}
        <div className="absolute inset-0 bg-[#090a0e] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[150px]" />
        </div>

        {/* TOP HEADER */}
        <header className="h-[80px] bg-[#0c0d12]/90 border-b border-white/[0.05] flex items-center justify-between px-6 flex-shrink-0 relative z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-red-500 tracking-tighter">SC</span>
            <span className="text-2xl font-black text-white tracking-tighter">FIRE</span>
            <span
              className={`px-3 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                activeDeck === "eventos"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : activeDeck === "projetos"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : activeDeck === "treinamentos"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/20"
              }`}
            >
              {activeDeck === "eventos" ? "Eventos" : activeDeck === "projetos" ? "SC Fire 1:1" : activeDeck === "treinamentos" ? "Treinamentos" : "Consultoria"}
            </span>
          </div>

          {/* BNI Timer System */}
          <div className="flex flex-col items-center max-w-[280px] md:max-w-[320px] w-full bg-[#13151b] border border-white/[0.06] rounded-xl px-4 py-2 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-1000" style={{ width: `${bniProgressPercentage}%` }} />
            <div className="flex items-center justify-between w-full z-10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-lg font-bold font-mono tracking-wider">
                  {String(bniMinutes).padStart(2, "0")}:{String(bniSeconds).padStart(2, "0")}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all duration-300 ${pace.color}`}>
                {pace.text}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExitBniDeck}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all font-semibold text-xs text-gray-300 hover:text-white"
              title="Mudar Apresentação (Voltar ao Seletor)"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Mudar Canal</span>
            </button>
            
            <button
              onClick={() => setIsTestMode((t) => !t)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-all font-semibold text-xs ${
                isTestMode 
                  ? "bg-amber-500/20 border-amber-500 text-amber-400" 
                  : "bg-white/[0.04] border-white/[0.08] hover:border-white/20 text-gray-300 hover:text-white"
              }`}
              title="Acelerar tempo do cronômetro para testes"
            >
              <span className="hidden sm:inline">10x Teste</span>
              <span className="sm:hidden">10x</span>
            </button>

            <button
              onClick={() => setNotesOpen((o) => !o)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-all font-semibold text-xs ${
                notesOpen 
                  ? "bg-primary/20 border-primary text-primary" 
                  : "bg-white/[0.04] border-white/[0.08] hover:border-white/20 text-gray-300 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Notas (P)</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTAINER */}
        <div className="flex-1 flex overflow-hidden relative z-10">
          <main className="flex-1 flex items-center justify-center relative p-6 overflow-hidden">
            <div
              ref={slideContentRef}
              className="w-[1200px] h-[680px] bg-[#0c0d12] border border-white/[0.05] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-12 transition-all duration-300 select-none"
            >
              {/* Orbs inside box */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/[0.02] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

              {/* BNI Slide 1: Cover Slide */}
              {currentSlideIndex === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-6 relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider animate-slide-up">
                    {activeDeck === "eventos" ? (
                      <>
                        <PartyPopper className="w-4 h-4 text-primary" />
                        <span>Desde 2012 — Origem no Planeta Atlântida</span>
                      </>
                    ) : activeDeck === "projetos" ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Engenharia de Prevenção & Projetos</span>
                      </>
                    ) : activeDeck === "treinamentos" ? (
                      <>
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span>Formação de Diário de Segurança</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-sky-400" />
                        <span>Auditoria Técnica & Consultoria</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-[44px] leading-tight font-extrabold tracking-tight text-white max-w-4xl font-display">
                    {activeDeck === "eventos" ? (
                      <>
                        A Segurança que seu Evento Precisa, <span className="text-red-500">a Tranquilidade que você Merece</span>
                      </>
                    ) : activeDeck === "projetos" ? (
                      <>
                        A Inteligência que seu Projeto Exige, <span className="text-amber-500">a Segurança que sua Edificação Precisa</span>
                      </>
                    ) : activeDeck === "treinamentos" ? (
                      <>
                        A Preparação que sua Equipe Exige, <span className="text-emerald-500">a Tranquilidade que você Merece</span>
                      </>
                    ) : (
                      <>
                        A Conformidade que seu Imóvel Exige, <span className="text-sky-400">a Segurança que seu Negócio Merece</span>
                      </>
                    )}
                  </h1>

                  <p className="text-gray-400 max-w-2xl leading-relaxed text-sm">
                    {activeDeck === "eventos" && "Nascemos em um dos maiores festivals do sul do país. Conheça nosso ecossistema de soluções preventivas baseadas na IN 24."}
                    {activeDeck === "projetos" && "Desatamos a burocracia do Corpo de Bombeiros através de engenharia preventiva e projetos técnicos contra incêndio de alto desempenho."}
                    {activeDeck === "treinamentos" && "Formação e Reciclagem Técnica de Brigadas Corporativas Orgânicas em estrita conformidade legal com a IN 28 do CBMSC."}
                    {activeDeck === "consultoria" && "Blindamos síndicos prediais e proprietários comerciais contra fiscalizações inesperadas de segurança contra incêndio."}
                  </p>

                  {/* Sgt Murilo Presenter Avatar on Cover for Treinamentos */}
                  {activeDeck === "treinamentos" && (
                    <div className="presenter-badge-cover mt-4">
                      <div className="presenter-badge-avatar">
                        <img src="/murilo.png" alt="Sargento BM Murilo Galdino" className="presenter-badge-img" />
                        <div className="presenter-badge-glow" />
                      </div>
                      <div className="presenter-badge-info">
                        <h4 className="font-bold text-sm text-white text-left">Sargento BM Murilo Galdino</h4>
                        <p className="text-xs text-gray-400 text-left">Especialista de Referência — Divisão de Treinamentos</p>
                      </div>
                    </div>
                  )}

                  {/* Cover Grid Pillars */}
                  <div className="grid grid-cols-3 gap-6 w-full max-w-[950px] mt-8">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        {activeDeck === "eventos" ? <PartyPopper className="w-5 h-5" /> : activeDeck === "projetos" ? <FileCheck2 className="w-5 h-5" /> : activeDeck === "treinamentos" ? <Users className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase">{activeDeck === "eventos" ? "EVENTOS (IN 24)" : activeDeck === "projetos" ? "PPCI Predial" : activeDeck === "treinamentos" ? "Brigadas Orgânicas" : "Pré-Vistoria Diagnóstica"}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {activeDeck === "eventos" && "Projetos temporários, vistorias estruturais rápidas e Brigadistas sob a IN 24."}
                        {activeDeck === "projetos" && "Elaboração de Projetos Preventivos para condomínios e indústrias."}
                        {activeDeck === "treinamentos" && "Capacitação obrigatória de colaboradores locais (IN 28) para controle de pânico."}
                        {activeDeck === "consultoria" && "Auditoria de conformidade predial sob as 35 Instruções Normativas."}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        {activeDeck === "eventos" ? <FileText className="w-5 h-5" /> : activeDeck === "projetos" ? <Award className="w-5 h-5" /> : activeDeck === "treinamentos" ? <ShieldCheck className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5" />}
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase">{activeDeck === "eventos" ? "PROJETOS" : activeDeck === "projetos" ? "Regularização (AVCB)" : activeDeck === "treinamentos" ? "Brigadistas Particulares" : "Laudos & Pareceres"}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {activeDeck === "eventos" && "Elaboração e aprovação de PPCI e Habite-se de edificações prediais."}
                        {activeDeck === "projetos" && "Protocolo digital rápido para Habite-se predial e alvarás dos bombeiros."}
                        {activeDeck === "treinamentos" && "Formação técnica e reciclagens homologadas para atuação comercial dedicada."}
                        {activeDeck === "consultoria" && "Atestados de gás, alarmes de incêndio, portas corta-fogo e SPDA."}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        {activeDeck === "eventos" ? <GraduationCap className="w-5 h-5" /> : activeDeck === "projetos" ? <Sliders className="w-5 h-5" /> : activeDeck === "treinamentos" ? <Activity className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase">{activeDeck === "eventos" ? "TREINAMENTOS" : activeDeck === "projetos" ? "Alto Desempenho" : activeDeck === "treinamentos" ? "Primeiros Socorros" : "Renovação Simplificada"}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {activeDeck === "eventos" && "Capacitação técnica de brigadas orgânicas internas e primeiros socorros."}
                        {activeDeck === "projetos" && "Estudos de fluidodinâmica 3D por supercomputadores (CFD)."}
                        {activeDeck === "treinamentos" && "RCP teórico-prático homologado de acordo com a Lei Lucas."}
                        {activeDeck === "consultoria" && "Assessoria digital burocrática para licenciamento anual sem multas."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BNI Slide 2: Setor / Dores / Exigências */}
              {currentSlideIndex === 1 && (
                <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{activeDeck === "eventos" ? "Força do Setor" : activeDeck === "projetos" ? "Segurança Jurídica" : activeDeck === "treinamentos" ? "Conformidade Legal" : "Por que Consultoria?"}</span>
                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                    {activeDeck === "eventos" && <>O Impacto Gigante do <span className="text-red-500">Turismo de Eventos em Floripa</span></>}
                    {activeDeck === "projetos" && <>Por que Regularizar? <span className="text-amber-500">Riscos e Sanções Inesperadas</span></>}
                    {activeDeck === "treinamentos" && <>A Exigência Técnica da <span className="text-emerald-400 font-display">Instrução Normativa 28</span></>}
                    {activeDeck === "consultoria" && <>A Auditoria Preventiva: <span className="text-sky-400">Aja Antes da Fiscalização</span></>}
                  </h2>

                  <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-base font-bold text-white">{activeDeck === "eventos" ? "Serviços em Floripa" : activeDeck === "projetos" ? "O Escudo do Alvará" : activeDeck === "treinamentos" ? "Plano de Implantação (PIBI)" : "Conformidade Antecipada"}</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {activeDeck === "eventos" && "O turismo de eventos é vital e move a economia da nossa capital de forma contínua."}
                        {activeDeck === "projetos" && "Possuir o AVCB ou Habite-se em dia blinda a sua empresa perante fiscalizações prediais de rotina."}
                        {activeDeck === "treinamentos" && "Sob a IN 28 do Corpo de Bombeiros (CBMSC), a regularidade predial exige a constituição da brigada orgânica corporativa."}
                        {activeDeck === "consultoria" && "Não espere a vistoria oficial surpresa de rotina dos oficiais bombeiros ou seguradoras prediais para consertar pendências."}
                      </p>
                      <div className="space-y-3 pt-2">
                        <div className="flex gap-4 items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                          <span className="text-xl font-extrabold text-emerald-400">{activeDeck === "eventos" ? "76,1%" : activeDeck === "projetos" ? "100% Legal" : activeDeck === "treinamentos" ? "PIBI Exigido" : "Varredura"}</span>
                          <span className="text-[11px] text-gray-300 leading-relaxed">{activeDeck === "eventos" ? "Do PIB Municipal gerado pelo Setor de Serviços." : activeDeck === "projetos" ? "Total conformidade contra multas de fiscalização predial." : activeDeck === "treinamentos" ? "Obrigatório o protocolo digital no CBMSC para renovar atestado." : "Inspeção cirúrgica prévia em mais de 35 normas preventivas."}</span>
                        </div>
                        <div className="flex gap-4 items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                          <span className="text-xl font-extrabold text-emerald-400">{activeDeck === "eventos" ? "R$ 100 Mi" : activeDeck === "projetos" ? "Seguro Ativo" : activeDeck === "treinamentos" ? "Brigadistas" : "Segurança"}</span>
                          <span className="text-[11px] text-gray-300 leading-relaxed">{activeDeck === "eventos" ? "Faturamento médio mensal de grandes eventos na cidade." : activeDeck === "projetos" ? "Garante total liquidez securitária em caso de sinistro." : activeDeck === "treinamentos" ? "Dimensione e prepare o número ideal de funcionários." : "Fim do estresse de multas ou lacração surpresa das portas."}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-center space-y-4 border-l-red-500/40 border-l-4 text-left">
                      <h4 className="text-sm font-bold text-red-500 flex items-center gap-1.5 uppercase">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        As Dores e Custos da Falha Preventiva
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        A ausência de prevenção profissional ativa gera consequências severas que paralisam negócios e eventos na véspera da abertura:
                      </p>
                      <ul className="space-y-3.5 pt-2 text-left">
                        {[
                          "Embargos e lacrações surpresas aplicadas na véspera do seu evento ou funcionamento comercial.",
                          "Processos criminais e responsabilidade civil direta sobre os organizadores, síndicos e gestores em caso de incidentes.",
                          "Quebra irreversível de reputação de marca e recusa total de cobertura financeira de seguradoras.",
                        ].map((pain, pIdx) => (
                          <li key={pIdx} className="flex gap-2 items-start text-xs text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                            <span className="leading-tight">{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* BNI Slide 3: Flow do trabalho */}
              {currentSlideIndex === 2 && (
                <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold max-w-fit uppercase tracking-wider animate-slide-up">
                    <GitCommit className="w-4 h-4" />
                    <span>Engenharia de Ação</span>
                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-white font-display text-left">
                    O Fluxo Operacional: <span className="text-red-500 font-black">Como Blindamos sua Operação</span>
                  </h2>

                  <div className="grid grid-cols-4 gap-4 w-full">
                    {[
                      { step: "Fase 1: Mapeamento", title: activeDeck === "eventos" ? "Briefing Técnico" : activeDeck === "projetos" ? "Vistoria Diagnóstica" : activeDeck === "treinamentos" ? "Análise de Riscos" : "Vistoria Prévia", desc: activeDeck === "eventos" ? "Estudo de lotação, rotas de fuga e vistorias de palcos." : activeDeck === "projetos" ? "Coleta de dados da edificação e layouts físicos locais." : activeDeck === "treinamentos" ? "Avaliação predial sob a IN 28 e dimensionamento." : "Inspeção dos hidrantes, SPDA, alarmes e rotas." },
                      { step: "Fase 2: Projeto", title: activeDeck === "eventos" ? "Documentação Ágil" : activeDeck === "projetos" ? "Projetos em CAD" : activeDeck === "treinamentos" ? "Conteúdo Programático" : "Roteiro Técnico", desc: activeDeck === "eventos" ? "Montagem técnica rápida de projetos e ARTs junto ao CBMSC." : activeDeck === "projetos" ? "Desenho técnico preventivo completo e dimensionamento de rotas." : activeDeck === "treinamentos" ? "Planejamento didático teórico-prático personalizado." : "Geração de Laudo Técnico detalhado sem rodeios." },
                      { step: "Fase 3: Protocolo", title: activeDeck === "eventos" ? "Dimensionamento" : activeDeck === "projetos" ? "Protocolo CBMSC" : activeDeck === "treinamentos" ? "Treinamento Realista" : "Trâmite Preventivo", desc: activeDeck === "eventos" ? "Escala precisa e legal de brigada de bombeiros civis." : activeDeck === "projetos" ? "Acompanhamento digital burocrático de análises do órgão." : activeDeck === "treinamentos" ? "Uso de fogo real e RCP massagem prática assistida." : "Varredura de conformidades de gás e extintores." },
                      { step: "Fase 4: Operação", title: activeDeck === "eventos" ? "Vistoria & Ação" : activeDeck === "projetos" ? "Vistoria & Alvará" : activeDeck === "treinamentos" ? "Homologação" : "Habite-se Concedido", desc: activeDeck === "eventos" ? "Brigada ativa de prontidão e vistoria rígida no local." : activeDeck === "projetos" ? "Acompanhamento de vistorias técnicas até alvará na mão." : activeDeck === "treinamentos" ? "Emissão de certificados na DAT/CBMSC de forma ágil." : "Entrega do atestado do CBMSC renovado sem multas." }
                    ].map((stepObj, sIdx) => (
                      <div key={sIdx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-left flex flex-col justify-between h-[280px] hover:border-red-500/20 hover:bg-white/[0.03] transition-all duration-300 relative group">
                        <div className="absolute top-4 right-4 text-xs font-extrabold text-red-500/25 group-hover:text-red-500/50 transition-colors">0{sIdx + 1}</div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest block">{stepObj.step}</span>
                          <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{stepObj.title}</h4>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{stepObj.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BNI Slide 4: Case Centrosul (Eventos/Treinamento/Consultoria) ou CFD Simulation Grid (Projetos) */}
              {currentSlideIndex === 3 && (
                <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                  {activeDeck === "projetos" ? (
                    <>
                      {/* CFD 1:1 Special Grid Simulation */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold max-w-fit uppercase tracking-wider animate-pulse">
                        <Sliders className="w-4 h-4" />
                        <span>Fluidodinâmica CFD em Ação</span>
                      </div>

                      <h2 className="text-3xl font-extrabold tracking-tight text-white font-display text-left">
                        Engenharia Computacional 3D: <span className="text-amber-500">Projeto Baseado em Desempenho</span>
                      </h2>

                      <div className="grid grid-cols-2 gap-8 w-full">
                        {/* Simulation Screen */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-[#06070a] h-[300px] overflow-hidden flex items-center justify-center group shadow-2xl">
                          <div className="absolute inset-0 grid-mesh opacity-20 pointer-events-none" />
                          <div className="absolute inset-0 m-auto w-[90%] h-[80%] border border-dashed border-amber-500/15 rounded-xl flex items-center justify-center">
                            <span className="text-[10px] text-amber-500/40 uppercase tracking-widest font-mono absolute top-4">Simulation Room: Garage_Sub_Floor_3</span>
                            <span className="text-[10px] text-amber-500/40 uppercase tracking-widest font-mono absolute bottom-4">CFD ACTIVE MODELING</span>
                            {/* Scanning laser line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-amber-500/60 shadow-[0_0_12px_#f59e0b] animate-laser z-10" />
                            {/* Static CFD diagram vector */}
                            <svg className="w-56 h-56 text-amber-500/20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" />
                              <path d="M20 100H180" stroke="currentColor" strokeWidth="2" />
                              <path d="M100 20V180" stroke="currentColor" strokeWidth="2" />
                              <path d="M50 50L150 150" stroke="currentColor" strokeWidth="1" />
                              <path d="M150 50L50 150" stroke="currentColor" strokeWidth="1" />
                            </svg>
                          </div>
                        </div>

                        {/* Text explanation */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between text-left h-[300px]">
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">Alternativa Científica de Economia de Obras</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              A Engenharia de Desempenho utiliza modelagem computacional 3D por supercomputadores para avaliar o trajeto real de gases tóxicos e calor.
                            </p>
                            <div className="space-y-3.5 pt-2">
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <span>Evita obras físicas civis que custariam centenas de milhares em exaustores desnecessários.</span>
                              </div>
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <span>Garante total respaldo legal e aprovação junto às diretorias técnicas de grandes metrópoles.</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">SC FIRE ENGENHARIA — EFICIÊNCIA DE PONTAS</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Case Centrosul (Eventos / Treinamentos / Consultoria) */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Aprender com a História</span>
                      </div>

                      <h2 className="text-3xl font-extrabold tracking-tight text-white font-display text-left">
                        Estudo de Caso: <span className="text-red-500">O Acidente do Centrosul em 2015</span>
                      </h2>

                      <div className="grid grid-cols-2 gap-8 w-full text-left">
                        {/* Newspaper/Accident visual mockup */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 overflow-hidden shadow-2xl flex flex-col justify-between h-[300px]">
                          <div className="space-y-4">
                            <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest">Notícia Oficial — Florianópolis</span>
                            <h4 className="text-lg font-bold text-white leading-tight font-display">Desabamento de Painel de LED fere 6 pessoas em Centro de Eventos</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Um painel de LED pesando **1 tonelada** desabou de uma altura de 5 metros durante a montagem de um congresso nacional no Centrosul, ferindo gravemente seis trabalhadores técnicos locais.
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-white/[0.05] pt-3">
                            <span>Fonte: Imprensa Local (2015)</span>
                            <span className="font-extrabold text-red-500/60 uppercase">PPCI INCOMPLETO</span>
                          </div>
                        </div>

                        {/* Analysis of cause and prevention */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-left flex flex-col justify-between h-[300px]">
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">As Causas Técnicas da Tragédia</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              A investigação revelou que a estrutura do palco foi alterada de última hora sem avaliação prévia de engenheiro responsável e sem projeto preventivo do Corpo de Bombeiros (AVCB temporário).
                            </p>
                            <div className="space-y-3.5 pt-2">
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span>Montagem improvisada de alta tonelagem sem ART de responsabilidade.</span>
                              </div>
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>**Ação SC Fire:** Nossas vistorias estruturais são diárias no dia do evento, exigindo todas as ARTs e prevenindo acidentes.</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">A PREVENÇÃO SALVA VIDAS E REPUTAÇÕES</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* BNI Slide 5: Ação 60 Segundos (Eventos/Treinamentos/Consultoria) ou SAVE Bateria de Lítio (Projetos) */}
              {currentSlideIndex === 4 && (
                <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                  {activeDeck === "projetos" ? (
                    <>
                      {/* Lithium battery thermal CFD simulation model */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold max-w-fit uppercase tracking-wider animate-pulse">
                        <BatteryCharging className="w-4 h-4" />
                        <span>Carros Elétricos — Risco Térmico IN 23</span>
                      </div>

                      <h2 className="text-3xl font-extrabold tracking-tight text-white font-display text-left">
                        Segurança em Pontos de Recarga: <span className="text-amber-500">Simulação de Bateria Coletiva</span>
                      </h2>

                      <div className="grid grid-cols-2 gap-8 w-full">
                        {/* Simulation Screen */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-[#06070a] h-[300px] overflow-hidden flex items-center justify-center group shadow-2xl">
                          <div className="absolute inset-0 grid-mesh opacity-20 pointer-events-none" />
                          <div className="absolute inset-0 m-auto w-[90%] h-[80%] border border-dashed border-amber-500/15 rounded-xl flex items-center justify-center">
                            <span className="text-[10px] text-amber-500/40 uppercase tracking-widest font-mono absolute top-4">IN 23 SAVE - Lithium Thermal Test</span>
                            
                            {/* Scanning laser line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-sky-400/60 shadow-[0_0_12px_#38bdf8] animate-laser z-10" />

                            {/* Simulated smoke puff elements */}
                            <div className="absolute bottom-[-10px] left-[15%] w-36 h-36 bg-white/[0.03] rounded-full blur-xl animate-smoke-1" />
                            <div className="absolute bottom-[-10px] left-[45%] w-40 h-40 bg-white/[0.04] rounded-full blur-xl animate-smoke-2" />
                            <div className="absolute bottom-[-10px] right-[15%] w-32 h-32 bg-white/[0.03] rounded-full blur-xl animate-smoke-3" />

                            {/* Battery design icon with red glowing pulse */}
                            <div className="flex flex-col items-center space-y-3 relative z-20">
                              <div className="w-32 h-16 rounded-xl border-4 border-white/20 bg-white/5 relative flex items-center justify-center shadow-inner overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 bg-red-600/30 animate-thermal-pulse" style={{ width: "70%" }} />
                                <span className="text-red-500 font-bold font-mono text-sm animate-pulse">65°C CRITICAL</span>
                              </div>
                              <span className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest font-mono">BATERIA LÍTIO ACTIVE</span>
                            </div>
                          </div>
                        </div>

                        {/* Text explanation */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between text-left h-[300px]">
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">Instrução Normativa 23 do CBMSC</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Baterias de carros elétricos em subsolos geram fumaça extremamente tóxica e calor superior a 1000°C.
                            </p>
                            <div className="space-y-3.5 pt-2">
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <span>A SC Fire projeta sistemas automatizados de controle de dispersão de calor e fumaça em garagens.</span>
                              </div>
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <span>Total conformidade com o regramento mais moderno do Corpo de Bombeiros (SAVE).</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">SC FIRE — CONSULTORIA TÉCNICA DE ALTO DESEMPENHO</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Slide 5: Response Time display (Eventos / Treinamentos / Consultoria) */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                        <Activity className="w-4 h-4" />
                        <span>Matemática do Tempo de Resposta</span>
                      </div>

                      <h2 className="text-3xl font-extrabold tracking-tight text-white font-display text-left">
                        Ação Rápida em 60 Segundos: <span className="text-emerald-400">Como Evitamos Tragédias</span>
                      </h2>

                      <div className="grid grid-cols-2 gap-8 w-full">
                        {/* Simulation Screen */}
                        <div className="cfd-response-display w-full max-h-[220px] self-center">
                          <div className="response-timeline">
                            <div className="response-node node-brigade">
                              <div className="flex justify-between items-center w-full">
                                <span className="node-label">Brigada Orgânica SC Fire</span>
                                <span className="node-badge-time">01 min (Ação)</span>
                              </div>
                              <div className="node-bar-container">
                                <div className="node-bar bar-green" style={{ width: "20%" }} />
                              </div>
                              <span className="node-status text-green text-left">Princípio de incêndio controlado na origem.</span>
                            </div>

                            <div className="response-node node-bombeiros">
                              <div className="flex justify-between items-center w-full">
                                <span className="node-label">Bombeiros Oficiais (Tempo Médio)</span>
                                <span className="node-badge-time">10+ min (Caminhão)</span>
                              </div>
                              <div className="node-bar-container">
                                <div className="node-bar bar-red" style={{ width: "100%" }} />
                              </div>
                              <span className="node-status text-red text-left">Grandes estragos estruturais e risco severo.</span>
                            </div>
                          </div>
                        </div>

                        {/* Text explanation */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between text-left h-[300px]">
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">Por que Treinar Colaboradores?</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Devido ao trânsito, o tempo de resposta do caminhão oficial pode ultrapassar 10 minutos. O primeiro minuto combatido localmente decide o futuro patrimonial e humano da edificação.
                            </p>
                            <div className="space-y-3.5 pt-2">
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>**Extinção Imediata:** A brigada atua combatendo a chama no princípio absoluto do foco.</span>
                              </div>
                              <div className="flex gap-2 items-start text-xs text-gray-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>**Controle de Pânico:** Colaboradores treinados orquestram saídas de emergência ordenadas.</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">A SUA EQUIPE COMO ESCUDO PREVENTIVO ATIVO</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* BNI Slide 6: Final Slide / Contacts & References */}
              {currentSlideIndex === 5 && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-6 relative animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Parceria de Confiança</span>
                  </div>

                  <h2 className="text-4xl font-extrabold tracking-tighter text-white font-sans">SC FIRE</h2>
                  <p className="text-red-500 text-sm font-semibold tracking-wide italic">"A segurança que seu negócio precisa, a tranquilidade que você merece!"</p>
                  
                  <div className="grid grid-cols-3 gap-8 w-full max-w-[1000px] items-center pt-4">
                    {/* Left Column - Dynamic Presenter Information */}
                    <div className="col-span-1 flex flex-col items-center pr-6 border-r border-white/[0.08]">
                      {activeDeck !== "consultoria" ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-white/5 relative presenter-avatar-wrapper shadow-lg">
                            <img
                              src={activeDeck === "projetos" ? "/dione.png" : activeDeck === "treinamentos" ? "/murilo.png" : "/apresentador.png"}
                              alt="Apresentador"
                              className="w-full h-full object-cover presenter-avatar-cover"
                            />
                            <div className="absolute inset-0 bg-fire-gradient opacity-20 pointer-events-none" />
                          </div>
                          <div className="space-y-1 text-center">
                            <h4 className="font-bold text-sm text-white">
                              {activeDeck === "projetos" ? "Dione Borges" : activeDeck === "treinamentos" ? "Sargento BM Murilo Galdino" : "Paulo Roberto Ramos"}
                            </h4>
                            <p className="text-[10px] text-gray-400 leading-normal">
                              {activeDeck === "projetos" ? "Engenheira Civil & PPCI" : activeDeck === "treinamentos" ? "Especialista em Brigadas & Treinamentos" : "Especialista Operacional & Diretor"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          {/* 3 mini cards side-by-side for Consultoria */}
                          <div className="flex gap-2">
                            {["/apresentador.png", "/dione.png", "/murilo.png"].map((img, i) => (
                              <div key={i} className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-white/5 relative">
                                <img src={img} alt="Consultor" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 text-center">
                            <h4 className="font-bold text-sm text-white">Equipe Multidisciplinar</h4>
                            <p className="text-[10px] text-gray-400">Auditores Especialistas</p>
                            <span className="inline-flex mt-1 text-[8px] font-bold tracking-widest text-amber-400 border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">Referência Técnica</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center Column - Instagram QR code */}
                    <div className="col-span-1 flex flex-col items-center justify-center space-y-3">
                      <a
                        href="https://www.instagram.com/sc.fire.engenharia/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] shadow-inner hover:border-emerald-500/30 transition-all duration-300"
                      >
                        <div className="w-24 h-24 bg-white p-1.5 rounded-xl flex items-center justify-center relative shadow-md">
                          <img src="/qrcode.png" alt="QR Code Instagram" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 m-auto w-7 h-7 bg-white rounded-full flex items-center justify-center border border-gray-100 text-red-500 shadow-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <span className="text-[10px] text-gray-400 font-semibold">Escaneie para seguir</span>
                    </div>

                    {/* Right Column - Contact Commercial details */}
                    <div className="col-span-1 flex flex-col items-start gap-4 pl-6 border-l border-white/[0.08] text-left">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-emerald-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h5 className="text-[10px] text-gray-400 font-semibold uppercase">WhatsApp Comercial</h5>
                          <p className="text-xs font-bold text-white">(48) 99141-2186</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-sky-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h5 className="text-[10px] text-gray-400 font-semibold uppercase">Portal Oficial</h5>
                          <p className="text-xs font-bold text-white">scfire.com.br</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation overlay buttons */}
              <button
                onClick={prevBniSlide}
                disabled={currentSlideIndex === 0}
                className={`absolute left-10 p-3.5 rounded-full border border-white/[0.08] bg-[#0c0d12]/70 text-gray-400 hover:text-white transition-all shadow-lg backdrop-blur-md ${currentSlideIndex === 0 ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextBniSlide}
                disabled={currentSlideIndex === 5}
                className={`absolute right-10 p-3.5 rounded-full border border-white/[0.08] bg-[#0c0d12]/70 text-gray-400 hover:text-white transition-all shadow-lg backdrop-blur-md ${currentSlideIndex === 5 ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </main>

          {/* RIGHT DRAWER: Speaker Notes */}
          <aside
            className={`
              w-[420px] bg-[#0c0d12] border-l border-white/[0.05] flex flex-col flex-shrink-0 relative z-20 transition-all duration-300 ease-in-out
              ${notesOpen ? "mr-0" : "-mr-[420px] pointer-events-none opacity-0"}
            `}
          >
            <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Notas do Apresentador</span>
              </h3>
              <button
                onClick={() => setNotesOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {bniActiveNote ? (
                <>
                  <div className="space-y-2 text-left">
                    <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider">
                      {bniActiveNote.title}
                    </h4>
                    <p className="text-xs font-bold text-white leading-relaxed bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                      {bniActiveNote.speech}
                    </p>
                  </div>

                  <div className="space-y-3 text-left">
                    <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Dicas e Bulletpoints Focados
                    </h5>
                    <ul className="space-y-2.5">
                      {bniActiveNote.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-gray-300 leading-normal">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500 italic text-left">Selecione um slide para ver as anotações faladas.</p>
              )}
            </div>

            <div className="p-4 border-t border-white/[0.05] bg-[#090a0e] text-center text-[10px] text-gray-500 font-semibold tracking-wider">
              Obrigado, equipe BNI! SC Fire.
            </div>
          </aside>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     VIEW 2: UNIFIED SPLIT-SCREEN WELCOME PAGE
     ═══════════════════════════════════════════════════ */
  if (!activeClass) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#090a0e] relative overflow-hidden px-6 py-12">
        {/* Glow decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary">Central Unificada de Apresentação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Selecione o Roteiro da Transmissão
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
              Escolha entre a orquestração de aulas presenciais do catálogo ou os pitches estratégicos de 7 minutos do BNI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* LEFT COLUMN: Classes from Supabase */}
            <div className="glass rounded-3xl p-6 border border-white/[0.05] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white">Treinamentos Presenciais</h3>
                    <p className="text-xs text-gray-400">Aulas ativas e agendadas com os alunos</p>
                  </div>
                </div>

                {loadingClasses ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-400">Buscando turmas...</p>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl space-y-4">
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Nenhuma turma ativa ou agendada cadastrada no Supabase neste momento. As turmas são criadas após propostas aceitas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => setActiveClass(cls)}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-between cursor-pointer group text-left"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <h4 className="text-sm font-bold text-white truncate">{cls.company?.name || "Empresa"}</h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{cls.training?.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/instrutor/comercial")}
                className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-primary hover:text-white transition-all text-xs font-bold text-gray-300"
              >
                Configurar Venda / Nova Turma
              </button>
            </div>

            {/* RIGHT COLUMN: BNI Pitches */}
            <div className="glass rounded-3xl p-6 border border-white/[0.05] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white">Apresentações BNI (7 Minutos)</h3>
                    <p className="text-xs text-gray-400">Roteiros estratégicos de 1:1 e palestras de negócios</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "eventos", title: "SC Fire Eventos", icon: PartyPopper, color: "text-red-400 bg-red-500/10 border-red-500/20" },
                    { key: "projetos", title: "SC Fire 1:1 / Projetos", icon: ShieldCheck, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                    { key: "treinamentos", title: "SC Fire Treinamentos", icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                    { key: "consultoria", title: "SC Fire Consultoria", icon: Sliders, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" }
                  ].map((deck) => (
                    <button
                      key={deck.key}
                      onClick={() => handleSelectBniDeck(deck.key as any)}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between items-start h-[120px] text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${deck.color} flex items-center justify-center`}>
                        <deck.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors mt-2">{deck.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-500 font-semibold py-2">
                CRONÔMETROS E NOTAS FALADAS INTEGRADAS
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     VIEW 3: TURMA AGENDADA (TELA DE ESPERA)
     ═══════════════════════════════════════════════════ */
  if (activeClass.status === "agendada") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden px-6">
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
     VIEW 4: COCKPIT PRINCIPAL (AULA EM ANDAMENTO)
     ═══════════════════════════════════════════════════ */
  return (
    <div className={`flex flex-col h-dvh overflow-hidden bg-background text-foreground select-none relative ${isPending ? "opacity-75 pointer-events-none" : ""}`}>
      {/* Top bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">AULA ATIVA</span>
          </div>

          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-lg bg-surface border border-border text-left">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{activeClass.company?.name}</span>
            <span className="text-border flex-shrink-0">|</span>
            <GraduationCap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-[200px]">{activeClass.training?.name}</span>
          </div>
        </div>

        {/* Timer, status and finalize */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">{attendances.length} alunos</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-border">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold font-mono tracking-wider">{classTimer.formatted}</span>
          </div>

          <button
            onClick={finishClass}
            className="h-9 px-4 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors text-xs font-bold shadow-md shadow-destructive/10"
          >
            Finalizar Aula
          </button>
          
          <button
            onClick={() => setActiveClass(null)}
            className="p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Voltar para seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Subthemes list */}
        <aside
          className={`
            bg-card border-r border-border flex flex-col flex-shrink-0 z-10 transition-all duration-300 ease-in-out relative
            ${sidebarCollapsed ? "w-0 -translate-x-full pointer-events-none opacity-0" : "w-72"}
          `}
        >
          {/* Progress Section */}
          <div className="p-5 border-b border-border bg-surface/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Progresso Técnico</span>
              <span className="text-xs font-extrabold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-fire-gradient-strong transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
              <span>{completedCount} concluídos</span>
              <span>{subthemes.length - completedCount} restantes</span>
            </div>
          </div>

          {/* Subtheme Scroll list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingSubthemes ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Carregando ementa...</p>
              </div>
            ) : subthemes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-12">Nenhum subtema associado.</p>
            ) : (
              subthemes.map((sub, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={sub.id}
                    onClick={() => goToSubtheme(idx)}
                    className={`
                      w-full p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden group
                      ${
                        isActive
                          ? "bg-primary/10 border-primary shadow-md shadow-primary/5"
                          : sub.completed
                            ? "bg-surface/40 border-border text-muted-foreground hover:bg-surface/70"
                            : "bg-card border-border hover:border-primary/20 hover:bg-surface/20"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3 relative z-10 text-left">
                      <div
                        className={`
                          w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border text-[10px] font-bold transition-all
                          ${
                            isActive
                              ? "bg-primary border-primary text-white"
                              : sub.completed
                                ? "bg-[#22c55e] border-[#22c55e] text-white"
                                : "bg-surface border-border text-muted-foreground"
                          }
                        `}
                      >
                        {sub.completed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold leading-snug ${isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                          {sub.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground font-semibold">
                          <span className="uppercase tracking-wider">{sub.category}</span>
                          <span>·</span>
                          <span>{sub.duration}</span>
                          <span>·</span>
                          <span className="uppercase">{sub.level}</span>
                        </div>
                      </div>
                    </div>

                    {isActive && <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* CENTER CANVA VIEWPORT */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#07080b] p-6 relative">
          <div className="flex-1 rounded-2xl overflow-hidden bg-card border border-border shadow-2xl relative">
            {activeSubtheme ? (
              activeSubtheme.canva_embed ? (
                <iframe
                  src={cleanCanvaUrl(activeSubtheme.canva_embed)}
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen
                  allow="fullscreen"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-muted-foreground border border-border shadow-inner">
                    <MonitorPlay className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-base font-bold text-foreground">Apresentação não Vinculada</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este subtema (**{activeSubtheme.title}**) não possui um link de apresentação do Canva cadastrado no catálogo.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-muted-foreground border border-border shadow-inner">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">Carregando Material</h3>
                  <p className="text-xs text-muted-foreground">Aguarde enquanto os subtemas são sincronizados.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom navigation bar */}
          <div className="h-16 flex items-center justify-between mt-4 flex-shrink-0 z-10 px-4 bg-card/60 backdrop-blur border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToSubtheme(Math.max(activeIndex - 1, 0))}
                disabled={activeIndex === 0}
                className="h-10 px-4 rounded-lg bg-surface border border-border text-xs font-semibold hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              <button
                onClick={() => goToSubtheme(Math.min(activeIndex + 1, subthemes.length - 1))}
                disabled={activeIndex === subthemes.length - 1}
                className="h-10 px-4 rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              >
                Avançar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLibraryOpen(true)}
                className="h-10 px-4 rounded-lg bg-surface border border-border text-xs font-semibold hover:text-foreground hover:bg-muted flex items-center gap-2"
              >
                <Library className="w-4 h-4 text-primary" />
                Biblioteca Rápida
              </button>
              
              <button
                onClick={() => setQrModalOpen(true)}
                className="h-10 px-4 rounded-lg bg-surface border border-border text-xs font-semibold hover:text-foreground hover:bg-muted flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-accent" />
                QR Code Presença
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── RAPID LIBRARY MODAL ── */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Library className="w-5 h-5 text-primary" />
                Biblioteca Rápida de Matérias
              </h3>
              <button
                onClick={() => setLibraryOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto space-y-2">
              {subthemes.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => goToSubtheme(idx)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                    idx === activeIndex
                      ? "bg-primary/10 border-primary"
                      : "bg-surface/50 border-border hover:bg-surface"
                  }`}
                >
                  <h4 className="text-xs font-bold text-foreground">{sub.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground uppercase font-semibold">
                    <span>{sub.category}</span>
                    <span>·</span>
                    <span>{sub.duration}</span>
                    <span>·</span>
                    <span>{sub.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QR CODE PRESENÇA MODAL ── */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6 text-center animate-scale-in">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6 pt-4">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Registro de Presença</h3>
                <p className="text-xs text-muted-foreground">
                  Peça para os alunos escanearem o QR Code abaixo com a câmera do celular para registrar presença oficial na aula.
                </p>
              </div>

              {/* QR Code Placeholder container */}
              <div className="w-56 h-56 bg-white p-3 rounded-2xl mx-auto shadow-inner flex items-center justify-center relative border border-border">
                <img src="/qrcode.png" alt="QR Code Presença" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
                <button
                  onClick={handleCopyLink}
                  className="h-10 rounded-xl bg-surface border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-2"
                >
                  {copyFeedback ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copyFeedback ? "Link Copiado!" : "Copiar Link de Check-in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedApresentacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-[#f3f3f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase font-semibold">Carregando cockpit unificado...</p>
        </div>
      </div>
    }>
      <UnifiedApresentacaoPageContent />
    </Suspense>
  );
}
