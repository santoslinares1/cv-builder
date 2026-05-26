import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
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

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Last updated: May 2026
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-600">
            This Privacy Policy explains how Factory Resume handles user information when people use
            the tool to create, edit, and export resumes.
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-600">
            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">1. Information we process</h2>
              <p>
              Factory Resume allows users to enter personal and professional information, such as name,
                email address, phone number, location, work experience, education, skills, and languages,
                solely for the purpose of generating an editable and exportable resume.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">2. Local storage</h2>
              <p>
                In this version of the application, the information entered in the editor may be stored
                locally in the user&apos;s browser using localStorage. This makes it possible to preserve
                resume progress on the same device and browser.
              </p>
              <p className="mt-3">
              Factory Resume does not require registration to use the tool and does not automatically send
                resume content to our own servers unless this is expressly indicated in future features.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">3. How we use information</h2>
              <p>The information entered by the user is used to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Display a real-time resume preview.</li>
                <li>Allow the user to edit the entered content.</li>
                <li>Export or print the resume as a PDF.</li>
                <li>Temporarily save progress in the user&apos;s browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">4. Analytics and usage measurement</h2>
              <p>
                The application may use analytics tools to understand general product usage, such as
                landing page visits, editor opens, or PDF export clicks. These measurements are used to
                improve the experience and validate the product.
              </p>
              <p className="mt-3">
                These metrics are not intended to sell personal information or individually analyze the
                content of the resume entered by the user.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">
                5. Cookies, advertising, and similar technologies
              </h2>

              <p>
              Factory Resume may use cookies, browser identifiers, local storage, and similar technologies
                to remember preferences, measure application usage, improve the user experience, and
                eventually display ads.
              </p>

              <p className="mt-3">
                Third parties, including Google, may use cookies to serve ads based on a user&apos;s prior
                visits to this website or to other websites. Advertising cookies allow Google and its
                partners to display personalized or non-personalized ads, as applicable and according to
                the user&apos;s consent settings.
              </p>

              <p className="mt-3">
                Users can opt out of personalized advertising by visiting Google&apos;s ad settings. Users
                may also manage or block cookies through their browser settings.
              </p>

              <p className="mt-3">
                In regions where legally required, such as the European Economic Area, the United Kingdom,
                or Switzerland, user consent will be requested before using cookies or similar technologies
                for purposes that require it, including measurement, ad personalization, or advertising storage.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">6. Resume export</h2>
              <p>
                When the user exports or prints their resume, the process is performed from the browser.
                The user is responsible for reviewing the information included before sharing the document
                with third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">7. Third-party services</h2>
              <p>
              Factory Resume may use external services required for the operation, deployment, or measurement
                of the application, such as hosting, analytics, or web infrastructure providers. These services
                may process technical information such as IP address, browser type, device, visited pages, or
                usage events.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">8. Security</h2>
              <p>
                Reasonable measures are applied to protect the application and reduce risks. However, no digital
                system can guarantee absolute security. We recommend not including unnecessarily sensitive
                information in your resume.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">9. User rights</h2>
              <p>
                Since resume information is primarily stored in the user&apos;s browser, users may delete their
                data by clearing local browser storage or by using the reset options available within the tool.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">10. Changes to this policy</h2>
              <p>
                This Privacy Policy may be updated in the future to reflect changes in the application, new
                features, integrations, user registration, payments, or additional services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-slate-950">11. Contact</h2>
              <p>
                For questions related to this Privacy Policy, you can contact us through the contact methods
                published on the website.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}