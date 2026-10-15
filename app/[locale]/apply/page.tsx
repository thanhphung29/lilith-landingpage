import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ApplyForm from "@/components/ApplyForm";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Landing");
  return { title: t("form_main_title") };
}

export default async function ApplyPage() {
  const t = await getTranslations("Landing");

  return (
    <>
      <main className="relative z-10 flex-1 px-4 pt-28 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="btn-back-img mb-6 inline-flex items-center justify-center gap-1.5 text-xs"
          >
            <i className="fa-solid fa-caret-left" aria-hidden="true" />
            <span>{t("btn_back")}</span>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-wide text-gothic-ivory sm:text-4xl">
              {t("form_main_title")}
            </h1>
            <div className="gold-filigree-bar mx-auto mt-3 w-40" />
          </div>

          {/* Guidelines (notes before filling) */}
          <section className="info-frame relative mb-8 p-2 sm:p-4">
            <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-gothic-ivory">
              <span className="h-2.5 w-2.5 rotate-45 bg-gothic-gold" />
              {t("guide_header")}
            </h2>
            <div className="space-y-4 text-sm text-gothic-body">
              <div>
                <span className="mb-1 block text-xs font-bold tracking-wider text-gothic-gold">
                  {t("info_notice_title")}
                </span>
                <p className="leading-relaxed">{t("info_notice_desc")}</p>
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold tracking-wider text-gothic-gold">
                  {t("info_req_title")}
                </span>
                <ul className="list-inside list-disc space-y-1">
                  <li>{t("info_req_pc")}</li>
                  <li>{t("info_req_steam")}</li>
                  <li>{t("info_req_discord")}</li>
                </ul>
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold tracking-wider text-gothic-gold">
                  {t("info_stream_title")}
                </span>
                <p className="leading-relaxed">{t("info_stream_desc")}</p>
              </div>
              <p className="text-xs text-gothic-ivory/80">{t("info_period_note")}</p>
            </div>
          </section>

          <ApplyForm />

          <div className="mt-8 flex justify-center">
            <BackToTop label={t("btn_backtop")} />
          </div>
        </div>
      </main>
      <Footer showSocial />
    </>
  );
}
