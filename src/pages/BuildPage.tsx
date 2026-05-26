import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
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

type EditableFieldOptions = {
  area?: boolean;
  className?: string;
  printClassName?: string;
  name?: boolean;
  rows?: number;
};

const STORAGE_KEY = "cv-builder-data-v4";

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: 1, label: "Profile", icon: User },
  { id: 2, label: "Experience", icon: Briefcase },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Skills", icon: Sparkles },
  { id: 5, label: "Design", icon: Palette },
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
    location: "Cordoba, Argentina",
    website: "santos.dev",
    summary:
      "Full-stack developer focused on product, frontend/backend architecture, and building SaaS solutions. Experienced in leading internal systems, integrations, and automation-oriented platforms.",
  },
  experience: [
    {
      id: 1,
      company: "GREENLIGHT",
      role: "Co-Founder & CTO",
      period: "2025 - Present",
      desc:
        "Designed and developed a SaaS platform for carbon footprint measurement and management. Defined architecture, product direction, frontend, backend, and technical strategy.",
    },
    {
      id: 2,
      company: "Business Consultants",
      role: "SAS System Lead / Tech Lead",
      period: "2024 - Present",
      desc:
        "Technical leadership over internal recruiting systems. Integrated services, improved operational flows, and coordinated with development, UX/UI, and business teams.",
    },
  ],
  education: [
    {
      id: 1,
      institution: "FAMAF / National University of Cordoba",
      degree: "Computer Science",
      period: "In progress",
      desc: "Training in programming fundamentals, mathematics, logic, and computer science.",
    },
  ],
  skills: ["React", "Angular", "TypeScript", "Node.js", "NestJS", "Laravel", "PostgreSQL", "UX/Product", "APIs"],
  languages: ["Spanish (Native)", "English (Intermediate/Advanced)"],
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
      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
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
      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
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

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
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

  const currentTheme = useMemo(
    () => themeColors[cvData.theme.color] ?? themeColors.blue,
    [cvData.theme.color],
  );

  const progress = (currentStep / STEPS.length) * 100;

  useEffect(() => {
    trackEvent("builder_opened");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  }, [cvData]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const hasLongResumeContent = useMemo(() => {
    const experienceDescriptionLength = cvData.experience.reduce(
      (total, item) => total + item.desc.length,
      0,
    );

    const educationDescriptionLength = cvData.education.reduce(
      (total, item) => total + item.desc.length,
      0,
    );

    const totalDescriptionLength =
      cvData.personal.summary.length + experienceDescriptionLength + educationDescriptionLength;

    return (
      cvData.experience.length > 3 ||
      cvData.education.length > 3 ||
      totalDescriptionLength > 900 ||
      cvData.skills.length > 12 ||
      cvData.languages.length > 4
    );
  }, [
    cvData.education,
    cvData.experience,
    cvData.languages.length,
    cvData.personal.summary.length,
    cvData.skills.length,
  ]);

  const showToast = useCallback((message: string, type: ToastState["type"] = "success") => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);

    setToast({ show: true, message, type });

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2200);
  }, []);

  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    setCvData((previous) => ({
      ...previous,
      personal: { ...previous.personal, [field]: value },
    }));
  }, []);

  const updateTheme = useCallback(<K extends keyof CvData["theme"],>(key: K, value: CvData["theme"][K]) => {
    setCvData((previous) => ({
      ...previous,
      theme: { ...previous.theme, [key]: value },
    }));
  }, []);

  const addExperience = useCallback(() => {
    setCvData((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        { id: Date.now(), company: "", role: "", period: "", desc: "" },
      ],
    }));
    setCurrentStep(2);
  }, []);

  const updateExperience = useCallback((id: number, field: keyof Experience, value: string) => {
    setCvData((previous) => ({
      ...previous,
      experience: previous.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }, []);

  const removeExperience = useCallback((id: number) => {
    setCvData((previous) => ({
      ...previous,
      experience: previous.experience.filter((item) => item.id !== id),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setCvData((previous) => ({
      ...previous,
      education: [
        ...previous.education,
        { id: Date.now(), institution: "", degree: "", period: "", desc: "" },
      ],
    }));
    setCurrentStep(3);
  }, []);

  const updateEducation = useCallback((id: number, field: keyof Education, value: string) => {
    setCvData((previous) => ({
      ...previous,
      education: previous.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }, []);

  const removeEducation = useCallback((id: number) => {
    setCvData((previous) => ({
      ...previous,
      education: previous.education.filter((item) => item.id !== id),
    }));
  }, []);

  const moveItem = useCallback(
    (kind: "experience" | "education", id: number, direction: -1 | 1) => {
      setCvData((previous) => {
        const list = [...previous[kind]];
        const currentIndex = list.findIndex((item) => item.id === id);
        const nextIndex = currentIndex + direction;

        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= list.length) {
          return previous;
        }

        [list[currentIndex], list[nextIndex]] = [list[nextIndex], list[currentIndex]];

        return { ...previous, [kind]: list };
      });
    },
    [],
  );

  const addListItem = useCallback(
    (kind: "skills" | "languages", rawValue: string, clear: () => void) => {
      const value = normalize(rawValue);

      if (!value) return;

      setCvData((previous) => {
        const exists = previous[kind].some((item) => item.toLowerCase() === value.toLowerCase());

        if (exists) return previous;

        return { ...previous, [kind]: [...previous[kind], value] };
      });

      clear();
    },
    [],
  );

  const removeListItem = useCallback((kind: "skills" | "languages", indexToRemove: number) => {
    setCvData((previous) => ({
      ...previous,
      [kind]: previous[kind].filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setCvData(clone(emptyCvData));
    setSkillInput("");
    setLanguageInput("");
    setCurrentStep(1);
    showToast("CV reset.", "info");
  }, [showToast]);

  const handleLoadSample = useCallback(() => {
    setCvData(clone(sampleCvData));
    setCurrentStep(1);
    showToast("Sample data loaded.", "success");
  }, [showToast]);



  const handleImportJson = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      try {
        const text = await file.text();
        setCvData(mergeCvData(JSON.parse(text)));
        showToast("CV imported successfully.", "success");
      } catch {
        showToast("Could not import the JSON file.", "error");
      }
    },
    [showToast],
  );

  const handleDownloadPdf = useCallback(async () => {
    try {
      trackEvent("pdf_export_clicked", {
        template: cvData.theme.layout,
        color: cvData.theme.color,
        has_name: Boolean(cvData.personal.fullName),
        experience_count: cvData.experience.length,
        education_count: cvData.education.length,
        skills_count: cvData.skills.length,
        languages_count: cvData.languages.length,
      });

      const apiUrl = import.meta.env.VITE_PDF_API_URL ?? "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cvData),
      });

      if (!response.ok) {
        throw new Error("Could not generate PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const safeName = cvData.personal.fullName
        ? cvData.personal.fullName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_")
        : "resume";

      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showToast("PDF downloaded.", "success");
    } catch (error) {
      console.error(error);
      showToast("Could not generate PDF.", "error");
    }
  }, [cvData, showToast]);

  const handleWorkspaceMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;

      if (
        target.closest(".preview-page") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return;
      }

      setIsPanning(true);
      setPanStart({
        x: event.clientX - panOffset.x,
        y: event.clientY - panOffset.y,
      });
    },
    [panOffset.x, panOffset.y],
  );

  const handleWorkspaceMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning) return;

      setPanOffset({
        x: event.clientX - panStart.x,
        y: event.clientY - panStart.y,
      });
    },
    [isPanning, panStart.x, panStart.y],
  );

  const stopPanning = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetCanvas = useCallback(() => {
    setZoom(0.82);
    setPanOffset({ x: 0, y: 0 });
    showToast("Canvas centered.", "info");
  }, [showToast]);

  const renderEditableField = useCallback(
    (
      value: string,
      placeholder: string,
      onChange: (value: string) => void,
      step: StepId,
      options?: EditableFieldOptions,
    ) => {
      const displayValue = value || placeholder;
      const commonClass = `w-full bg-transparent outline-none placeholder:text-slate-300 ${
        options?.className ?? ""
      }`;
      const printClass = options?.printClassName ?? options?.className ?? "";

      if (options?.area || options?.name) {
        return (
          <span className="block w-full min-w-0">
            <textarea
              value={value}
              placeholder={placeholder}
              onFocus={() => setCurrentStep(step)}
              onChange={(event) => onChange(event.target.value)}
              rows={options?.rows ?? (options?.name ? 2 : Math.max(2, value.split("\n").length))}
              className={`${commonClass} no-print ${
                options?.name ? "cv-name-field" : ""
              } resize-none rounded-md px-1 py-0.5 leading-relaxed hover:bg-amber-50 focus:bg-amber-50`}
            />

            <span
              className={`print-only hidden w-full min-w-0 whitespace-pre-line break-words ${
                options?.name ? "cv-name-print leading-tight" : "leading-relaxed"
              } ${printClass}`}
            >
              {displayValue}
            </span>
          </span>
        );
      }

      return (
        <span className="block w-full min-w-0">
          <input
            value={value}
            placeholder={placeholder}
            onFocus={() => setCurrentStep(step)}
            onChange={(event) => onChange(event.target.value)}
            className={`${commonClass} no-print rounded-md px-1 py-0.5 hover:bg-amber-50 focus:bg-amber-50`}
          />

          <span className={`print-only hidden w-full min-w-0 whitespace-normal break-words leading-tight ${printClass}`}>
            {displayValue}
          </span>
        </span>
      );
    },
    [],
  );

  const getContactHref = useCallback((field: keyof PersonalInfo, value: string) => {
    const cleanValue = value.trim();

    if (!cleanValue) return "";

    if (field === "email") {
      return `mailto:${cleanValue.replace(/\s+/g, "")}`;
    }

    if (field === "phone") {
      return `tel:${cleanValue.replace(/[^\d+]/g, "")}`;
    }

    if (field === "website") {
      const cleanUrl = cleanValue.replace(/\s+/g, "");
      return /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    }

    return "";
  }, []);

  const getContactDisplayValue = useCallback((field: keyof PersonalInfo, value: string) => {
    if (field === "website") return normalizeUrl(value);
    return value;
  }, []);

  const contactItems = useMemo(
    () => [
      {
        icon: Mail,
        value: cvData.personal.email,
        placeholder: "email@domain.com",
        field: "email" as const,
      },
      {
        icon: Phone,
        value: cvData.personal.phone,
        placeholder: "+1 ...",
        field: "phone" as const,
      },
      {
        icon: MapPin,
        value: cvData.personal.location,
        placeholder: "City, Country",
        field: "location" as const,
      },
      {
        icon: Globe,
        value: cvData.personal.website,
        placeholder: "portfolio.com",
        field: "website" as const,
      },
    ],
    [
      cvData.personal.email,
      cvData.personal.location,
      cvData.personal.phone,
      cvData.personal.website,
    ],
  );

  const renderContactList = useCallback(
    (compact = false) => (
      <div
        className={
          compact
            ? "flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500"
            : "space-y-2.5 text-[11px] text-slate-600"
        }
      >
        {contactItems.map((item) => {
          const Icon = item.icon;
          const displayValue = getContactDisplayValue(item.field, item.value);
          const href = getContactHref(item.field, item.value);
          const isLink = Boolean(href);

          if (compact && !item.value) return null;

          return (
            <div
              key={item.field}
              className={compact ? "flex items-center gap-1" : "flex items-center gap-2"}
            >
              <Icon
                className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 ${
                  currentTheme.text
                }`}
              />

              <div className="cv-contact-value min-w-0 flex-1">
                <span className="block w-full min-w-0">
                  <input
                    value={item.value}
                    placeholder={item.placeholder}
                    onFocus={() => setCurrentStep(1)}
                    onChange={(event) => updatePersonalInfo(item.field, event.target.value)}
                    className={`no-print w-full rounded-md bg-transparent px-1 py-0.5 outline-none placeholder:text-slate-300 hover:bg-amber-50 focus:bg-amber-50 ${
                      compact ? "text-center" : ""
                    }`}
                  />

                  {isLink ? (
                    <a
                      href={href}
                      target={item.field === "website" ? "_blank" : undefined}
                      rel={item.field === "website" ? "noreferrer" : undefined}
                      className={`cv-contact-link print-only hidden w-full min-w-0 leading-tight underline decoration-slate-300 underline-offset-2 ${
                        compact ? "text-center" : ""
                      }`}
                    >
                      {displayValue || item.placeholder}
                    </a>
                  ) : (
                    <span
                      className={`cv-contact-link print-only hidden w-full min-w-0 leading-tight ${
                        compact ? "text-center" : ""
                      }`}
                    >
                      {displayValue || item.placeholder}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    ),
    [
      contactItems,
      currentTheme.text,
      getContactDisplayValue,
      getContactHref,
      updatePersonalInfo,
    ],
  );

  const renderListPills = useCallback(
    (items: string[]) => (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <span
            key={`${item}-${item.length}-${index}`}
            className={`rounded-full border px-2 py-1 text-[10px] font-bold ${currentTheme.pill}`}
          >
            {item}
          </span>
        ))}
      </div>
    ),
    [currentTheme.pill],
  );

  const renderExperienceBlocks = useCallback(
    () => (
      <div className="space-y-4">
        {cvData.experience.map((experience) => (
          <article
            key={experience.id}
            className={`group relative rounded-xl border-l-2 ${currentTheme.border} py-2 pl-5 pr-2 hover:bg-slate-50`}
          >
            <div className={`absolute -left-[6px] top-3 h-2.5 w-2.5 rounded-full ${currentTheme.bg}`} />

            <div className="absolute right-2 top-2 hidden gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm group-hover:flex no-print">
              <button
                onClick={() => moveItem("experience", experience.id, -1)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                type="button"
                aria-label="Move experience up"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem("experience", experience.id, 1)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                type="button"
                aria-label="Move experience down"
              >
                ↓
              </button>
              <button
                onClick={() => removeExperience(experience.id)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50"
                type="button"
                aria-label="Remove experience"
              >
                ×
              </button>
            </div>

            <div className="grid min-w-0 gap-1.5 pr-12">
              <h4 className="text-xs font-black leading-tight text-slate-900">
                {renderEditableField(
                  experience.role,
                  "Position / Role",
                  (value) => updateExperience(experience.id, "role", value),
                  2,
                  { area: true, rows: 1, className: "cv-text-field" },
                )}
              </h4>

              <div className={`text-[11px] font-bold leading-tight ${currentTheme.text}`}>
                {renderEditableField(
                  experience.company,
                  "Company",
                  (value) => updateExperience(experience.id, "company", value),
                  2,
                  { area: true, rows: 1, className: "cv-text-field" },
                )}
              </div>

              <div className="cv-period-pill mt-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                {renderEditableField(
                  experience.period,
                  "Period",
                  (value) => updateExperience(experience.id, "period", value),
                  2,
                )}
              </div>
            </div>

            <div className="mt-1 text-[11px] leading-relaxed text-slate-600">
              {renderEditableField(
                experience.desc,
                "Describe your achievements, responsibilities, and technologies.",
                (value) => updateExperience(experience.id, "desc", value),
                2,
                {
                  area: true,
                  rows: 3,
                  className: "cv-description-field",
                  printClassName: "cv-description-print cv-clamp-3",
                },
              )}
            </div>
          </article>
        ))}
      </div>
    ),
    [
      cvData.experience,
      currentTheme.bg,
      currentTheme.border,
      currentTheme.text,
      moveItem,
      removeExperience,
      renderEditableField,
      updateExperience,
    ],
  );

  const renderEducationBlocks = useCallback(
    () => (
      <div className="space-y-4">
        {cvData.education.map((education) => (
          <article
            key={education.id}
            className={`group relative rounded-xl border-l-2 ${currentTheme.border} py-2 pl-5 pr-2 hover:bg-slate-50`}
          >
            <div className={`absolute -left-[6px] top-3 h-2.5 w-2.5 rounded-full ${currentTheme.bg}`} />

            <div className="absolute right-2 top-2 hidden gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm group-hover:flex no-print">
              <button
                onClick={() => moveItem("education", education.id, -1)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                type="button"
                aria-label="Move education up"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem("education", education.id, 1)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                type="button"
                aria-label="Move education down"
              >
                ↓
              </button>
              <button
                onClick={() => removeEducation(education.id)}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50"
                type="button"
                aria-label="Remove education"
              >
                ×
              </button>
            </div>

            <div className="grid min-w-0 gap-1.5 pr-12">
              <h4 className="text-xs font-black leading-tight text-slate-900">
                {renderEditableField(
                  education.degree,
                  "Degree / Certification",
                  (value) => updateEducation(education.id, "degree", value),
                  3,
                  { area: true, rows: 1, className: "cv-text-field" },
                )}
              </h4>

              <div className={`text-[11px] font-bold leading-tight ${currentTheme.text}`}>
                {renderEditableField(
                  education.institution,
                  "Institution",
                  (value) => updateEducation(education.id, "institution", value),
                  3,
                  { area: true, rows: 1, className: "cv-text-field" },
                )}
              </div>

              <div className="cv-period-pill mt-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                {renderEditableField(
                  education.period,
                  "Period",
                  (value) => updateEducation(education.id, "period", value),
                  3,
                )}
              </div>
            </div>

            <div className="mt-1 text-[11px] leading-relaxed text-slate-600">
              {renderEditableField(
                education.desc,
                "Details, achievements, courses, or honors.",
                (value) => updateEducation(education.id, "desc", value),
                3,
                {
                  area: true,
                  rows: 2,
                  className: "cv-description-field",
                  printClassName: "cv-description-print cv-clamp-2",
                },
              )}
            </div>
          </article>
        ))}
      </div>
    ),
    [
      cvData.education,
      currentTheme.bg,
      currentTheme.border,
      currentTheme.text,
      moveItem,
      removeEducation,
      renderEditableField,
      updateEducation,
    ],
  );

  const sectionHeader = useCallback(
    (label: string) => (
      <div className={`flex items-center gap-2 border-b ${currentTheme.border} pb-1`}>
        <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-900">
          {label}
        </h3>
        <div className={`h-0.5 flex-1 ${currentTheme.bg} opacity-20`} />
      </div>
    ),
    [currentTheme.bg, currentTheme.border],
  );

  const preview = useMemo(() => {
    if (!hasCvContent(cvData)) {
      return (
        <div className="flex min-h-[250mm] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
          <FileText className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-sm font-black text-slate-700">Empty CV</h3>
          <p className="mt-1 max-w-xs text-xs">
            Complete the left panel or load the sample data to preview the design.
          </p>
        </div>
      );
    }

    const summaryBlock = cvData.personal.summary && (
      <section className="space-y-2">
        <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
          Professional profile
        </h3>
        <div className="text-justify text-[11px] leading-relaxed text-slate-600">
          {renderEditableField(
            cvData.personal.summary,
            "Professional summary",
            (value) => updatePersonalInfo("summary", value),
            1,
            { area: true },
          )}
        </div>
      </section>
    );

    if (cvData.theme.layout === "classic") {
      return (
        <div className="flex min-h-[250mm] flex-col space-y-6">
          <header className={`space-y-2 border-b-2 ${currentTheme.border} pb-5 text-center`}>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              {renderEditableField(
                cvData.personal.fullName,
                "Your name",
                (value) => updatePersonalInfo("fullName", value),
                1,
                { name: true, className: "text-center" },
              )}
            </h1>

            <div className={`mt-2 break-words text-[10px] font-black uppercase leading-snug tracking-[0.06em] ${currentTheme.text}`}>
              {renderEditableField(
                cvData.personal.title,
                "Professional title",
                (value) => updatePersonalInfo("title", value),
                1,
                { className: "text-center" },
              )}
            </div>

            {renderContactList(true)}
          </header>

          {summaryBlock}

          {cvData.experience.length > 0 && (
            <section className="space-y-3">
              {sectionHeader("Professional experience")}
              {renderExperienceBlocks()}
            </section>
          )}

          {cvData.education.length > 0 && (
            <section className="space-y-3">
              {sectionHeader("Education")}
              {renderEducationBlocks()}
            </section>
          )}

          <section className="grid grid-cols-2 gap-6">
            {cvData.skills.length > 0 && (
              <div className="space-y-2">
                {sectionHeader("Skills")}
                {renderListPills(cvData.skills)}
              </div>
            )}

            {cvData.languages.length > 0 && (
              <div className="space-y-2">
                {sectionHeader("Languages")}
                {renderListPills(cvData.languages)}
              </div>
            )}
          </section>
        </div>
      );
    }

    if (cvData.theme.layout === "modern") {
      return (
        <div className="flex h-[273mm] min-h-[273mm] flex-col space-y-5 overflow-hidden">
          <header className={`flex gap-5 border-b ${currentTheme.border} pb-5`}>
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                {renderEditableField(
                  cvData.personal.fullName,
                  "Your name",
                  (value) => updatePersonalInfo("fullName", value),
                  1,
                  { name: true },
                )}
              </h1>

              <div className={`mt-2 break-words text-[10px] font-black uppercase leading-snug tracking-[0.06em] ${currentTheme.text}`}>
                {renderEditableField(
                  cvData.personal.title,
                  "Professional title",
                  (value) => updatePersonalInfo("title", value),
                  1,
                )}
              </div>

              {cvData.personal.summary && (
                <div className="mt-3 max-w-[440px] text-[10px] leading-relaxed text-slate-500">
                  {renderEditableField(
                    cvData.personal.summary,
                    "Summary",
                    (value) => updatePersonalInfo("summary", value),
                    1,
                    { area: true },
                  )}
                </div>
              )}
            </div>

            <aside className="w-[210px] shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {renderContactList()}
            </aside>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-12 gap-5 overflow-hidden">
            <main className="cv-main-content col-span-8 space-y-5 overflow-hidden">
              {cvData.experience.length > 0 && (
                <section className="space-y-3">
                  {sectionHeader("Experience")}
                  {renderExperienceBlocks()}
                </section>
              )}

              {cvData.education.length > 0 && (
                <section className="space-y-3">
                  {sectionHeader("Education")}
                  {renderEducationBlocks()}
                </section>
              )}
            </main>

            <aside className="col-span-4 min-w-0 space-y-4 overflow-hidden">
              {cvData.skills.length > 0 && (
                <section className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  {sectionHeader("Skills")}
                  {renderListPills(cvData.skills)}
                </section>
              )}

              {cvData.languages.length > 0 && (
                <section className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  {sectionHeader("Languages")}
                  {renderListPills(cvData.languages)}
                </section>
              )}
            </aside>
          </div>
        </div>
      );
    }

    return (
      <div className="cv-sidebar-layout grid grid-cols-12 gap-6">
        <aside className={`cv-sidebar-aside col-span-4 -my-[12mm] -ml-[12mm] border-r ${currentTheme.border} ${currentTheme.softBg} p-[12mm] pr-5`}>
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ${currentTheme.bg} text-3xl font-black text-white shadow-lg`}>
            {cvData.personal.fullName ? cvData.personal.fullName.charAt(0).toUpperCase() : "U"}
          </div>

          <h1 className="max-w-full text-[25px] font-black leading-[1.05] tracking-tight text-slate-950">
            {renderEditableField(
              cvData.personal.fullName,
              "Your name",
              (value) => updatePersonalInfo("fullName", value),
              1,
              {
                name: true,
                rows: 1,
                className: "cv-sidebar-name-field",
                printClassName: "cv-sidebar-name-print",
              },
            )}
          </h1>

          <div className={`mt-2 max-w-full break-words text-[10px] font-black uppercase leading-[1.35] tracking-[0.025em] ${currentTheme.text}`}>
            {renderEditableField(
              cvData.personal.title,
              "Professional title",
              (value) => updatePersonalInfo("title", value),
              1,
              {
                area: true,
                rows: 2,
                className: "cv-sidebar-title-field",
                printClassName: "cv-sidebar-title-print",
              },
            )}
          </div>

          <section className="mt-6 space-y-2.5">
            <h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Contact
            </h3>
            {renderContactList()}
          </section>

          {cvData.skills.length > 0 && (
            <section className="mt-6 space-y-2.5">
              <h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Skills
              </h3>
              {renderListPills(cvData.skills)}
            </section>
          )}

          {cvData.languages.length > 0 && (
            <section className="mt-6 space-y-2.5">
              <h3 className="border-b border-slate-200 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                Languages
              </h3>
              {renderListPills(cvData.languages)}
            </section>
          )}
        </aside>

        <main className="cv-main-content col-span-8 space-y-5 overflow-hidden">
          {summaryBlock}

          {cvData.experience.length > 0 && (
            <section className="space-y-3">
              {sectionHeader("Professional experience")}
              {renderExperienceBlocks()}
            </section>
          )}

          {cvData.education.length > 0 && (
            <section className="space-y-3">
              {sectionHeader("Education")}
              {renderEducationBlocks()}
            </section>
          )}
        </main>
      </div>
    );
  }, [
    cvData,
    currentTheme.bg,
    currentTheme.border,
    currentTheme.softBg,
    currentTheme.text,
    renderContactList,
    renderEditableField,
    renderEducationBlocks,
    renderExperienceBlocks,
    renderListPills,
    sectionHeader,
    updatePersonalInfo,
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      <style>{`
        .preview-page {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          height: 297mm;
          overflow: hidden;
          box-shadow: 0 24px 70px -30px rgba(15, 23, 42, 0.45);
        }

        .preview-page > *:not(.factory-resume-watermark) {
          position: relative;
          z-index: 1;
        }

        .cv-page {
          overflow: hidden;
        }

        .cv-sidebar-layout {
          min-height: 273mm;
          height: 273mm;
          align-items: stretch;
        }

        .cv-sidebar-aside {
          min-height: 297mm;
          height: 297mm;
        }

        .cv-main-content {
          min-width: 0;
          overflow: hidden;
        }

        .cv-text-field {
          white-space: pre-wrap;
          overflow-wrap: break-word;
          word-break: normal;
        }

        .cv-period-pill {
          width: fit-content;
          max-width: 100%;
        }

        .print-only {
          display: none;
        }

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

        .cv-name-print {
          width: 100%;
          min-width: 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: normal;
        }

        .cv-sidebar-name-field {
          min-height: 30px;
          height: 32px;
          line-height: 1.05;
          overflow: hidden;
          resize: none;
        }

        .cv-sidebar-name-print {
          white-space: normal;
          overflow-wrap: break-word;
          word-break: normal;
          line-height: 1.05;
        }

        .cv-sidebar-title-field {
          min-height: 30px;
          height: 34px;
          overflow: hidden;
          resize: none;
        }

        .cv-sidebar-title-print {
          white-space: normal;
          overflow-wrap: break-word;
          word-break: normal;
        }

        .cv-description-field {
          min-height: 42px;
          max-height: 54px;
          overflow: hidden;
          resize: none;
        }

        .cv-description-print {
          white-space: normal;
          overflow-wrap: break-word;
          word-break: normal;
        }

        .cv-clamp-2,
        .cv-clamp-3 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cv-clamp-2 {
          -webkit-line-clamp: 2;
          line-clamp: 2;
        }

        .cv-clamp-3 {
          -webkit-line-clamp: 3;
          line-clamp: 3;
        }

        .cv-contact-value {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cv-contact-link {
          color: inherit;
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
          color: rgba(15, 23, 42, 0.58);
          white-space: nowrap;
          user-select: none;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
        }

        .canvas-grid {
          background-size: 24px 24px;
          background-image: radial-gradient(circle, #cbd5e1 1.1px, transparent 1.1px);
        }

        .factory-resume-watermark {
          position: absolute;
          right: 12mm;
          bottom: 8mm;
          z-index: 99999;
          pointer-events: none;
          display: block;
          font-size: 12px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0.03em;
          color: #334155;
          white-space: nowrap;
          user-select: none;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body,
          #root {
            width: 210mm;
            min-height: 297mm;
            background: white !important;
          }

          body {
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          input.no-print,
          textarea.no-print,
          input,
          textarea {
            display: none !important;
          }

          .workspace {
            display: block !important;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
          }

          .print-container {
            transform: none !important;
            width: 210mm !important;
            box-shadow: none !important;
          }

          .preview-page {
            position: relative !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          .cv-page {
            overflow: hidden !important;
          }

          .cv-sidebar-layout {
            min-height: 273mm !important;
            height: 273mm !important;
            align-items: stretch !important;
          }

          .cv-sidebar-aside {
            min-height: 297mm !important;
            height: 297mm !important;
          }

          .cv-main-content {
            min-width: 0 !important;
            overflow: hidden !important;
          }

          .cv-name-print,
          .cv-sidebar-name-print {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            white-space: normal !important;
            overflow-wrap: break-word !important;
            word-break: normal !important;
            line-height: 1.05 !important;
          }

          .cv-sidebar-title-print {
            display: block !important;
            white-space: normal !important;
            overflow-wrap: break-word !important;
            word-break: normal !important;
            line-height: 1.35 !important;
          }

          .cv-contact-value {
            overflow: visible !important;
            text-overflow: initial !important;
          }

          .cv-contact-link,
          a.print-only {
            color: inherit !important;
            text-decoration: underline !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: normal !important;
          }

          .cv-description-print {
            display: -webkit-box !important;
            white-space: normal !important;
            overflow-wrap: break-word !important;
            word-break: normal !important;
            overflow: hidden !important;
          }

          .cv-clamp-2 {
            -webkit-line-clamp: 2 !important;
            line-clamp: 2 !important;
          }

          .cv-clamp-3 {
            -webkit-line-clamp: 3 !important;
            line-clamp: 3 !important;
          }

          .watermark-layer {
            position: absolute !important;
            right: 12mm !important;
            bottom: 8mm !important;
            inset: auto 12mm 8mm auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            z-index: 10 !important;
            pointer-events: none !important;
          }

          .watermark-text {
            border: 1px solid rgba(15, 23, 42, 0.10) !important;
            background: rgba(255, 255, 255, 0.72) !important;
            padding: 2mm 4mm !important;
            border-radius: 999px !important;
            color: rgba(15, 23, 42, 0.58) !important;
            font-size: 3.2mm !important;
            font-weight: 800 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .watermark-layer {
            display: none !important;
          }

          .factory-resume-watermark {
            position: fixed !important;
            right: 12mm !important;
            bottom: 8mm !important;
            z-index: 99999 !important;
            display: block !important;
            pointer-events: none !important;
            font-size: 12px !important;
            line-height: 1 !important;
            font-weight: 900 !important;
            letter-spacing: 0.03em !important;
            color: #334155 !important;
            white-space: nowrap !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          article {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <aside
        className={`no-print z-30 flex h-full flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition-all duration-300 ${
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-full md:w-[430px]"
        }`}
      >
        <header className="border-b border-slate-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-700 p-2 text-white shadow-lg shadow-indigo-200">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950">Factory Resume</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">A4 Editor</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Reset resume"
              onClick={handleReset}
              className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>

          {hasLongResumeContent && (
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800">
              This resume may exceed one page. For a US-style resume, keep experience and education descriptions to 2–3 lines.
            </div>
          )}

          <div className="grid grid-cols-5 gap-1">
            {STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`rounded-xl border px-1.5 py-2 text-[10px] font-black transition ${
                    currentStep === step.id
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
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
              <SectionTitle
                icon={User}
                title="Profile"
                description="Main details, contact information, and professional summary."
              />

              <TextInput
                label="Full name"
                value={cvData.personal.fullName}
                onChange={(value) => updatePersonalInfo("fullName", value)}
                placeholder="Ex: Santos Linares"
              />

              <TextInput
                label="Professional title"
                value={cvData.personal.title}
                onChange={(value) => updatePersonalInfo("title", value)}
                placeholder="Ex: Co-Founder & CTO"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Email"
                  type="email"
                  value={cvData.personal.email}
                  onChange={(value) => updatePersonalInfo("email", value)}
                  placeholder="email@domain.com"
                />

                <TextInput
                  label="Phone"
                  value={cvData.personal.phone}
                  onChange={(value) => updatePersonalInfo("phone", value)}
                  placeholder="+1 ..."
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Location"
                  value={cvData.personal.location}
                  onChange={(value) => updatePersonalInfo("location", value)}
                  placeholder="City, Country"
                />

                <TextInput
                  label="Web / Portfolio"
                  value={cvData.personal.website}
                  onChange={(value) => updatePersonalInfo("website", value)}
                  placeholder="portfolio.com"
                />
              </div>

              <TextArea
                label="Professional summary"
                value={cvData.personal.summary}
                onChange={(value) => updatePersonalInfo("summary", value)}
                rows={5}
                placeholder="Write a short, specific, impact-oriented summary."
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <SectionTitle
                  icon={Briefcase}
                  title="Experience"
                  description="Use measurable achievements whenever possible."
                />

                <button
                  type="button"
                  aria-label="Add experience"
                  onClick={addExperience}
                  className="rounded-xl bg-indigo-700 p-2 text-white hover:bg-indigo-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {cvData.experience.length === 0 ? (
                <EmptyState message="You have not added experience yet." />
              ) : (
                cvData.experience.map((experience, index) => (
                  <div key={experience.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                        Experience #{index + 1}
                      </span>

                      <button
                        type="button"
                        aria-label="Remove experience"
                        onClick={() => removeExperience(experience.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <TextInput
                        label="Company"
                        value={experience.company}
                        onChange={(value) => updateExperience(experience.id, "company", value)}
                      />

                      <TextInput
                        label="Role"
                        value={experience.role}
                        onChange={(value) => updateExperience(experience.id, "role", value)}
                      />
                    </div>

                    <TextInput
                      label="Period"
                      value={experience.period}
                      onChange={(value) => updateExperience(experience.id, "period", value)}
                      placeholder="2023 - Present"
                    />

                    <TextArea
                      label="Description"
                      value={experience.desc}
                      onChange={(value) => updateExperience(experience.id, "desc", value)}
                      rows={3}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <SectionTitle
                  icon={GraduationCap}
                  title="Education"
                  description="Degrees, courses, certifications, and relevant training."
                />

                <button
                  type="button"
                  aria-label="Add education"
                  onClick={addEducation}
                  className="rounded-xl bg-indigo-700 p-2 text-white hover:bg-indigo-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {cvData.education.length === 0 ? (
                <EmptyState message="You have not added education yet." />
              ) : (
                cvData.education.map((education, index) => (
                  <div key={education.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                        Education #{index + 1}
                      </span>

                      <button
                        type="button"
                        aria-label="Remove education"
                        onClick={() => removeEducation(education.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <TextInput
                        label="Institution"
                        value={education.institution}
                        onChange={(value) => updateEducation(education.id, "institution", value)}
                      />

                      <TextInput
                        label="Degree"
                        value={education.degree}
                        onChange={(value) => updateEducation(education.id, "degree", value)}
                      />
                    </div>

                    <TextInput
                      label="Period"
                      value={education.period}
                      onChange={(value) => updateEducation(education.id, "period", value)}
                    />

                    <TextArea
                      label="Details"
                      value={education.desc}
                      onChange={(value) => updateEducation(education.id, "desc", value)}
                      rows={2}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <SectionTitle
                icon={Sparkles}
                title="Skills and languages"
                description="Add specific items. Avoid duplicates."
              />

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <TextInput
                  label="Skill"
                  value={skillInput}
                  onChange={setSkillInput}
                  placeholder="React, Node.js, Leadership..."
                />

                <button
                  type="button"
                  onClick={() => addListItem("skills", skillInput, () => setSkillInput(""))}
                  className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-black"
                >
                  Add skill
                </button>

                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, index) => (
                    <button
                      key={`${skill}-${skill.length}-${index}`}
                      type="button"
                      onClick={() => removeListItem("skills", index)}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-rose-600"
                    >
                      {skill} ×
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <TextInput
                  label="Language"
                  value={languageInput}
                  onChange={setLanguageInput}
                  placeholder="English (Advanced)"
                />

                <button
                  type="button"
                  onClick={() => addListItem("languages", languageInput, () => setLanguageInput(""))}
                  className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-black"
                >
                  Add language
                </button>

                <div className="flex flex-wrap gap-2">
                  {cvData.languages.map((language, index) => (
                    <button
                      key={`${language}-${language.length}-${index}`}
                      type="button"
                      onClick={() => removeListItem("languages", index)}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-rose-600"
                    >
                      {language} ×
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <SectionTitle
                icon={Layout}
                title="Design"
                description="Change the template, color, font, and export the result."
              />

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Template
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(["sidebar", "classic", "modern"] as LayoutType[]).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => updateTheme("layout", layout)}
                      className={`rounded-2xl border p-3 text-xs font-black capitalize ${
                        cvData.theme.layout === layout
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Color
                </p>

                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(themeColors).map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select ${color} color`}
                      onClick={() => updateTheme("color", color as ThemeColor)}
                      className={`flex h-10 items-center justify-center rounded-2xl border-2 ${
                        cvData.theme.color === color ? "border-slate-950" : "border-transparent"
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-xl ${themeColors[color as ThemeColor].bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Font
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "font-sans", label: "Sans" },
                      { value: "font-serif", label: "Serif" },
                      { value: "font-mono", label: "Mono" },
                    ] as { value: FontType; label: string }[]
                  ).map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => updateTheme("font", font.value)}
                      className={`rounded-2xl border p-3 text-xs font-black ${font.value} ${
                        cvData.theme.font === font.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className={`mb-3 flex w-full items-center justify-center gap-2 rounded-2xl ${currentTheme.bg} ${currentTheme.hover} px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 md:hidden`}
          >
            <Printer className="h-4 w-4" />
            Download PDF
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((Math.max(1, currentStep - 1) as StepId))}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={currentStep === 5}
              onClick={() => setCurrentStep((Math.min(5, currentStep + 1) as StepId))}
              className="flex items-center gap-1 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-black text-white disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Show or hide editor panel"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Show or hide grid"
              onClick={() => setShowGrid((value) => !value)}
              className={`rounded-xl border p-2 ${
                showGrid
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Center canvas"
              onClick={resetCanvas}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <Move className="h-4 w-4" />
            </button>

            <span className="hidden text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:inline">
              A4 Live Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.05).toFixed(2))))}
              className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 sm:flex"
            >
              <Minimize2 className="h-4 w-4" />
            </button>

            <span className="hidden w-14 rounded-lg bg-slate-100 px-2 py-1 text-center text-xs font-black text-slate-600 sm:block">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(1.15, Number((value + 0.05).toFixed(2))))}
              className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 sm:flex"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />
{/*
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
*/}
            <button
              type="button"
              onClick={handleLoadSample}
              className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-100"
            >
              <Sparkles className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Sample</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className={`flex min-w-[128px] items-center justify-center gap-1.5 rounded-xl ${currentTheme.bg} ${currentTheme.hover} px-3 py-2 text-xs font-black text-white shadow-lg shadow-slate-300 sm:min-w-0 sm:px-3`}
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Download</span>
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </header>

        <section
          onMouseDown={handleWorkspaceMouseDown}
          onMouseMove={handleWorkspaceMouseMove}
          onMouseUp={stopPanning}
          onMouseLeave={stopPanning}
          onDoubleClick={resetCanvas}
          className={`workspace flex-1 overflow-hidden p-10 ${showGrid ? "canvas-grid bg-slate-100" : "bg-slate-200"} ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div
            className="print-container mx-auto origin-top transition-transform"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              width: "210mm",
            }}
          >
            <div className={`preview-page cv-page bg-white p-[12mm] ${cvData.theme.font}`}>
              <div className="factory-resume-watermark" aria-hidden="true">
                Created with Factory Resume
              </div>
              {preview}
            </div>
          </div>
        </section>
      </main>

      {toast.show && (
        <div
          className={`no-print fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-xs font-black text-white shadow-2xl ${
            toast.type === "error"
              ? "bg-rose-900"
              : toast.type === "info"
                ? "bg-slate-900"
                : "bg-emerald-700"
          }`}
        >
          <Check className="h-4 w-4" />
          {toast.message}
        </div>
      )}
    </div>
  );
}