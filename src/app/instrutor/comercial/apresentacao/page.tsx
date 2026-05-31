"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  FileText,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  LogOut,
  Mail,
  MessageSquare,
  Globe,
  Award,
  ShieldCheck,
  PartyPopper,
  Users,
  Activity,
  AlertTriangle,
  Coins,
  ShieldAlert,
  GitCommit,
  ClipboardSignature,
  FileCheck2,
  AlertOctagon,
  HeartHandshake,
  Building2,
  Warehouse,
  PencilRuler,
  Sliders,
  TrendingDown,
  Wind,
  BatteryCharging,
  Construction,
  BookOpen,
  HeartPulse,
  Factory,
  GraduationCap,
  FileSearch,
  ClipboardCheck,
  RefreshCw,
  DoorClosed,
  Laptop,
  CheckCircle,
  Briefcase,
  Key,
} from "lucide-react";

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
        "Fale sobre o painel de LED de uma tonelada que desabou no Centrosul em 2015, ferindo 6 pessoas.",
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
        "Fase 2 (Prática): Combate a chamas reais com extintores e mangueiras sob calor real.",
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

/* Slide cumulative target durations (in seconds) - 6 slides in Next.js training portal */
const SLIDE_TARGETS_CUMULATIVE = [60, 120, 190, 250, 300, 420];

export default function BniPresentationPage() {
  const router = useRouter();
  
  /* ═══ Core Presentation States ═══ */
  const [activeDeck, setActiveDeck] = useState<"eventos" | "projetos" | "treinamentos" | "consultoria" | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(420); // 7 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  
  const slideContentRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ═══ Keyboard Event Listeners for slide navigation ═══ */
  useEffect(() => {
    if (!activeDeck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ": // Space
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
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

  /* ═══ Handle Timer Tick ═══ */
  useEffect(() => {
    if (!isRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const speed = isTestMode ? 100 : 1000;
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          setIsRunning(false);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, speed);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, isTestMode]);

  /* ═══ Dynamic Responsive Scaling Engine (Fit-to-Screen) ═══ */
  const adjustSlideScale = () => {
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
    adjustSlideScale();
    window.addEventListener("resize", adjustSlideScale);
    return () => window.removeEventListener("resize", adjustSlideScale);
  }, [activeDeck, currentSlideIndex, notesOpen]);

  /* Trigger scale adjust on drawer transition */
  useEffect(() => {
    const intervals = [50, 150, 300, 450];
    intervals.forEach((ms) => {
      setTimeout(adjustSlideScale, ms);
    });
  }, [notesOpen]);

  /* ═══ Core Slide Navigation Actions ═══ */
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, 5));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectDeck = (deck: "eventos" | "projetos" | "treinamentos" | "consultoria") => {
    setActiveDeck(deck);
    setCurrentSlideIndex(0);
    setTimeRemaining(420);
    setIsRunning(true);
  };

  const handleExitDeck = () => {
    setActiveDeck(null);
    setIsRunning(false);
    setIsTestMode(false);
  };

  /* ═══ Pacing calculations ═══ */
  const getPaceStatus = () => {
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

  const pace = getPaceStatus();
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progressPercentage = (timeRemaining / 420) * 100;

  /* Renders active speaker notes content */
  const activeNote = activeDeck ? SPEAKER_NOTES[activeDeck][currentSlideIndex + 1] : null;

  /* ═══════════════════════════════════════════════════
     VIEW 1: Mode Selector Overlay (Boas-vindas)
     ═══════════════════════════════════════════════════ */
  if (!activeDeck) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#090a0e] relative overflow-hidden px-4 py-8">
        {/* Glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[100px]" />

        <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
          {/* Logo brand */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black tracking-tighter text-red-500 font-sans">SC</span>
            <span className="text-3xl font-black tracking-tighter text-white font-sans">FIRE</span>
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-500/35 bg-emerald-500/10 rounded-full">
              HUB COMERCIAL BNI
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight font-display">
              Apresentações de 7 Minutos — Reuniões BNI
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed">
              Selecione o canal da SC Fire que você vai apresentar hoje. O tempo de 7 minutos e os roteiros falados de notas se ajustarão de forma automática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Eventos */}
            <button
              onClick={() => handleSelectDeck("eventos")}
              className="group flex gap-5 p-6 rounded-2xl bg-[#13151b]/80 border border-white/5 hover:border-red-500/40 text-left transition-all duration-300 shadow-xl hover:shadow-black/40 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">SC Fire Eventos</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Projetos de segurança temporários, alvarás rápidos do CBMSC e brigadas particulares (IN 24).
                </p>
              </div>
            </button>

            {/* Projetos */}
            <button
              onClick={() => handleSelectDeck("projetos")}
              className="group flex gap-5 p-6 rounded-2xl bg-[#13151b]/80 border border-white/5 hover:border-amber-500/40 text-left transition-all duration-300 shadow-xl hover:shadow-black/40 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">SC Fire Projetos</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Aprovação de PPCI, AVCB Habitabilidade, alterações de layout físico e simulações Computacionais CFD.
                </p>
              </div>
            </button>

            {/* Treinamentos */}
            <button
              onClick={() => handleSelectDeck("treinamentos")}
              className="group flex gap-5 p-6 rounded-2xl bg-[#13151b]/80 border border-white/5 hover:border-emerald-500/40 text-left transition-all duration-300 shadow-xl hover:shadow-black/40 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">SC Fire Treinamentos</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Curso obrigatório de Brigada de Incêndio (IN 28), primeiros socorros (Lei Lucas) e abandono de área.
                </p>
              </div>
            </button>

            {/* Consultoria */}
            <button
              onClick={() => handleSelectDeck("consultoria")}
              className="group flex gap-5 p-6 rounded-2xl bg-[#13151b]/80 border border-white/5 hover:border-sky-500/40 text-left transition-all duration-300 shadow-xl hover:shadow-black/40 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 flex-shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">SC Fire Consultoria</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Auditoria diagnóstica preventiva geral sobre todas as 35 Instruções Normativas, laudos e renovações.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     VIEW 2: Active Presentation Cockpit
     ═══════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 bg-[#090a0e] text-white flex flex-col font-sans overflow-hidden">
      {/* ── Glowing Background ── */}
      <div className="absolute inset-0 bg-[#090a0e] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[150px]" />
      </div>

      {/* ── TOP HEADER: BNI Pacing, Timer and Controls ── */}
      <header className="h-[80px] bg-[#0c0d12]/90 border-b border-white/[0.05] flex items-center justify-between px-6 flex-shrink-0 relative z-30 backdrop-blur-md">
        {/* Brand */}
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
          <div className="absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
          <div className="flex items-center justify-between w-full z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold font-mono tracking-wider">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all duration-300 ${pace.color}`}>
              {pace.text}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitDeck}
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

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* CENTER VIEWPORT (Slides Content) */}
        <main className="flex-1 flex items-center justify-center relative p-6 overflow-hidden">
          <div
            ref={slideContentRef}
            className="w-[1200px] h-[680px] bg-[#0c0d12] border border-white/[0.05] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-12 transition-all duration-300 select-none"
          >
            {/* GLOW DECORATOR ORBS INSIDE SLIDE BOX */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

            {/* Slide 1: Cover Slide */}
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
                      <span>Formação de Excelência & Capacitação</span>
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
                      A Segurança que seu Evento Precisa, <span className="gradient-text">a Tranquilidade que você Merece</span>
                    </>
                  ) : activeDeck === "projetos" ? (
                    <>
                      A Inteligência que seu Projeto Exige, <span className="gradient-text-amber">a Segurança que sua Edificação Precisa</span>
                    </>
                  ) : activeDeck === "treinamentos" ? (
                    <>
                      A Preparação que sua Equipe Exige, <span className="gradient-text-emerald">a Tranquilidade que você Merece</span>
                    </>
                  ) : (
                    <>
                      A Conformidade que seu Imóvel Exige, <span className="gradient-text-sky">a Segurança que seu Negócio Merece</span>
                    </>
                  )}
                </h1>

                <p className="text-gray-400 max-w-2xl leading-relaxed text-sm">
                  {activeDeck === "eventos" && "Nascemos em um dos maiores festivais do sul do país. Conheça nosso ecossistema de soluções preventivas baseadas na IN 24."}
                  {activeDeck === "projetos" && "Desatamos a burocracia do Corpo de Bombeiros através de engenharia preventiva e projetos técnicos contra incêndio de alto desempenho."}
                  {activeDeck === "treinamentos" && "Formação e Reciclagem Técnica de Brigadas Corporativas Orgânicas em estrita conformidade legal com a IN 28 do CBMSC."}
                  {activeDeck === "consultoria" && "Blindamos síndicos prediais e proprietários comerciais contra fiscalizações inesperadas de segurança contra incêndio."}
                </p>

                {/* Presenter Badge (For trainings, display Sgt BM Murilo Galdino with pre-cropped image) */}
                {activeDeck === "treinamentos" && (
                  <div className="presenter-badge-cover mt-4">
                    <div className="presenter-badge-avatar">
                      <img src="/murilo.png" alt="Sargento BM Murilo Galdino" className="presenter-badge-img" />
                      <div className="presenter-badge-glow" />
                    </div>
                    <div className="presenter-badge-info">
                      <h4 className="font-bold">Sargento BM Murilo Galdino</h4>
                      <p>Especialista de Referência — Divisão de Treinamentos</p>
                    </div>
                  </div>
                )}

                {/* Cover Slide Pillars Grid */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-[950px] mt-8">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      {activeDeck === "eventos" ? <PartyPopper className="w-5 h-5" /> : activeDeck === "projetos" ? <FileCheck2 className="w-5 h-5" /> : activeDeck === "treinamentos" ? <Users className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                    </div>
                    <h3 className="text-sm font-bold text-white">{activeDeck === "eventos" ? "EVENTOS (IN 24)" : activeDeck === "projetos" ? "PPCI Predial" : activeDeck === "treinamentos" ? "Brigadas Orgânicas" : "Pré-Vistoria Diagnóstica"}</h3>
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
                    <h3 className="text-sm font-bold text-white">{activeDeck === "eventos" ? "PROJETOS" : activeDeck === "projetos" ? "Regularização (AVCB)" : activeDeck === "treinamentos" ? "Brigadistas Particulares" : "Laudos & Pareceres"}</h3>
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
                    <h3 className="text-sm font-bold text-white">{activeDeck === "eventos" ? "TREINAMENTOS" : activeDeck === "projetos" ? "Alto Desempenho" : activeDeck === "treinamentos" ? "Primeiros Socorros" : "Renovação Simplificada"}</h3>
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

            {/* Slide 2: Exigência / Setor de Eventos / Riscos */}
            {currentSlideIndex === 1 && (
              <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{activeDeck === "eventos" ? "Força do Setor" : activeDeck === "projetos" ? "Segurança Jurídica" : activeDeck === "treinamentos" ? "Conformidade Legal" : "Por que Consultoria?"}</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  {activeDeck === "eventos" && <>O Impacto Gigante do <span className="gradient-text font-black">Turismo de Eventos em Floripa</span></>}
                  {activeDeck === "projetos" && <>Por que Regularizar? <span className="gradient-text-amber font-black">Riscos e Sanções Inesperadas</span></>}
                  {activeDeck === "treinamentos" && <>A Exigência Técnica da <span className="gradient-text-emerald font-black font-display">Instrução Normativa 28</span></>}
                  {activeDeck === "consultoria" && <>A Auditoria Preventiva: <span className="gradient-text-sky font-black">Aja Antes da Fiscalização</span></>}
                </h2>

                <div className="grid grid-cols-2 gap-8 w-full">
                  {/* Left Column - Stats / Positive facts */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-base font-bold text-white">{activeDeck === "eventos" ? "Setor de Serviços e Serviços de Floripa" : activeDeck === "projetos" ? "O Escudo da Regularização" : activeDeck === "treinamentos" ? "O Plano de Implantação (PIBI)" : "Conformidade Antecipada"}</h3>
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
                        <span className="text-xl font-extrabold text-emerald-400">{activeDeck === "eventos" ? "R$ 100 Mi" : activeDeck === "projetos" ? "Seguro Ativo" : activeDeck === "treinamentos" ? "IN28 Prática" : "Risco Zero"}</span>
                        <span className="text-[11px] text-gray-300 leading-relaxed">{activeDeck === "eventos" ? "Movimentados em Floripa em apenas 1 mês (Floripa Conecta)." : activeDeck === "projetos" ? "Garantia legal de indenização de seguradora em incêndios." : activeDeck === "treinamentos" ? "Cálculo e dimensionamento cirúrgico de brigadistas orgânicos." : "Certeza de aprovação na vistoria oficial quando o militar chegar."}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Dores / Risks */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="w-5 h-5 text-red-500" />
                      <h3 className="text-base font-bold text-white">{activeDeck === "eventos" ? "O Risco de Embargo Comercial" : activeDeck === "projetos" ? "Os Danos da Desconformidade" : activeDeck === "treinamentos" ? "Os Danos de Equipes sem Curso" : "Danos de Fiscalização Inesperada"}</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {activeDeck === "eventos" && "Erros de engenharia, falta de ART ou de brigada de incêndio habilitada põem o evento em colapso."}
                      {activeDeck === "projetos" && "Operar projetos preventivos desatualizados atrai graves passivos corporativos."}
                      {activeDeck === "treinamentos" && "A ausência de reciclagem obrigatória anual ou equipes despreparadas acarreta severas multas de bombeiros."}
                      {activeDeck === "consultoria" && "Licenças preventivas prediais vencidas acarretam prejuízos drásticos acumulativos de multas."}
                    </p>
                    <ul className="space-y-2 text-xs text-gray-300 pt-2">
                      <li className="flex gap-2 items-start"><span className="text-red-500 font-bold">✕</span> {activeDeck === "eventos" ? "Embargos de Última Hora: Cancelamentos às vésperas de shows." : activeDeck === "projetos" ? "Recusa de Cobertura Securitária: Perda total da indenização." : activeDeck === "treinamentos" ? "Retenção de Alvará: Trancamento do Habite-se predial." : "Embargos e Interdição de Portas Fechadas: Fechamento de lojas."}</li>
                      <li className="flex gap-2 items-start"><span className="text-red-500 font-bold">✕</span> {activeDeck === "eventos" ? "Danos de Reputação: Fracasso de marcas corporativas." : activeDeck === "projetos" ? "Notificações e Multas Prediais Acumulativas pesadas." : activeDeck === "treinamentos" ? "Panico Geral Descontrolado em emergências e fumaças reais." : "Multas Financeiras pesadas aplicadas por oficiais preventivos."}</li>
                      <li className="flex gap-2 items-start"><span className="text-red-500 font-bold">✕</span> {activeDeck === "eventos" ? "Riscos Civis e Criminais em casos de tragédias e pânico." : activeDeck === "projetos" ? "Responsabilidade Civil e Criminal direta do Síndico ou Gestor." : activeDeck === "treinamentos" ? "Responsabilidade por Omissão do síndico em incidentes de RCP." : "Anulação da Cobertura de Seguros Prediais em casos de sinistro."}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Workflow Timeline */}
            {currentSlideIndex === 2 && (
              <div className="w-full h-full flex flex-col justify-center space-y-8 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                  <GitCommit className="w-4 h-4" />
                  <span>{activeDeck === "eventos" ? "O Fluxo de Eventos" : activeDeck === "projetos" ? "Quando Fazer PPCI" : activeDeck === "treinamentos" ? "Prática Ativa" : "Auditoria Preventiva"}</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  {activeDeck === "eventos" && <>O Flow do Nosso Trabalho: <span className="gradient-text font-black">Da Análise à Operação</span></>}
                  {activeDeck === "projetos" && <>PPCI Além do Prédio Novo: <span className="gradient-text-amber font-black">Layout & Ocupação</span></>}
                  {activeDeck === "treinamentos" && <>Teoria Alinhada à Prática: <span className="gradient-text-emerald font-black">Simulação Realista</span></>}
                  {activeDeck === "consultoria" && <>Vistoria de Diagnóstico: <span className="gradient-text-sky font-black">Foco em Erros Ocultos</span></>}
                </h2>

                {/* Workflow Cards horizontal line container */}
                <div className="grid grid-cols-4 gap-4 w-full relative">
                  {/* Connect Line */}
                  <div className="absolute top-[25px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-red-500/10 via-red-500/80 to-red-500/10 z-0 hidden md:block" />

                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-3 z-10">
                    <div className="w-9 h-9 rounded-full bg-[#0c0d12] border border-white/10 text-xs font-black text-gray-400 flex items-center justify-center mx-auto shadow-md">01</div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      {activeDeck === "eventos" ? <ClipboardSignature className="w-5 h-5" /> : activeDeck === "projetos" ? <Building2 className="w-5 h-5" /> : activeDeck === "treinamentos" ? <BookOpen className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase">{activeDeck === "eventos" ? "Briefing & Risco" : activeDeck === "projetos" ? "Prédio Novo" : activeDeck === "treinamentos" ? "Teoria Aplicada" : "Equipamentos"}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {activeDeck === "eventos" && "Mapeamento dos riscos do local, cálculo de lotação e layout."}
                      {activeDeck === "projetos" && "Exigência clássica preventiva para liberação do Habite-se inicial."}
                      {activeDeck === "treinamentos" && "Química de chamas, classes e reconhecimento de rotas."}
                      {activeDeck === "consultoria" && "Auditoria física em extintores, bombas de hidrante e alarmes."}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-3 z-10">
                    <div className="w-9 h-9 rounded-full bg-[#0c0d12] border border-white/10 text-xs font-black text-gray-400 flex items-center justify-center mx-auto shadow-md">02</div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      {activeDeck === "eventos" ? <FileCheck2 className="w-5 h-5" /> : activeDeck === "projetos" ? <PencilRuler className="w-5 h-5" /> : activeDeck === "treinamentos" ? <Flame className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase">{activeDeck === "eventos" ? "Documentos" : activeDeck === "projetos" ? "Mudar Layout" : activeDeck === "treinamentos" ? "Combate Ativo" : "Rotas de Fuga"}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {activeDeck === "eventos" && "Projetos de segurança temporários, taxas e protocolo CBMSC."}
                      {activeDeck === "projetos" && "Abertura de salas comerciais ou mezaninos altera a evacuação."}
                      {activeDeck === "treinamentos" && "Treinamento prático sob calor e fogueira controlada real."}
                      {activeDeck === "consultoria" && "Varredura em rotas de evacuação e luzes de emergência."}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-3 z-10">
                    <div className="w-9 h-9 rounded-full bg-[#0c0d12] border border-white/10 text-xs font-black text-gray-400 flex items-center justify-center mx-auto shadow-md">03</div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      {activeDeck === "eventos" ? <Users className="w-5 h-5" /> : activeDeck === "projetos" ? <ArrowLeftRight className="w-5 h-5" /> : activeDeck === "treinamentos" ? <HeartPulse className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase">{activeDeck === "eventos" ? "Efetivo Brigada" : activeDeck === "projetos" ? "Mudar Ocupação" : activeDeck === "treinamentos" ? "Primeiros Socos" : "Compartimentos"}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {activeDeck === "eventos" && "Dimensionamento exato de brigadistas com base na lei."}
                      {activeDeck === "projetos" && "Mudança comercial (Ex: padaria que vira academia) exige aval."}
                      {activeDeck === "treinamentos" && "RCP, imobilizações e estancamento rápido de fraturas."}
                      {activeDeck === "consultoria" && "Vistoria geral em portas corta-fogo e selagens prediais."}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-3 z-10">
                    <div className="w-9 h-9 rounded-full bg-[#0c0d12] border border-white/10 text-xs font-black text-gray-400 flex items-center justify-center mx-auto shadow-md">04</div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      {activeDeck === "eventos" ? <ShieldCheck className="w-5 h-5" /> : activeDeck === "projetos" ? <ShieldCheck className="w-5 h-5" /> : activeDeck === "treinamentos" ? <Users className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase">{activeDeck === "eventos" ? "Vistoria Ativa" : activeDeck === "projetos" ? "Regularização" : activeDeck === "treinamentos" ? "Abandono Área" : "Instalações"}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {activeDeck === "eventos" && "Prevenção contínua e primeiros socorros no dia da festa."}
                      {activeDeck === "projetos" && "Aprovação rápida e readequações comerciais sem atritos."}
                      {activeDeck === "treinamentos" && "Simulado dinâmico de abandono sem pânico com os alunos."}
                      {activeDeck === "consultoria" && "Auditoria em instalações de gás e medição ôhmica de SPDA."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 4: Case / CFD Termodinâmica / CFD Smoke Chamber / Laudos */}
            {currentSlideIndex === 3 && (
              <div className="w-full h-full flex flex-col justify-center space-y-6 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>{activeDeck === "eventos" ? "Estudo de Caso" : activeDeck === "projetos" ? "Engenharia de Elite" : activeDeck === "treinamentos" ? "Diferenciais SC Fire" : "Laudos de Engenharia"}</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  {activeDeck === "eventos" && <>Por que a SC Fire Existe? <span className="gradient-text font-black">O Caso Centrosul 2015</span></>}
                  {activeDeck === "projetos" && <>Engenharia de Elite — <span className="gradient-text-amber font-black">Projeto Baseado em Desempenho</span></>}
                  {activeDeck === "treinamentos" && <>Por que Treinar com a SC Fire? <span className="gradient-text-emerald font-black">Diferenciais Técnicos</span></>}
                  {activeDeck === "consultoria" && <>Laudos Técnicos e <span className="gradient-text-sky font-black">Relatórios de Conformidade</span></>}
                </h2>

                <div className="grid grid-cols-5 gap-8 items-center w-full">
                  {/* Left content block */}
                  <div className="col-span-3 space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0 mt-1">
                          {activeDeck === "eventos" ? <AlertOctagon className="w-4 h-4" /> : activeDeck === "projetos" ? <Sliders className="w-4 h-4" /> : activeDeck === "treinamentos" ? <Users className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            {activeDeck === "eventos" && "O Desabamento do Painel de LED"}
                            {activeDeck === "projetos" && "Flexibilidade Construtiva Real"}
                            {activeDeck === "treinamentos" && "Instrutores Credenciados"}
                            {activeDeck === "consultoria" && "Guia Exato de Adequações"}
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            {activeDeck === "eventos" && "Em 2015, um painel de LED de uma tonelada desabou no Centrosul, ferindo gravemente seis médicos no congresso."}
                            {activeDeck === "projetos" && "As tabelas de bombeiros rígidas exigem saídas caras. O PBD contorna isso com cálculos de taxa real de escoamento de pessoas."}
                            {activeDeck === "treinamentos" && "Aulas corporativas ministradas por engenheiros de segurança contra incêndio e bombeiros civis com registro DAT ativo."}
                            {activeDeck === "consultoria" && "Detalhamos cirurgicamente cada erro encontrado no laudo técnico com a solução, facilitando a vida do síndico."}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 mt-1">
                          {activeDeck === "eventos" ? <ShieldAlert className="w-4 h-4" /> : activeDeck === "projetos" ? <TrendingDown className="w-4 h-4" /> : activeDeck === "treinamentos" ? <Flame className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            {activeDeck === "eventos" && "Causas: Falha de ART e Engenharia"}
                            {activeDeck === "projetos" && "Otimização Extrema de Obras"}
                            {activeDeck === "treinamentos" && "Pistas de Simulação Real"}
                            {activeDeck === "consultoria" && "Responsabilidade Técnica Formal"}
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            {activeDeck === "eventos" && "A sustentação do painel foi alterada sem recálculo estrutural e sem aprovação técnica prévia dos oficiais preventivos."}
                            {activeDeck === "projetos" && "Calculamos cientificamente o tempo de evacuação e dispersão, gerando economia drástica de material construtivo na obra."}
                            {activeDeck === "treinamentos" && "Garantimos pista especializada de treinamento prático de fogo, permitindo que a equipe vença o nervosismo da emergência."}
                            {activeDeck === "consultoria" && "Emitimos laudos oficiais com recolhimento de ART de engenharia que servem de prova documental de conformidade prefeitura/bancos."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-[10px] text-gray-400 flex items-center gap-2 max-w-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        {activeDeck === "eventos" && "SC Fire: Inspecionamos 100% de palcos, ARTs de carga de engenharia e dimensionamento de brigadas."}
                        {activeDeck === "projetos" && "Garantimos aprovações rápidas com engenharia focada no menor custo possível de adequações."}
                        {activeDeck === "treinamentos" && "Focamos na competência real que salva a vida de seus colaboradores e protege seus galpões prediais."}
                        {activeDeck === "consultoria" && "Entregamos laudos conclusivos e pareceres técnicos de SPDA, portas corta-fogo e sistemas de gás predial."}
                      </span>
                    </div>
                  </div>

                  {/* Right Graphics Display block */}
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    {activeDeck === "eventos" && (
                      <div className="grid grid-cols-2 gap-3 w-full h-[220px]">
                        <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/5 relative">
                          <img src="/centrosul_news.png" alt="Notícia G1 Centrosul" className="w-full h-full object-cover" />
                        </div>
                        <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/5 relative">
                          <img src="/centrosul_accident.png" alt="Desabamento Estande" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    {activeDeck === "projetos" && (
                      <div className="w-full h-[220px] rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
                        <div className="w-full h-full relative overflow-hidden flex flex-col justify-center gap-4">
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                            <div className="border-b border-r border-white/40"></div>
                            <div className="border-b border-r border-white/40"></div>
                            <div className="border-b border-white/40"></div>
                            <div className="border-b border-r border-white/40"></div>
                            <div className="border-b border-r border-white/40"></div>
                            <div className="border-b border-white/40"></div>
                            <div className="border-r border-white/40"></div>
                            <div className="border-r border-white/40"></div>
                            <div></div>
                          </div>
                          {/* Simulated laser scan line */}
                          <div className="absolute left-0 right-0 h-[2px] bg-amber-500/60 shadow-[0_0_12px_#f59e0b] animate-laser z-10" />
                          <div className="absolute left-[30%] top-[40%] w-24 h-24 bg-amber-500/5 rounded-full blur-2xl animate-pulse" />
                        </div>
                        <span className="text-[9px] text-amber-400 font-mono tracking-wider font-bold text-center block w-full uppercase">Fluidodinâmica CFD Termodinâmica 3D</span>
                      </div>
                    )}

                    {activeDeck === "treinamentos" && (
                      <div className="w-full h-[220px] rounded-2xl bg-gradient-to-b from-[#100b0c] to-[#1e1517]/80 border border-red-500/10 p-5 relative flex flex-col justify-center items-center overflow-hidden shadow-inner">
                        {/* Strobe Light */}
                        <div className="absolute top-4 right-4 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_#ffffff] animate-strobe z-20" />
                        
                        {/* Emergency EXIT badge */}
                        <div className="px-4 py-2 bg-[#14532d] border-2 border-emerald-500 rounded-md text-emerald-500 font-bold tracking-widest text-[12px] flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-glow z-10">
                          <span>EXIT / SAÍDA</span>
                        </div>

                        {/* CFD Smoke Cloud Particles */}
                        <div className="absolute inset-0 pointer-events-none opacity-60">
                          <div className="absolute bottom-[-10px] left-[15%] w-36 h-36 bg-white/[0.03] rounded-full blur-xl animate-smoke-1" />
                          <div className="absolute bottom-[-10px] left-[45%] w-40 h-40 bg-white/[0.04] rounded-full blur-xl animate-smoke-2" />
                          <div className="absolute bottom-[-10px] right-[15%] w-32 h-32 bg-white/[0.03] rounded-full blur-xl animate-smoke-3" />
                        </div>
                        
                        <span className="absolute bottom-4 text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Câmara de Pânico & Sinalização</span>
                      </div>
                    )}

                    {activeDeck === "consultoria" && (
                      <div className="w-full h-[220px] rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
                        <div className="w-full h-full relative overflow-hidden flex flex-col justify-center gap-4">
                          <div className="absolute left-0 right-0 h-[2px] bg-sky-400/60 shadow-[0_0_12px_#38bdf8] animate-laser z-10" />
                          <div className="absolute left-[35%] top-[35%] w-24 h-24 bg-sky-400/5 rounded-full blur-2xl animate-pulse" />
                        </div>
                        <span className="text-[9px] text-sky-400 font-mono tracking-wider font-bold text-center block w-full uppercase">Auditoria Diagnóstica Predial Preventiva</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Slide 5: Recarga elétrica / CFD response time / Renewals / Como nos Indicar */}
            {currentSlideIndex === 4 && (
              <div className="w-full h-full flex flex-col justify-center space-y-6 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold max-w-fit uppercase tracking-wider">
                  {activeDeck === "eventos" ? <HeartHandshake className="w-4 h-4" /> : activeDeck === "projetos" ? <Activity className="w-4 h-4" /> : activeDeck === "treinamentos" ? <Activity className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{activeDeck === "eventos" ? "Como nos Indicar" : activeDeck === "projetos" ? "Exigência IN 23 SAVE" : activeDeck === "treinamentos" ? "Ação Preventiva" : "Renovação de Alvará"}</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                  {activeDeck === "eventos" && <>Como nos Indicar & <span className="gradient-text font-black">Parceiros Ideais</span></>}
                  {activeDeck === "projetos" && <>Pontos de Recarga Coletiva (IN 23 SAVE) — <span className="gradient-text-amber font-black">Supercomputador CFD</span></>}
                  {activeDeck === "treinamentos" && <>Ação Rápida em 60 Segundos: <span className="gradient-text-emerald font-black">A Brigada Orgânica Salva</span></>}
                  {activeDeck === "consultoria" && <>Assessoria na Renovação: <span className="gradient-text-sky font-black font-display">Alvará Garantido na Mão</span></>}
                </h2>

                <div className="grid grid-cols-5 gap-8 items-center w-full">
                  {/* Left content block */}
                  <div className="col-span-3 space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                          {activeDeck === "eventos" ? <Building2 className="w-4 h-4" /> : activeDeck === "projetos" ? <BatteryCharging className="w-4 h-4" /> : activeDeck === "treinamentos" ? <Clock className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            {activeDeck === "eventos" && "Organizadores de Eventos & Agências"}
                            {activeDeck === "projetos" && "Exigência da IN 23 (SAVE)"}
                            {activeDeck === "treinamentos" && "Tempo de Resposta SC Fire"}
                            {activeDeck === "consultoria" && "Gestão Digital Completa"}
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            {activeDeck === "eventos" && "Profissionais focados na produção de convenções, casamentos e shows corporativos ou Live Marketing."}
                            {activeDeck === "projetos" && "Vagas de garagem fechadas com recargas elétricas (lítio) exigem proteção e simulação termodinâmica do CBMSC."}
                            {activeDeck === "treinamentos" && "Em caso de fumaça, o brigadista orgânico local atua em menos de 1 minuto apagando a chama inicial com extintor."}
                            {activeDeck === "consultoria" && "Organizamos toda a pasta de documentos preventivos e protocolamos nos portais digitais do CBMSC."}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0 mt-1">
                          {activeDeck === "eventos" ? <Warehouse className="w-4 h-4" /> : activeDeck === "projetos" ? <Wind className="w-4 h-4" /> : activeDeck === "treinamentos" ? <Activity className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            {activeDeck === "eventos" && "Casas, Espaços & Centros de Eventos"}
                            {activeDeck === "projetos" && "Simulação Avançada CFD 3D"}
                            {activeDeck === "treinamentos" && "Delay dos Bombeiros Oficiais"}
                            {activeDeck === "consultoria" && "Acompanhamento Técnico na Vistoria"}
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            {activeDeck === "eventos" && "Salões, buffets e centros que necessitam de parcerias sólidas de fornecimento de brigadas dedicadas."}
                            {activeDeck === "projetos" && "Modelamos a termodinâmica 3D para provar o controle de exaustão de fumaça, gerando enormes economias de obra."}
                            {activeDeck === "treinamentos" && "O tempo do caminhão de bombeiros chegar devido ao trânsito dificilmente é menor que 10 minutos. O primeiro combate decide."}
                            {activeDeck === "consultoria" && "Nossos engenheiros agendam e acompanham fisicamente o vistoriador militar preventivo no dia da vistoria final."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {activeDeck === "eventos" && (
                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-[10px] text-gray-400">
                        <strong className="text-white block mb-1">Gatilhos que você deve OUVIR nas conversas:</strong>
                        <span className="italic">"Meu fornecedor de brigada faliu...", "Preciso urgente aprovar o palco de sábado...", "O bombeiro barrou meu alvará..."</span>
                      </div>
                    )}
                  </div>

                  {/* Right Graphics Display block */}
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    {activeDeck === "eventos" && (
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4 w-full">
                        <div className="flex gap-2.5 items-center text-xs font-bold text-white">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <span>Rede de Contatos</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Nós fornecemos Brigadistas Particulares dedicados e cuidamos de 100% da responsabilidade burocrática dos palcos temporários.
                        </p>
                      </div>
                    )}

                    {activeDeck === "projetos" && (
                      <div className="w-full h-[220px] rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 flex flex-col justify-center items-center gap-4 relative overflow-hidden shadow-inner">
                        <div className="w-[190px] p-3 border border-amber-500/20 bg-amber-500/[0.02] rounded-xl flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.05)] z-10">
                          <BatteryCharging className="w-8 h-8 text-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
                          <div className="w-full h-[5px] bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[70%]" />
                          </div>
                          <span className="text-[9px] font-mono text-amber-400 tracking-wider">CARREGAMENTO SAVE</span>
                        </div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono font-bold block text-center">Normativa IN 23 Termodinâmica</span>
                      </div>
                    )}

                    {activeDeck === "treinamentos" && (
                      <div className="cfd-response-display w-full max-h-[220px]">
                        <div className="response-timeline">
                          {/* Node Brigade */}
                          <div className="response-node">
                            <div className="node-badge-time flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>60 Segundos</span>
                            </div>
                            <span className="node-label text-xs font-bold">Brigada Orgânica Treinada</span>
                            <div className="node-bar-container">
                              <div className="node-bar bar-green w-[15%]" />
                            </div>
                            <span className="node-status text-[10px] text-emerald-400 font-semibold">Fogo Contido de Imediato</span>
                          </div>

                          {/* Node Bombeiros */}
                          <div className="response-node">
                            <div className="node-badge-time flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                              <span>10 Minutos+</span>
                            </div>
                            <span className="node-label text-xs font-bold">Socorro Externo Corporativo</span>
                            <div className="node-bar-container">
                              <div className="node-bar bar-red w-[90%]" />
                            </div>
                            <span className="node-status text-[10px] text-red-500 font-semibold">Risco de Sinistro e Perda Total</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDeck === "consultoria" && (
                      <div className="w-full h-[220px] rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 flex flex-col justify-center items-center gap-4 relative overflow-hidden shadow-inner">
                        <div className="w-[190px] p-3 border border-sky-500/20 bg-sky-500/[0.02] rounded-xl flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.05)] z-10">
                          <CheckCircle className="w-8 h-8 text-sky-400 filter drop-shadow-[0_0_8px_#38bdf8]" />
                          <div className="w-full h-[5px] bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 w-full" />
                          </div>
                          <span className="text-[9px] font-mono text-sky-400 tracking-wider">AVCB RENOVAÇÃO</span>
                        </div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono font-bold block text-center">Atestado Renovado Legalizado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Slide 6: Contact and Final page */}
            {currentSlideIndex === 5 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-6 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider animate-slide-up">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Parceria de Confiança</span>
                </div>

                <h2 className="text-4xl font-extrabold tracking-tighter text-white font-sans">SC FIRE</h2>
                <p className="text-red-500 text-sm font-semibold tracking-wide italic">"A segurança que seu evento precisa, a tranquilidade que você merece!"</p>

                <div className="grid grid-cols-3 gap-8 w-full max-w-[1000px] items-center pt-4">
                  {/* Left Column - Dynamic Presenter Information */}
                  <div className="col-span-1 flex flex-col items-center pr-6 border-r border-white/[0.08]">
                    {/* Eventos, Projetos and Treinamentos single cards */}
                    {activeDeck !== "consultoria" ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-white/5 relative presenter-avatar-wrapper shadow-lg">
                          <img
                            src={activeDeck === "projetos" ? "/dione.png" : activeDeck === "treinamentos" ? "/murilo.png" : "/apresentador.png"}
                            alt="Apresentador"
                            className="w-full h-full object-cover presenter-avatar"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {activeDeck === "projetos" ? "Dione Borges" : activeDeck === "treinamentos" ? "Sargento BM Murilo Galdino" : "Paulo Roberto Ramos"}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">
                            {activeDeck === "projetos" ? "Engenheira Civil & PPCI" : activeDeck === "treinamentos" ? "Especialista em Treinamentos" : "Diretor Operacional & Especialista"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Consultoria Triple Cards Layout */
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                              <img src="/apresentador.png" alt="Paulo Ramos" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] text-white font-bold leading-tight">Paulo Ramos</span>
                            <span className="text-[7px] text-gray-500">Eventos</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                              <img src="/dione.png" alt="Dione Borges" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] text-white font-bold leading-tight">Dione Borges</span>
                            <span className="text-[7px] text-gray-500">Projetos</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-white/5 shadow-inner presenter-avatar-wrapper">
                              <img src="/murilo.png" alt="Sgt BM Murilo Galdino" className="w-full h-full object-cover presenter-avatar" />
                            </div>
                            <span className="text-[8px] text-white font-bold leading-tight">Sgt Murilo</span>
                            <span className="text-[7px] text-gray-500">Cursos</span>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-bold text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Referência conforme o tema</span>
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
                  <div className="col-span-1 flex flex-col items-start gap-4 pl-6 border-l border-white/[0.08]">
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
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h5 className="text-[10px] text-gray-400 font-semibold uppercase">E-mail</h5>
                        <p className="text-xs font-bold text-white">contato@scfire.com.br</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-amber-500">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h5 className="text-[10px] text-gray-400 font-semibold uppercase">Website</h5>
                        <p className="text-xs font-bold text-white">www.scfire.com.br</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 pt-4 leading-relaxed max-w-xl">
                  Obrigado, equipe BNI! Apague as suas preocupações e garanta a regularidade do seu imóvel com a SC Fire.
                </div>
              </div>
            )}
          </div>

          {/* Navigation overlay arrows */}
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className={`absolute left-10 p-3.5 rounded-full border border-white/[0.08] bg-[#0c0d12]/70 text-gray-400 hover:text-white transition-all shadow-lg backdrop-blur-md ${currentSlideIndex === 0 ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === 5}
            className={`absolute right-10 p-3.5 rounded-full border border-white/[0.08] bg-[#0c0d12]/70 text-gray-400 hover:text-white transition-all shadow-lg backdrop-blur-md ${currentSlideIndex === 5 ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </main>

        {/* RIGHT DRAWER: Speaker Notes Drawer Side Panel */}
        <aside
          className={`
            w-[420px] bg-[#0c0d12] border-l border-white/[0.05] flex flex-col flex-shrink-0 relative z-20 transition-all duration-300 ease-in-out
            ${notesOpen ? "mr-0" : "-mr-[420px] pointer-events-none opacity-0"}
          `}
        >
          {/* Header */}
          <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Notas do Apresentador</span>
            </h3>
            <button
              onClick={() => setNotesOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Spoken script content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeNote ? (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">{activeNote.title}</h4>
                
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] border-l-2 border-l-red-500 italic text-xs leading-relaxed text-gray-300">
                  {activeNote.speech}
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Pontos de Fala:</h5>
                  <ul className="space-y-1.5 text-[11px] text-gray-400 list-disc pl-4 leading-relaxed">
                    {activeNote.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Nenhuma nota ativa carregada.</p>
            )}
          </div>

          {/* Footer tips */}
          <div className="p-4 border-t border-white/[0.05] bg-white/[0.01] text-[10px] text-gray-500">
            Dica: Projete os slides em uma TV/projetor de reuniões e use o seu celular ou tablet para ler este roteiro falado!
          </div>
        </aside>
      </div>
    </div>
  );
}
