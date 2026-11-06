import { getTranslations } from "next-intl/server";
import FitText from "@/components/FitText";
import ApplyForm from "@/components/ApplyForm";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";

const SUPPORT_EMAIL = "support@fahrenheit213.co.jp";
const GUIDE_TITLE = "mb-1 block text-sm font-bold tracking-wider text-gothic-gold";

// The text between <link>…</link> in a translation is itself the URL, so it is used as the href
// too: changing a URL in the translation sheet then updates the link without touching code.
function linkTo(chunks: React.ReactNode) {
  return <ExternalLink href={(Array.isArray(chunks) ? chunks.join("") : String(chunks)).trim()}>{chunks}</ExternalLink>;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Only real links: anything else (a mistyped translation) is shown as plain text
  if (!/^(https?:|mailto:)/.test(href)) return <>{children}</>;
  return (
    <a
      href={href}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="break-all text-gothic-gold underline hover:text-gothic-ivory"
    >
      {children}
    </a>
  );
}

export default async function ApplyPage() {
  const t = await getTranslations("Landing");

  return (
    <>
      <main className="relative z-10 flex-1 px-4 pt-28 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Guidelines (notes before filling): swapped for the thank-you message once applied */}
          <ApplyForm
            guide={
            <section className="info-frame relative mb-8 p-2 sm:p-4">
              <div className="space-y-4 text-base text-gothic-body">
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    {t.rich("guide_intro", { link: linkTo })}
                  </p>
                  <p className="text-sm text-gothic-ivory/80">{t("guide_intro_note")}</p>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("guide_deadline_title")}</span>
                  <p className="font-bold text-gothic-ivory">{t("guide_deadline_val")}</p>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("guide_period_title")}</span>
                  <p className="font-bold text-gothic-ivory">{t("guide_period_val")}</p>
                  <p className="mt-1 text-sm text-gothic-ivory/80">{t("info_period_note")}</p>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("guide_capacity_title")}</span>
                  <p className="font-bold text-gothic-ivory">{t("guide_capacity_val")}</p>
                  <div className="mt-1 space-y-1 text-sm text-gothic-ivory/80">
                    <p>{t("guide_capacity_note1")}</p>
                    <p>{t("guide_capacity_note2")}</p>
                  </div>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("info_notice_title")}</span>
                  <p className="leading-relaxed">{t("info_notice_desc")}</p>
                  <p className="mt-1 font-bold">
                    <ExternalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ExternalLink>
                  </p>
                  <div className="mt-1 space-y-1 text-sm text-gothic-ivory/80">
                    <p>{t("guide_notice_note1")}</p>
                    <p>{t("guide_notice_note2")}</p>
                  </div>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("info_req_title")}</span>
                  <ul className="list-inside list-disc space-y-1">
                    <li>{t("info_req_pc")}</li>
                    <li>{t("info_req_steam")}</li>
                    <li>{t("info_req_google")}</li>
                    <li>
                      {t.rich("info_req_discord", { link: linkTo })}
                    </li>
                  </ul>
                </div>
                <div>
                  <span className={GUIDE_TITLE}>{t("info_stream_title")}</span>
                  <p className="leading-relaxed">{t("info_stream_desc")}</p>
                  <p className="leading-relaxed">{t("info_stream_desc2")}</p>
                </div>
              </div>
            </section>
            }
          />

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="btn-top-img inline-flex cursor-pointer items-center justify-center gap-2 px-6 text-base font-bold tracking-wider whitespace-nowrap"
            >
              <i className="fa-solid fa-circle-left" aria-hidden="true" />
              <span data-fit-box className="flex min-w-0 items-center">
                <FitText as="span" className="inline-block whitespace-nowrap">
                  {t("btn_back_to_previous")}
                </FitText>
              </span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
