import { Link } from "react-router-dom";
import { ArrowRight, FileText, Sparkles, Download, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export default function LandingPage() {
    useEffect(() => {
        trackEvent("landing_view");
      }, []);
    return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-2 text-slate-950">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight">CV Builder</span>
          </div>

          <Link
            to="/builder"
            onClick={() => trackEvent("create_cv_click", { source: "header_cta" })}
            >
            Abrir editor
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Gratis, rápido y sin registro
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Creá un CV profesional en minutos.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Completá tus datos, elegí un diseño y exportá tu CV en PDF desde el navegador.
              Simple, editable y pensado para buscar trabajo sin perder tiempo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
                to="/builder"
                onClick={() => trackEvent("create_cv_click", { source: "hero_cta" })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-white/10 hover:bg-slate-100"
                >
                Crear mi CV gratis
                <ArrowRight className="h-4 w-4" />
            </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-black text-white/80 hover:bg-white/10"
              >
                Ver características
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-indigo-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="rounded-2xl border border-slate-200 p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
                    S
                  </div>
                  <div>
                    <div className="text-2xl font-black">Santos Linares</div>
                    <div className="text-xs font-black uppercase tracking-widest text-indigo-700">
                      Full Stack Developer
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      Perfil profesional
                    </div>
                    <div className="h-2 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-2 w-4/5 rounded bg-slate-200" />
                    <div className="mt-2 h-2 w-3/5 rounded bg-slate-200" />
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      Experiencia
                    </div>
                    <div className="rounded-xl border-l-4 border-indigo-700 bg-slate-50 p-4">
                      <div className="h-2 w-2/3 rounded bg-slate-300" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-slate-200" />
                      <div className="mt-3 h-2 w-full rounded bg-slate-200" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      React
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      Node.js
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      TypeScript
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-right text-xs font-bold text-slate-400">
                Creado con CV Builder
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-white text-slate-950">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
          <Feature
            icon={<FileText className="h-5 w-5" />}
            title="Editor visual"
            description="Completá tu información y mirá el CV en formato A4 en tiempo real."
          />
          <Feature
            icon={<Download className="h-5 w-5" />}
            title="Exportá en PDF"
            description="Generá tu CV listo para enviar a recruiters o subir a portales laborales."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Sin registro"
            description="Entrás, creás tu CV y exportás. Sin formularios innecesarios."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}