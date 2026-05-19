import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Grid,
  Layout,
  Mail,
  MapPin,
  Maximize2,
  Minimize2,
  Move,
  Palette,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { trackEvent } from "../lib/analytics";

type ThemeColor = "blue" | "emerald" | "slate" | "purple" | "terracotta" | "midnight";
type LayoutType = "sidebar" | "classic" | "modern";
type FontType = "font-sans" | "font-serif" | "font-mono";
type StepId = 1 | 2 | 3 | 4 | 5;



type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
};

type Experience = {
  id: number;
  company: string;
  role: string;
  period: string;
  desc: string;
};

type Education = {
  id: number;
  institution: string;
  degree: string;
  period: string;
  desc: string;
};

type CvData = {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  theme: {
    color: ThemeColor;
    layout: LayoutType;
    font: FontType;
  };
};

type ToastState = {
  show: boolean;
  message: string;
  type: "success" | "info" | "error";
};

type ThemeClasses = {
  text: string;
  bg: string;
  border: string;
  softBg: string;
  pill: string;
  hover: string;
};

const STORAGE_KEY = "cv-builder-data-v4";

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: 1, label: "Perfil", icon: User },
  { id: 2, label: "Experiencia", icon: Briefcase },
  { id: 3, label: "Educación", icon: GraduationCap },
  { id: 4, label: "Skills", icon: Sparkles },
  { id: 5, label: "Diseño", icon: Palette },
];

const themeColors: Record<ThemeColor, ThemeClasses> = {
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-700",
    border: "border-blue-700/20",
    softBg: "bg-blue-50/60",
    pill: "bg-blue-50 text-blue-800 border-blue-100",
    hover: "hover:bg-blue-800",
  },
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-700",
    border: "border-emerald-700/20",
    softBg: "bg-emerald-50/60",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-100",
    hover: "hover:bg-emerald-800",
  },
  slate: {
    text: "text-slate-800",
    bg: "bg-slate-800",
    border: "border-slate-800/20",
    softBg: "bg-slate-100/70",
    pill: "bg-slate-100 text-slate-800 border-slate-200",
    hover: "hover:bg-slate-950",
  },
  purple: {
    text: "text-purple-700",
    bg: "bg-purple-700",
    border: "border-purple-700/20",
    softBg: "bg-purple-50/60",
    pill: "bg-purple-50 text-purple-800 border-purple-100",
    hover: "hover:bg-purple-800",
  },
  terracotta: {
    text: "text-amber-800",
    bg: "bg-amber-800",
    border: "border-amber-800/20",
    softBg: "bg-amber-50/70",
    pill: "bg-amber-50 text-amber-900 border-amber-100",
    hover: "hover:bg-amber-900",
  },
  midnight: {
    text: "text-indigo-950",
    bg: "bg-indigo-950",
    border: "border-indigo-950/20",
    softBg: "bg-indigo-50/60",
    pill: "bg-indigo-50 text-indigo-950 border-indigo-100",
    hover: "hover:bg-indigo-900",
  },
};

const emptyCvData: CvData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  theme: {
    color: "blue",
    layout: "sidebar",
    font: "font-sans",
  },
};

const sampleCvData: CvData = {
  personal: {
    fullName: "Santos Linares",
    title: "Co-Founder & CTO · Full Stack Developer",
    email: "santos@email.com",
    phone: "+54 9 351 000-0000",
    location: "Córdoba, Argentina",
    website: "santos.dev",
    summary:
      "Desarrollador full stack con foco en producto, arquitectura frontend/backend y construcción de soluciones SaaS. Experiencia liderando sistemas internos, integraciones y plataformas orientadas a automatización de procesos.",
  },
  experience: [
    {
      id: 1,
      company: "GREENLIGHT",
      role: "Co-Founder & CTO",
      period: "2025 - Actualidad",
      desc:
        "Diseño y desarrollo de una plataforma SaaS para medición y gestión de huella de carbono. Definición de arquitectura, producto, frontend, backend y estrategia técnica.",
    },
    {
      id: 2,
      company: "Consultores de Empresas",
      role: "Tech Lead / Referente SAS",
      period: "2024 - Actualidad",
      desc:
        "Liderazgo técnico sobre sistemas internos de selección. Integración de servicios, mejora de flujos operativos y coordinación con desarrollo, UX/UI y áreas de negocio.",
    },
  ],
  education: [
    {
      id: 1,
      institution: "FAMAF / Universidad Nacional de Córdoba",
      degree: "Ciencias de la Computación",
      period: "En curso",
      desc: "Formación en fundamentos de programación, matemática, lógica y ciencias de la computación.",
    },
  ],
  skills: ["React", "Angular", "TypeScript", "Node.js", "NestJS", "Laravel", "PostgreSQL", "UX/Product", "APIs"],
  languages: ["Español (Nativo)", "Inglés (Intermedio/Avanzado)"],
  theme: {
    color: "midnight",
    layout: "sidebar",
    font: "font-sans",
  },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const normalizeUrl = (value: string) => value.replace(/^https?:\/\//i, "").replace(/\/$/, "");

const mergeCvData = (value: unknown): CvData => {
  const parsed = value as Partial<CvData>;
  return {
    ...emptyCvData,
    ...parsed,
    personal: {
      ...emptyCvData.personal,
      ...(parsed.personal ?? {}),
    },
    theme: {
      ...emptyCvData.theme,
      ...(parsed.theme ?? {}),
    },
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
  };
};

const hasCvContent = (data: CvData) =>
  Boolean(
    data.personal.fullName ||
      data.personal.title ||
      data.personal.email ||
      data.personal.phone ||
      data.personal.location ||
      data.personal.website ||
      data.personal.summary ||
      data.experience.length ||
      data.education.length ||
      data.skills.length ||
      data.languages.length,
  );

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
        <Icon className="h-4 w-4 text-indigo-600" />
        {title}
      </h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>}
    </div>
  );
}

export default function BuilderPage() {
    useEffect(() => {
        trackEvent("builder_opened");
      }, []);
    const [cvData, setCvData] = useState<CvData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? mergeCvData(JSON.parse(saved)) : clone(sampleCvData);
    } catch {
      return clone(sampleCvData);
    }
  });

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [zoom, setZoom] = useState(0.82);
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const currentTheme = themeColors[cvData.theme.color] ?? themeColors.blue;
  const progress = (currentStep / STEPS.length) * 100;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  }, [cvData]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastState["type"] = "success") => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = window.setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2200);
  }, []);

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setCvData((previous) => ({
      ...previous,
      personal: { ...previous.personal, [field]: value },
    }));
  };

  const updateTheme = <K extends keyof CvData["theme"]>(key: K, value: CvData["theme"][K]) => {
    setCvData((previous) => ({ ...previous, theme: { ...previous.theme, [key]: value } }));
  };

  const addExperience = () => {
    setCvData((previous) => ({
      ...previous,
      experience: [...previous.experience, { id: Date.now(), company: "", role: "", period: "", desc: "" }],
    }));
    setCurrentStep(2);
  };

  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setCvData((previous) => ({
      ...previous,
      experience: previous.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeExperience = (id: number) => {
    setCvData((previous) => ({ ...previous, experience: previous.experience.filter((item) => item.id !== id) }));
  };

  const addEducation = () => {
    setCvData((previous) => ({
      ...previous,
      education: [...previous.education, { id: Date.now(), institution: "", degree: "", period: "", desc: "" }],
    }));
    setCurrentStep(3);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setCvData((previous) => ({
      ...previous,
      education: previous.education.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeEducation = (id: number) => {
    setCvData((previous) => ({ ...previous, education: previous.education.filter((item) => item.id !== id) }));
  };

  const moveItem = (kind: "experience" | "education", id: number, direction: -1 | 1) => {
    setCvData((previous) => {
      const list = [...previous[kind]];
      const currentIndex = list.findIndex((item) => item.id === id);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= list.length) return previous;
      [list[currentIndex], list[nextIndex]] = [list[nextIndex], list[currentIndex]];
      return { ...previous, [kind]: list };
    });
  };

  const addListItem = (kind: "skills" | "languages", rawValue: string, clear: () => void) => {
    const value = normalize(rawValue);
    if (!value) return;
    setCvData((previous) => {
      const exists = previous[kind].some((item) => item.toLowerCase() === value.toLowerCase());
      if (exists) return previous;
      return { ...previous, [kind]: [...previous[kind], value] };
    });
    clear();
  };

  const removeListItem = (kind: "skills" | "languages", indexToRemove: number) => {
    setCvData((previous) => ({ ...previous, [kind]: previous[kind].filter((_, index) => index !== indexToRemove) }));
  };

  const handleReset = () => {
    setCvData(clone(emptyCvData));
    setSkillInput("");
    setLanguageInput("");
    setCurrentStep(1);
    showToast("CV reiniciado.", "info");
  };

  const handleLoadSample = () => {
    setCvData(clone(sampleCvData));
    setCurrentStep(1);
    showToast("Datos de ejemplo cargados.", "success");
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = cvData.personal.fullName ? cvData.personal.fullName.replace(/\s+/g, "_") : "cv";
    link.href = url;
    link.download = `${name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("JSON exportado.", "success");
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      setCvData(mergeCvData(JSON.parse(text)));
      showToast("CV importado correctamente.", "success");
    } catch {
      showToast("No se pudo importar el JSON.", "error");
    }
  };

  const handlePrint = () => {
    trackEvent("pdf_export_clicked", {
      template: cvData.theme.layout,
      color: cvData.theme.color,
      has_name: Boolean(cvData.personal.fullName),
      experience_count: cvData.experience.length,
      education_count: cvData.education.length,
      skills_count: cvData.skills.length,
      languages_count: cvData.languages.length,
    });
  
    const originalTitle = document.title;
    const name = cvData.personal.fullName ? cvData.personal.fullName.replace(/\s+/g, "_") : "CV";
  
    document.title = `CV_${name}`;
    window.print();
    document.title = originalTitle;
  };
  const handleWorkspaceMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(".preview-page") || target.closest("button") || target.closest("input") || target.closest("textarea")) return;
    setIsPanning(true);
    setPanStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
  };

  const handleWorkspaceMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPanOffset({ x: event.clientX - panStart.x, y: event.clientY - panStart.y });
  };

  const stopPanning = () => setIsPanning(false);

  const resetCanvas = () => {
    setZoom(0.82);
    setPanOffset({ x: 0, y: 0 });
    showToast("Lienzo centrado.", "info");
  };

  const renderEditableField = (
    value: string,
    placeholder: string,
    onChange: (value: string) => void,
    step: StepId,
    options?: { area?: boolean; className?: string; name?: boolean },
  ) => {
    const commonClass = `w-full bg-transparent outline-none placeholder:text-slate-300 ${options?.className ?? ""}`;
    if (options?.area || options?.name) {
      return (
        <textarea
          value={value}
          placeholder={placeholder}
          onFocus={() => setCurrentStep(step)}
          onChange={(event) => onChange(event.target.value)}
          rows={options?.name ? 2 : Math.max(2, value.split("\n").length)}
          className={`${commonClass} ${options?.name ? "cv-name-field" : ""} resize-none rounded-md px-1 py-0.5 leading-relaxed hover:bg-amber-50 focus:bg-amber-50`}
        />
      );
    }
    return (
      <input
        value={value}
        placeholder={placeholder}
        onFocus={() => setCurrentStep(step)}
        onChange={(event) => onChange(event.target.value)}
        className={`${commonClass} rounded-md px-1 py-0.5 hover:bg-amber-50 focus:bg-amber-50`}
      />
    );
  };

  const contactItems = [
    { icon: Mail, value: cvData.personal.email, placeholder: "email@dominio.com", field: "email" as const },
    { icon: Phone, value: cvData.personal.phone, placeholder: "+54 9 ...", field: "phone" as const },
    { icon: MapPin, value: cvData.personal.location, placeholder: "Ciudad, País", field: "location" as const },
    { icon: Globe, value: cvData.personal.website, placeholder: "portfolio.com", field: "website" as const },
  ];

  const renderContactList = (compact = false) => (
    <div className={compact ? "flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500" : "space-y-2.5 text-[11px] text-slate-600"}>
      {contactItems.map((item) => {
        const Icon = item.icon;
        if (compact && !item.value) return null;
        return (
          <div key={item.field} className={compact ? "flex items-center gap-1" : "flex items-center gap-2"}>
            <Icon className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 ${currentTheme.text}`} />
            <div className="min-w-0 flex-1 truncate">
              {renderEditableField(
                item.field === "website" ? normalizeUrl(item.value) : item.value,
                item.placeholder,
                (value) => updatePersonalInfo(item.field, value),
                1,
                { className: compact ? "text-center" : "" },
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListPills = (items: string[]) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={`rounded-full border px-2 py-1 text-[10px] font-bold ${currentTheme.pill}`}>
          {item}
        </span>
      ))}
    </div>
  );

  const renderExperienceBlocks = () => (
    <div className="space-y-4">
      {cvData.experience.map((experience) => (
        <article key={experience.id} className={`group relative rounded-xl border-l-2 ${currentTheme.border} py-1 pl-5 hover:bg-slate-50`}>
          <div className={`absolute -left-[6px] top-3 h-2.5 w-2.5 rounded-full ${currentTheme.bg}`} />
          <div className="absolute right-2 top-2 hidden gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm group-hover:flex no-print">
            <button onClick={() => moveItem("experience", experience.id, -1)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100" type="button">↑</button>
            <button onClick={() => moveItem("experience", experience.id, 1)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100" type="button">↓</button>
            <button onClick={() => removeExperience(experience.id)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50" type="button">×</button>
          </div>
          <div className="flex items-start justify-between gap-3 pr-16">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black leading-tight text-slate-900">
                {renderEditableField(experience.role, "Puesto / Rol", (value) => updateExperience(experience.id, "role", value), 2)}
              </h4>
              <div className={`text-[11px] font-bold ${currentTheme.text}`}>
                {renderEditableField(experience.company, "Empresa", (value) => updateExperience(experience.id, "company", value), 2)}
              </div>
            </div>
            <div className="w-28 shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {renderEditableField(experience.period, "Período", (value) => updateExperience(experience.id, "period", value), 2)}
            </div>
          </div>
          <div className="mt-1 text-[11px] leading-relaxed text-slate-600">
            {renderEditableField(experience.desc, "Describí logros, responsabilidades y tecnologías.", (value) => updateExperience(experience.id, "desc", value), 2, { area: true })}
          </div>
        </article>
      ))}
    </div>
  );

  const renderEducationBlocks = () => (
    <div className="space-y-4">
      {cvData.education.map((education) => (
        <article key={education.id} className={`group relative rounded-xl border-l-2 ${currentTheme.border} py-1 pl-5 hover:bg-slate-50`}>
          <div className={`absolute -left-[6px] top-3 h-2.5 w-2.5 rounded-full ${currentTheme.bg}`} />
          <div className="absolute right-2 top-2 hidden gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm group-hover:flex no-print">
            <button onClick={() => moveItem("education", education.id, -1)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100" type="button">↑</button>
            <button onClick={() => moveItem("education", education.id, 1)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100" type="button">↓</button>
            <button onClick={() => removeEducation(education.id)} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50" type="button">×</button>
          </div>
          <div className="flex items-start justify-between gap-3 pr-16">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black leading-tight text-slate-900">
                {renderEditableField(education.degree, "Título / Certificación", (value) => updateEducation(education.id, "degree", value), 3)}
              </h4>
              <div className={`text-[11px] font-bold ${currentTheme.text}`}>
                {renderEditableField(education.institution, "Institución", (value) => updateEducation(education.id, "institution", value), 3)}
              </div>
            </div>
            <div className="w-28 shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {renderEditableField(education.period, "Período", (value) => updateEducation(education.id, "period", value), 3)}
            </div>
          </div>
          <div className="mt-1 text-[11px] leading-relaxed text-slate-600">
            {renderEditableField(education.desc, "Detalles, logros, cursos o menciones.", (value) => updateEducation(education.id, "desc", value), 3, { area: true })}
          </div>
        </article>
      ))}
    </div>
  );

  const preview = useMemo(() => {
    if (!hasCvContent(cvData)) {
      return (
        <div className="flex min-h-[250mm] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
          <FileText className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-sm font-black text-slate-700">CV vacío</h3>
          <p className="mt-1 max-w-xs text-xs">Completá el panel izquierdo o cargá el ejemplo para ver el diseño.</p>
        </div>
      );
    }

    const summaryBlock = cvData.personal.summary && (
      <section className="space-y-2">
        <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Perfil profesional</h3>
        <div className="text-justify text-[11px] leading-relaxed text-slate-600">
          {renderEditableField(cvData.personal.summary, "Resumen profesional", (value) => updatePersonalInfo("summary", value), 1, { area: true })}
        </div>
      </section>
    );

    const sectionHeader = (label: string) => (
      <div className={`flex items-center gap-2 border-b ${currentTheme.border} pb-1`}>
        <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-900">{label}</h3>
        <div className={`h-0.5 flex-1 ${currentTheme.bg} opacity-20`} />
      </div>
    );

    if (cvData.theme.layout === "classic") {
      return (
        <div className="flex min-h-[250mm] flex-col space-y-6">
          <header className={`space-y-2 border-b-2 ${currentTheme.border} pb-5 text-center`}>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              {renderEditableField(cvData.personal.fullName, "Tu nombre", (value) => updatePersonalInfo("fullName", value), 1, { name: true, className: "text-center" })}
            </h1>
            <div className={`text-[11px] font-black uppercase tracking-[0.18em] ${currentTheme.text}`}>
              {renderEditableField(cvData.personal.title, "Título profesional", (value) => updatePersonalInfo("title", value), 1, { className: "text-center" })}
            </div>
            {renderContactList(true)}
          </header>
          {summaryBlock}
          {cvData.experience.length > 0 && <section className="space-y-3">{sectionHeader("Experiencia profesional")}{renderExperienceBlocks()}</section>}
          {cvData.education.length > 0 && <section className="space-y-3">{sectionHeader("Educación")}{renderEducationBlocks()}</section>}
          <section className="grid grid-cols-2 gap-6">
            {cvData.skills.length > 0 && <div className="space-y-2">{sectionHeader("Skills")}{renderListPills(cvData.skills)}</div>}
            {cvData.languages.length > 0 && <div className="space-y-2">{sectionHeader("Idiomas")}{renderListPills(cvData.languages)}</div>}
          </section>
        </div>
      );
    }

    if (cvData.theme.layout === "modern") {
      return (
        <div className="flex min-h-[250mm] flex-col space-y-6">
          <header className={`flex gap-5 border-b ${currentTheme.border} pb-5`}>
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                {renderEditableField(cvData.personal.fullName, "Tu nombre", (value) => updatePersonalInfo("fullName", value), 1, { name: true })}
              </h1>
              <div className={`mt-1 text-[10px] font-black uppercase tracking-[0.18em] ${currentTheme.text}`}>
                {renderEditableField(cvData.personal.title, "Título profesional", (value) => updatePersonalInfo("title", value), 1)}
              </div>
              {cvData.personal.summary && <div className="mt-3 max-w-[440px] text-[10px] leading-relaxed text-slate-500">{renderEditableField(cvData.personal.summary, "Resumen", (value) => updatePersonalInfo("summary", value), 1, { area: true })}</div>}
            </div>
            <aside className="w-[210px] shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">{renderContactList()}</aside>
          </header>
          <div className="grid grid-cols-12 gap-5">
            <main className="col-span-8 space-y-6">
              {cvData.experience.length > 0 && <section className="space-y-3">{sectionHeader("Experiencia")}{renderExperienceBlocks()}</section>}
              {cvData.education.length > 0 && <section className="space-y-3">{sectionHeader("Educación")}{renderEducationBlocks()}</section>}
            </main>
            <aside className="col-span-4 space-y-4">
              {cvData.skills.length > 0 && <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">{sectionHeader("Skills")}{renderListPills(cvData.skills)}</section>}
              {cvData.languages.length > 0 && <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">{sectionHeader("Idiomas")}{renderListPills(cvData.languages)}</section>}
            </aside>
          </div>
        </div>
      );
    }

    return (
      <div className="grid min-h-[273mm] grid-cols-12 gap-6">
        <aside className={`col-span-4 -my-[12mm] -ml-[12mm] border-r ${currentTheme.border} ${currentTheme.softBg} p-[12mm] pr-5`}>
          <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-3xl ${currentTheme.bg} text-3xl font-black text-white shadow-lg`}>
            {cvData.personal.fullName ? cvData.personal.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-950">
            {renderEditableField(cvData.personal.fullName, "Tu nombre", (value) => updatePersonalInfo("fullName", value), 1, { name: true })}
          </h1>
          <div className={`mt-1 text-[10px] font-black uppercase tracking-[0.18em] ${currentTheme.text}`}>
            {renderEditableField(cvData.personal.title, "Título profesional", (value) => updatePersonalInfo("title", value), 1)}
          </div>

          <section className="mt-8 space-y-3">
            <h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Contacto</h3>
            {renderContactList()}
          </section>

          {cvData.skills.length > 0 && <section className="mt-8 space-y-3"><h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Skills</h3>{renderListPills(cvData.skills)}</section>}
          {cvData.languages.length > 0 && <section className="mt-8 space-y-3"><h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Idiomas</h3>{renderListPills(cvData.languages)}</section>}
        </aside>
        <main className="col-span-8 space-y-6">
          {summaryBlock}
          {cvData.experience.length > 0 && <section className="space-y-3">{sectionHeader("Experiencia profesional")}{renderExperienceBlocks()}</section>}
          {cvData.education.length > 0 && <section className="space-y-3">{sectionHeader("Educación")}{renderEducationBlocks()}</section>}
        </main>
      </div>
    );
  }, [cvData, currentTheme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      <style>{`
        .preview-page { position: relative; width: 210mm; min-height: 297mm; box-shadow: 0 24px 70px -30px rgba(15, 23, 42, 0.45); }
        .preview-page > *:not(.watermark-layer) { position: relative; z-index: 1; }
        .cv-name-field {
          display: block;
          width: 100%;
          min-width: 0;
          height: auto;
          overflow: hidden;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .watermark-layer {
          position: absolute;
          right: 12mm;
          bottom: 8mm;
          z-index: 10;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .watermark-text {
          display: inline-flex;
          align-items: center;
          gap: 2mm;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.10);
          background: rgba(255, 255, 255, 0.72);
          padding: 2mm 4mm;
          font-size: 3.2mm;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: rgba(15, 23, 42, 0.34);
          white-space: nowrap;
          user-select: none;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
        }
        .canvas-grid { background-size: 24px 24px; background-image: radial-gradient(circle, #cbd5e1 1.1px, transparent 1.1px); }
        @page { size: A4; margin: 0; }
        @media print {
          html, body, #root { width: 210mm; min-height: 297mm; background: white !important; }
          body { margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .workspace { display: block !important; overflow: visible !important; padding: 0 !important; background: white !important; }
          .print-container { transform: none !important; width: 210mm !important; box-shadow: none !important; }
          .preview-page { position: relative !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 12mm !important; box-shadow: none !important; overflow: hidden !important; }
          .watermark-layer { position: absolute !important; right: 12mm !important; bottom: 8mm !important; inset: auto 12mm 8mm auto !important; display: flex !important; align-items: center !important; justify-content: flex-end !important; z-index: 10 !important; pointer-events: none !important; }
          .watermark-text { border: 1px solid rgba(15, 23, 42, 0.10) !important; background: rgba(255, 255, 255, 0.72) !important; padding: 2mm 4mm !important; border-radius: 999px !important; color: rgba(15, 23, 42, 0.34) !important; font-size: 3.2mm !important; font-weight: 800 !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          article { break-inside: avoid; page-break-inside: avoid; }
          input, textarea { background: transparent !important; }
          .cv-name-field {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            white-space: pre-wrap !important;
            overflow-wrap: anywhere !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      <aside className={`no-print z-30 flex h-full flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition-all duration-300 ${sidebarCollapsed ? "w-0 overflow-hidden" : "w-full md:w-[430px]"}`}>
        <header className="border-b border-slate-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-700 p-2 text-white shadow-lg shadow-indigo-200"><FileText className="h-5 w-5" /></div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950">CV Builder</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Editor A4</p>
              </div>
            </div>
            <button type="button" onClick={handleReset} className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><RotateCcw className="h-4 w-4" /></button>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`rounded-xl border px-1.5 py-2 text-[10px] font-black transition ${currentStep === step.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                  title={step.label}
                >
                  <Icon className="mx-auto mb-1 h-3.5 w-3.5" />
                  {step.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {currentStep === 1 && (
            <div className="space-y-4">
              <SectionTitle icon={User} title="Perfil" description="Datos principales, contacto y resumen profesional." />
              <TextInput label="Nombre completo" value={cvData.personal.fullName} onChange={(value) => updatePersonalInfo("fullName", value)} placeholder="Ej: Santos Linares" />
              <TextInput label="Título profesional" value={cvData.personal.title} onChange={(value) => updatePersonalInfo("title", value)} placeholder="Ej: Co-Founder & CTO" />
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Email" type="email" value={cvData.personal.email} onChange={(value) => updatePersonalInfo("email", value)} placeholder="email@dominio.com" />
                <TextInput label="Teléfono" value={cvData.personal.phone} onChange={(value) => updatePersonalInfo("phone", value)} placeholder="+54 9 ..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Ubicación" value={cvData.personal.location} onChange={(value) => updatePersonalInfo("location", value)} placeholder="Córdoba, Argentina" />
                <TextInput label="Web / Portfolio" value={cvData.personal.website} onChange={(value) => updatePersonalInfo("website", value)} placeholder="portfolio.com" />
              </div>
              <TextArea label="Resumen profesional" value={cvData.personal.summary} onChange={(value) => updatePersonalInfo("summary", value)} rows={5} placeholder="Escribí un resumen breve, concreto y orientado a impacto." />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3"><SectionTitle icon={Briefcase} title="Experiencia" description="Usá logros medibles cuando sea posible." /><button type="button" onClick={addExperience} className="rounded-xl bg-indigo-700 p-2 text-white hover:bg-indigo-800"><Plus className="h-4 w-4" /></button></div>
              {cvData.experience.length === 0 ? <EmptyState message="Todavía no agregaste experiencia." /> : cvData.experience.map((experience, index) => (
                <div key={experience.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">Experiencia #{index + 1}</span><button type="button" onClick={() => removeExperience(experience.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>
                  <div className="grid grid-cols-2 gap-3"><TextInput label="Empresa" value={experience.company} onChange={(value) => updateExperience(experience.id, "company", value)} /><TextInput label="Rol" value={experience.role} onChange={(value) => updateExperience(experience.id, "role", value)} /></div>
                  <TextInput label="Período" value={experience.period} onChange={(value) => updateExperience(experience.id, "period", value)} placeholder="2023 - Actualidad" />
                  <TextArea label="Descripción" value={experience.desc} onChange={(value) => updateExperience(experience.id, "desc", value)} rows={3} />
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3"><SectionTitle icon={GraduationCap} title="Educación" description="Carreras, cursos, certificaciones y formación relevante." /><button type="button" onClick={addEducation} className="rounded-xl bg-indigo-700 p-2 text-white hover:bg-indigo-800"><Plus className="h-4 w-4" /></button></div>
              {cvData.education.length === 0 ? <EmptyState message="Todavía no agregaste educación." /> : cvData.education.map((education, index) => (
                <div key={education.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">Formación #{index + 1}</span><button type="button" onClick={() => removeEducation(education.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>
                  <div className="grid grid-cols-2 gap-3"><TextInput label="Institución" value={education.institution} onChange={(value) => updateEducation(education.id, "institution", value)} /><TextInput label="Título" value={education.degree} onChange={(value) => updateEducation(education.id, "degree", value)} /></div>
                  <TextInput label="Período" value={education.period} onChange={(value) => updateEducation(education.id, "period", value)} />
                  <TextArea label="Detalle" value={education.desc} onChange={(value) => updateEducation(education.id, "desc", value)} rows={2} />
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <SectionTitle icon={Sparkles} title="Skills e idiomas" description="Agregá elementos concretos. Evitá duplicados." />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <TextInput label="Skill" value={skillInput} onChange={setSkillInput} placeholder="React, Node.js, Liderazgo..." />
                <button type="button" onClick={() => addListItem("skills", skillInput, () => setSkillInput(""))} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-black">Agregar skill</button>
                <div className="flex flex-wrap gap-2">{cvData.skills.map((skill, index) => <button key={`${skill}-${index}`} type="button" onClick={() => removeListItem("skills", index)} className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-rose-600">{skill} ×</button>)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <TextInput label="Idioma" value={languageInput} onChange={setLanguageInput} placeholder="Inglés (Avanzado)" />
                <button type="button" onClick={() => addListItem("languages", languageInput, () => setLanguageInput(""))} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-black">Agregar idioma</button>
                <div className="flex flex-wrap gap-2">{cvData.languages.map((language, index) => <button key={`${language}-${index}`} type="button" onClick={() => removeListItem("languages", index)} className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-rose-600">{language} ×</button>)}</div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <SectionTitle icon={Layout} title="Diseño" description="Cambiá template, color, fuente y exportá el resultado." />
              <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Template</p><div className="grid grid-cols-3 gap-2">{(["sidebar", "classic", "modern"] as LayoutType[]).map((layout) => <button key={layout} type="button" onClick={() => updateTheme("layout", layout)} className={`rounded-2xl border p-3 text-xs font-black capitalize ${cvData.theme.layout === layout ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500"}`}>{layout}</button>)}</div></div>
              <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Color</p><div className="grid grid-cols-6 gap-2">{Object.keys(themeColors).map((color) => <button key={color} type="button" onClick={() => updateTheme("color", color as ThemeColor)} className={`flex h-10 items-center justify-center rounded-2xl border-2 ${cvData.theme.color === color ? "border-slate-950" : "border-transparent"}`}><span className={`h-6 w-6 rounded-xl ${themeColors[color as ThemeColor].bg}`} /></button>)}</div></div>
              <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Fuente</p><div className="grid grid-cols-3 gap-2">{([{ value: "font-sans", label: "Sans" }, { value: "font-serif", label: "Serif" }, { value: "font-mono", label: "Mono" }] as { value: FontType; label: string }[]).map((font) => <button key={font.value} type="button" onClick={() => updateTheme("font", font.value)} className={`rounded-2xl border p-3 text-xs font-black ${font.value} ${cvData.theme.font === font.value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500"}`}>{font.label}</button>)}</div></div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep((Math.max(1, currentStep - 1) as StepId))} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-30"><ChevronLeft className="h-4 w-4" />Anterior</button>
            <button type="button" disabled={currentStep === 5} onClick={() => setCurrentStep((Math.min(5, currentStep + 1) as StepId))} className="flex items-center gap-1 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-black text-white disabled:opacity-30">Siguiente<ChevronRight className="h-4 w-4" /></button>
          </div>
        </footer>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /></button>
            <button type="button" onClick={() => setShowGrid((value) => !value)} className={`rounded-xl border p-2 ${showGrid ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600"}`}><Grid className="h-4 w-4" /></button>
            <button type="button" onClick={resetCanvas} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Move className="h-4 w-4" /></button>
            <span className="hidden text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:inline">A4 Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.05).toFixed(2))))} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"><Minimize2 className="h-4 w-4" /></button>
            <span className="w-14 rounded-lg bg-slate-100 px-2 py-1 text-center text-xs font-black text-slate-600">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.15, Number((value + 0.05).toFixed(2))))} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"><Maximize2 className="h-4 w-4" /></button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportJson} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 sm:flex items-center gap-1"><Upload className="h-4 w-4" />Importar</button>
            <button type="button" onClick={handleExportJson} className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 sm:flex items-center gap-1"><Download className="h-4 w-4" />JSON</button>
            <button type="button" onClick={handleLoadSample} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-100"><Sparkles className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">Ejemplo</span></button>
            <button type="button" onClick={handlePrint} className={`flex items-center gap-1 rounded-xl ${currentTheme.bg} ${currentTheme.hover} px-3 py-2 text-xs font-black text-white shadow-lg shadow-slate-300`}><Printer className="h-4 w-4" />PDF</button>
          </div>
        </header>

        <section
          onMouseDown={handleWorkspaceMouseDown}
          onMouseMove={handleWorkspaceMouseMove}
          onMouseUp={stopPanning}
          onMouseLeave={stopPanning}
          onDoubleClick={resetCanvas}
          className={`workspace flex-1 overflow-hidden p-10 ${showGrid ? "canvas-grid bg-slate-100" : "bg-slate-200"} ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="print-container mx-auto origin-top transition-transform" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, width: "210mm" }}>
            <div className={`preview-page bg-white p-[12mm] ${cvData.theme.font}`}>
              <div className="watermark-layer" aria-hidden="true">
                <div className="watermark-text">Creado con CV Builder</div>
              </div>
              {preview}
            </div>
          </div>
        </section>
      </main>

      {toast.show && (
        <div className={`no-print fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-xs font-black text-white shadow-2xl ${toast.type === "error" ? "bg-rose-900" : toast.type === "info" ? "bg-slate-900" : "bg-emerald-700"}`}>
          <Check className="h-4 w-4" />
          {toast.message}
        </div>
      )}
    </div>
  );
}