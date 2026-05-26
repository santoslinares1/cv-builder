import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "../lib/analytics";

export default function LandingPage() {
  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [contactStatus, setContactStatus] = useState<
  "idle" | "sending" | "sent" | "error"
>("idle");

  const handleContactChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    setContactStatus("sending");
  
    try {
      const apiUrl = import.meta.env.VITE_PDF_API_URL ?? "http://localhost:4000";
  
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });
  
      if (!response.ok) {
        throw new Error("Could not send message.");
      }
      
      trackEvent("contact_form_submitted", {
        source: "landing_contact_form",
      });
      
      setContactForm({
        name: "",
        email: "",
        message: "",
      });
      
      setContactStatus("sent");
    } catch (error) {
        console.error(error);


        trackEvent("contact_form_error", {
          source: "landing_contact_form",
        });

      setContactStatus("error");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl sm:h-[520px] sm:w-[520px]" />

        <header className="relative z-10 flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-slate-950 shadow-xl shadow-white/10 sm:h-11 sm:w-11">
              <FileText className="h-5 w-5" />
            </div>
            <span className="truncate text-base font-black tracking-tight sm:text-lg">
              Factory Resume
            </span>
          </Link>

          <Link
            to="/builder"
            onClick={() => trackEvent("create_cv_click", { source: "header_cta" })}
            className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs font-black text-white/80 transition hover:bg-white hover:text-slate-950 sm:px-4 sm:text-sm"
          >
            Open editor
          </Link>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300 sm:px-4 sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="truncate">Free, fast, and no sign-up</span>
            </div>

            <h1 className="text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Create a professional resume in minutes.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:mt-6 sm:text-lg lg:mx-0">
              Fill in your details, choose a design, and export your resume as a PDF from your browser.
              Simple, editable, and built to help you apply for jobs faster.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mx-auto sm:max-w-md sm:flex-row lg:mx-0 lg:max-w-none">
              <Link
                to="/builder"
                onClick={() => trackEvent("create_cv_click", { source: "hero_cta" })}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100 sm:px-6"
              >
                Create my resume for free
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>

              <a
                href="#features"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-5 py-4 text-sm font-black text-white/80 transition hover:bg-white/10 sm:px-6"
              >
                View features
              </a>
            </div>

            <div className="mt-6 grid gap-2 text-left text-sm text-slate-300 sm:mx-auto sm:max-w-md sm:grid-cols-3 lg:mx-0 lg:max-w-xl">
              <TrustItem label="No sign-up" />
              <TrustItem label="PDF ready" />
              <TrustItem label="Editable" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-indigo-500/20 blur-3xl sm:-inset-6" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white p-3 text-slate-950 shadow-2xl sm:rounded-[2rem] sm:p-5">
                <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
                  <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white sm:h-14 sm:w-14 sm:text-2xl">
                      S
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xl font-black sm:text-2xl">
                        Santos Linares
                      </div>
                      <div className="truncate text-[10px] font-black uppercase tracking-widest text-indigo-700 sm:text-xs">
                        Full Stack Developer
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <PreviewSection title="Professional profile" widths={["w-full", "w-4/5", "w-3/5"]} />

                    <div>
                      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-xs">
                        Experience
                      </div>
                      <div className="rounded-xl border-l-4 border-indigo-700 bg-slate-50 p-4">
                        <div className="h-2 w-2/3 rounded bg-slate-300" />
                        <div className="mt-2 h-2 w-1/2 rounded bg-slate-200" />
                        <div className="mt-3 h-2 w-full rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["React", "Node.js", "TypeScript"].map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-right text-[10px] font-bold text-slate-400 sm:text-xs">
                  Created with Factory Resume
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-white text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Everything you need to create your resume
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              A simple workflow to turn your information into a professional PDF.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <Feature
              icon={<FileText className="h-5 w-5" />}
              title="Visual editor"
              description="Fill in your information and preview your A4 resume in real time."
            />
            <Feature
              icon={<Download className="h-5 w-5" />}
              title="Export to PDF"
              description="Generate a resume ready to send to recruiters or upload to job boards."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No sign-up"
              description="Open the tool, create your resume, and export it. No unnecessary forms."
            />
          </div>

          <div className="mt-10 rounded-[2rem] bg-slate-950 p-6 text-center text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:text-left">
            <div>
              <h3 className="text-2xl font-black">Start for free now</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                No account needed. Open the editor, fill in your details, and export.
              </p>
            </div>
            <Link
              to="/builder"
              onClick={() => trackEvent("create_cv_click", { source: "bottom_cta" })}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-slate-100 sm:w-auto lg:mt-0"
            >
              Create my resume for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-50 px-6 py-16 text-slate-950 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
              Contact
            </p>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Have feedback or want to talk to us?
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              We are building Factory Resume with real user feedback. If you have an idea,
              found an issue, or want to contact us, send us a message.
            </p>
{/*
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
              <p className="font-bold text-slate-950">You can also email us directly:</p>
              <a
                href="mailto:contact@yourdomain.com"
                className="mt-2 inline-block font-black text-indigo-700 hover:text-indigo-900"
              >
                contact@yourdomain.com
              </a>
            </div>
*/}
         </div>

          <form
            onSubmit={handleContactSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Name
                </span>
                <input
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Message
              </span>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
                rows={5}
                placeholder="Tell us how we can help..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>

            <button
              type="submit"
              disabled={contactStatus === "sending"}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {contactStatus === "sending" ? "Sending..." : "Send message"}
            </button>

            {contactStatus === "sent" && (
              <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                Your email client opened so you can send the message.
              </p>
            )}
            {contactStatus === "error" && (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                Could not send the message. Please try again.
              </p>
            )}
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <p className="font-medium">
            © 2026 Factory Resume. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/privacy-policy"
              className="font-bold hover:text-slate-950"
            >
              Privacy Policy
            </Link>
            <Link
              to="/about-us"
              className="font-bold hover:text-slate-950"
            >
              About us
            </Link>
            <a
              href="#contact"
              className="font-bold hover:text-slate-950"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
      <span className="font-bold">{label}</span>
    </div>
  );
}

function PreviewSection({ title, widths }: { title: string; widths: string[] }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-xs">
        {title}
      </div>
      {widths.map((width, index) => (
        <div
          key={`${title}-${index}`}
          className={`${index > 0 ? "mt-2" : ""} h-2 rounded bg-slate-200 ${width}`}
        />
      ))}
    </div>
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
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}