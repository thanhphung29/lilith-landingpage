"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const CONSENTS = ["consent_1", "consent_2", "consent_3", "consent_4", "consent_5"] as const;

const CARD =
  "rounded-xl border border-[#97691a]/60 bg-[#0c1220]/85 p-6 shadow-royal-box transition-colors hover:border-[#bfae67]";
const LABEL = "mb-1 block text-base font-bold text-gothic-ivory sm:text-lg";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Discord usernames: 6-32 chars of a-z, 0-9, "_" and "."; no two "." in a row
const DISCORD_RE = /^(?!.*\.\.)[a-z0-9_.]{6,32}$/;

type Errors = { email?: string; discord?: string; consent?: string };

const INPUT_ERROR = "border-red-500/80 focus:border-red-400 focus:ring-red-400";
const INPUT =
  "w-full rounded border border-[#97691a]/60 bg-[#05070d] py-3 pr-4 pl-10 font-mono text-sm text-gothic-ivory placeholder-gothic-ivory/40 transition-all focus:border-[#bfae67] focus:ring-1 focus:ring-[#bfae67] focus:outline-none";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-2 text-sm text-red-400">
      <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export default function ApplyForm() {
  const t = useTranslations("Landing");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Next keeps this page's state alive when navigating away (it is only hidden), so close the
  // popup when leaving. Effects are cleaned up when the page is hidden.
  useEffect(() => {
    const form = formRef.current;
    return () => {
      setDone(false);
      setErrors({});
      form?.reset();
    };
  }, []);

  function clearError(field: keyof Errors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const discord = String(data.get("discord") ?? "").trim().replace(/^@/, "").toLowerCase();

    const next: Errors = {};
    if (!email) next.email = t("err_email_required");
    else if (!EMAIL_RE.test(email)) next.email = t("err_email_invalid");
    if (!discord) next.discord = t("err_discord_required");
    else if (!DISCORD_RE.test(discord)) next.discord = t("err_discord_invalid");
    if (!CONSENTS.every((key) => data.get(key))) next.consent = t("err_consent_required");

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const target = next.email ? "applicantEmail" : next.discord ? "discordHandle" : "consent_1";
      formRef.current?.querySelector<HTMLElement>(`[id="${target}"]`)?.focus();
      return;
    }
    // TODO: send the application to the backend
    setDone(true);
  }

  function closeModal() {
    setDone(false);
    formRef.current?.reset();
    router.push("/");
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className={CARD}>
          <label htmlFor="applicantEmail" className={LABEL}>
            {t("form_email_label")} <span className="text-gothic-gold">*</span>
          </label>
          <p className="mb-4 text-sm text-gothic-ivory">{t("form_email_sub")}</p>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gothic-gold">
              <i className="fa-regular fa-envelope" aria-hidden="true" />
            </div>
            <input
              type="email"
              id="applicantEmail"
              name="email"
              autoComplete="email"
              placeholder="yourname@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={() => clearError("email")}
              className={`${INPUT} ${errors.email ? INPUT_ERROR : ""}`}
            />
          </div>
          {errors.email && <FieldError id="email-error" message={errors.email} />}
        </div>

        <div className={CARD}>
          <label htmlFor="discordHandle" className={LABEL}>
            {t("form_discord_label")} <span className="text-gothic-gold">*</span>
          </label>
          <div className="mb-3 space-y-1.5 rounded border border-[#97691a]/50 bg-[#05070d] p-3 font-mono text-xs text-gothic-ivory">
            <p>
              <strong>{t("discord_hint_ex")}</strong>{" "}
              <span className="text-gothic-gold">lunar_tester</span>{" "}
              <span className="text-gothic-ivory/60">{t("discord_hint_1")}</span>
            </p>
            <p className="text-[#fcd34d]">{t("discord_hint_warn")}</p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gothic-gold">
              <i className="fa-brands fa-discord" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="discordHandle"
              name="discord"
              autoComplete="off"
              placeholder="username"
              aria-invalid={!!errors.discord}
              aria-describedby={errors.discord ? "discord-error" : undefined}
              onChange={() => clearError("discord")}
              className={`${INPUT} ${errors.discord ? INPUT_ERROR : ""}`}
            />
          </div>
          {errors.discord && <FieldError id="discord-error" message={errors.discord} />}
        </div>

        <fieldset
          className={`${CARD} ${errors.consent ? "border-red-500/80" : ""}`}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        >
          <legend className="sr-only">{t("form_consent_label")}</legend>
          <p className={LABEL} aria-hidden="true">
            {t("form_consent_label")} <span className="text-gothic-gold">*</span>
          </p>
          <p className="mb-4 text-sm text-gothic-ivory">{t("form_consent_sub")}</p>
          <div className="space-y-3">
            {CONSENTS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded border border-[#97691a]/40 bg-[#05070d] p-3.5 transition-colors hover:bg-[#141a2b]"
              >
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  onChange={() => clearError("consent")}
                  className="mt-1 h-4 w-4 rounded accent-gothic-gold"
                />
                <span className="text-sm text-gothic-body sm:text-base">{t(key)}</span>
              </label>
            ))}
          </div>
          {errors.consent && <FieldError id="consent-error" message={errors.consent} />}
        </fieldset>

        <div className="flex flex-col items-center pt-2">
          <button
            type="submit"
            className="btn-img flex cursor-pointer items-center justify-center gap-3 text-base font-black uppercase tracking-wider"
          >
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
            <span>{t("btn_submit")}</span>
          </button>
          <p className="mt-3 text-center text-xs text-gothic-ivory/70">{t("form_privacy_legal")}</p>
        </div>
      </form>

      {done && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gothic-deep/80 px-4 backdrop-blur-sm"
        >
          <div className="info-frame w-full max-w-xl p-2 text-center sm:p-14 sm:pb-8">
            <h2 id="success-title" className="mb-3 text-2xl font-black text-gothic-ivory">
              {t("modal_title")}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gothic-body">{t("modal_desc")}</p>
            <button
              type="button"
              autoFocus
              onClick={closeModal}
              className="btn-img mx-auto flex cursor-pointer items-center justify-center gap-3 text-base font-black uppercase tracking-wider"
            >
              {t("modal_btn")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
