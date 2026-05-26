import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, Target, ShieldCheck } from "lucide-react";

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight">Factory Resume</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
              About us
            </p>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              We build simple tools to improve how people search for jobs.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Factory Resume was created with a clear idea: to help anyone build a professional,
              editable resume that is ready to export as a PDF, without friction, mandatory
              registration, or complicated templates.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <FileText className="mb-6 h-10 w-10 text-indigo-300" />
              <h2 className="text-2xl font-black">Our mission</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                To make building a strong resume fast, accessible, and clear for people
                looking for new career opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <ValueCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Simplicity"
            description="We want resume creation to be straightforward: fill in your details, choose a design, and export."
          />

          <ValueCard
            icon={<Target className="h-5 w-5" />}
            title="Practical focus"
            description="We prioritize useful tools for real people looking for real jobs."
          />

          <ValueCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Privacy"
            description="The editor runs mainly in your browser and does not require registration to get started."
          />
        </div>

        <section className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Why Factory Resume exists
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Many people need a polished resume, but they do not want to spend hours fighting
              with documents, formatting, or designs that break when exported. Factory Resume aims
              to solve that problem with a simple and focused experience.
            </p>

            <p>
              Our goal is to keep improving the tool with new templates, better content
              recommendations, and features that help users adapt their resumes to different
              job searches.
            </p>

            <p>
              This first version is free and designed to validate the product with real users.
              Our priority is to listen to feedback, improve the experience, and build an
              increasingly useful tool.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-slate-950 p-6 text-white md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Try the editor for free</h2>
              <p className="mt-2 max-w-xl text-slate-300">
                Create your resume, edit the content, and export it as a PDF from your browser.
              </p>
            </div>

            <Link
              to="/builder"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 hover:bg-slate-100"
            >
              Create my resume for free
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}