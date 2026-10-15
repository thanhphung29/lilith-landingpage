import { getTranslations } from "next-intl/server";
import ButtonParticles from "@/components/ButtonParticles";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("Landing");

  return (
    <>
      <main className="flex flex-1 flex-col pt-16">
        <section className="relative z-10 flex flex-1 items-center overflow-hidden bg-gothic-deep">
          {/* Hero banner */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <picture>
              <source media="(max-width: 767px)" srcSet="/img/hero_banner_mobile.png" />
              { }
              <img
                src="/img/hero_banner.png"
                alt=""
                className="absolute inset-0 h-full w-full select-none object-cover object-right-top"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-gothic-deep/85 via-gothic-deep/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gothic-deep/70 to-transparent" />
          </div>

          <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-8 text-center sm:px-10 lg:items-start lg:px-16 lg:text-left">
            <Logo
              priority
              sizes="(min-width: 768px) 448px, (min-width: 640px) 384px, 256px"
              className="mb-6 h-auto w-64 sm:w-96 md:w-[28rem]"
              style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,.8))" }}
            />
            <p className="mb-1 text-lg font-bold tracking-widest text-gothic-gold sm:text-2xl [text-shadow:0_2px_10px_rgba(0,0,0,.9)]">
              {t("hero_kicker")}
            </p>
            <h1 className="mb-8 text-4xl font-black tracking-wide text-gothic-ivory sm:text-6xl [text-shadow:0_2px_14px_rgba(0,0,0,.9)]">
              {t("hero_title")}
            </h1>

            <div className="mb-8">
              <p className="mb-2 inline-block bg-gothic-gold px-3 py-0.5 text-xs font-bold tracking-widest text-gothic-deep sm:text-sm">
                {t("info_deadline_title")}
              </p>
              <p
                className="whitespace-nowrap font-bold text-gothic-ivory [text-shadow:0_2px_10px_rgba(0,0,0,.9)]"
                style={{ fontSize: "clamp(.75rem, calc((100vw - 3rem) / 23), 1.5rem)" }}
              >
                {t("info_deadline_val")}
              </p>
            </div>

            <div className="btn-wrap">
              <div className="btn-glow" aria-hidden="true" />
              <ButtonParticles />
              <Link
                href="/apply"
                className="btn-img flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wider"
              >
                {t("btn_hero_apply")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
