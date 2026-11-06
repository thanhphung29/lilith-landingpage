"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CONSENT_KEYS as CONSENTS, EMAIL_MAX_LENGTH, isValidDiscord, isValidEmail, normalizeDiscord } from "@/lib/validation";
import useApplyClosed from "./hooks/useApplyClosed";
import { SOCIALS } from "./socials";
import ButtonParticles from "./ButtonParticles";
import Turnstile from "./Turnstile";

const CARD =
  "rounded-xl border border-[#97691a]/60 bg-[#0c1220]/85 p-6 shadow-royal-box transition-colors hover:border-[#bfae67]";
const LABEL = "mb-1 block text-base font-bold text-gothic-body sm:text-xl";
// Same as LABEL, with more room before the answer on the confirm step
const CONFIRM_LABEL = "mb-3 block text-base font-bold text-gothic-body sm:text-xl";
type Errors = { email?: string; discord?: string; wishlist?: string; consent?: string; captcha?: string };

const DISCORD_URL = SOCIALS.find((social) => social.label === "Discord")?.href ?? "#";
const SUPPORT_EMAIL = "support@fahrenheit213.co.jp";

type Entry = { email: string; discord: string; wishlist: "yes" | "no"; consents: string[] };

const INPUT_ERROR = "border-red-500/80 focus:border-red-400 focus:ring-red-400";
const INPUT =
  "w-full rounded border border-[#97691a]/60 bg-[#05070d] py-3 pr-4 pl-10 text-base text-gothic-body placeholder-gothic-body/40 transition-all focus:border-[#bfae67] focus:ring-1 focus:ring-[#bfae67] focus:outline-none";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-2 text-base text-red-400">
      <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

// What the applicant has typed so far. It lives in memory only: it survives leaving the page and
// coming back (even if Next drops the cached copy of the page), and is gone on a refresh or once
// the application has been sent.
const draft = { email: "", discord: "", wishlist: "", consents: [] as string[] };

function clearDraft() {
  draft.email = "";
  draft.discord = "";
  draft.wishlist = "";
  draft.consents = [];
}

function isDraftComplete() {
  return (
    draft.email.trim() !== "" &&
    draft.discord.trim() !== "" &&
    draft.wishlist !== "" &&
    CONSENTS.every((key) => draft.consents.includes(key))
  );
}

export default function ApplyForm({ guide }: { guide: React.ReactNode }) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const closed = useApplyClosed();
  const formRef = useRef<HTMLFormElement>(null);
  // form -> confirm (review what was entered) -> done (after the API says OK), all on the page
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const headingRef = useRef<HTMLDivElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  // The step the page last scrolled for, so arriving on the page (or coming back to it) never scrolls
  const scrolledStep = useRef<"form" | "confirm" | "done">("form");
  // What the applicant entered, shown on the confirm step before anything is sent
  const [entry, setEntry] = useState<Entry | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [token, setToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // Every field filled in and every agreement ticked (format is still checked on submit)
  const [filled, setFilled] = useState(isDraftComplete);
  const stepRef = useRef(step);

  // Next keeps this page's state alive when navigating away (it is only hidden), and effects are
  // cleaned up when the page is hidden. What the applicant typed stays, so coming back finds the
  // form as they left it; only a finished application (thank-you step) starts over.
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const form = formRef.current;
    return () => {
      if (stepRef.current === "done") {
        clearDraft();
        setStep("form");
        scrolledStep.current = "form";
        setEntry(null);
        setErrors({});
        setFilled(false);
        form?.reset();
      } else {
        // Coming back to this step must not scroll
        scrolledStep.current = stepRef.current;
      }
    };
  }, []);

  // Applications close while this page is open: go back to the top page (where the button and
  // title already show "closed"). The pathname check stops a hidden, cached copy of this page
  // from redirecting someone who is already elsewhere.
  useEffect(() => {
    if (closed && pathname === "/apply") router.replace("/");
  }, [closed, pathname, router]);

  // Bring the new step into view (the page is long and the header is fixed)
  useEffect(() => {
    if (scrolledStep.current === step) return;
    scrolledStep.current = step;
    // Confirm and thank-you take over the page title; going back (Edit) lands on the form itself
    (step === "form" ? formAreaRef : headingRef).current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function checkFilled() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    draft.email = String(data.get("email") ?? "");
    draft.discord = String(data.get("discord") ?? "");
    draft.wishlist = String(data.get("wishlist") ?? "");
    draft.consents = CONSENTS.filter((key) => data.get(key));
    setFilled(
      String(data.get("email") ?? "").trim() !== "" &&
        String(data.get("discord") ?? "").trim() !== "" &&
        !!data.get("wishlist") &&
        CONSENTS.every((key) => data.get(key)),
    );
  }

  function clearError(field: keyof Errors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const discord = normalizeDiscord(String(data.get("discord") ?? ""));

    const next: Errors = {};
    if (!email) next.email = t("err_email_required");
    else if (!isValidEmail(email)) next.email = t("err_email_invalid");
    if (!discord) next.discord = t("err_discord_required");
    else if (!isValidDiscord(discord)) next.discord = t("err_discord_invalid");
    const wishlist = String(data.get("wishlist") ?? "");
    if (wishlist !== "yes" && wishlist !== "no") next.wishlist = t("err_wishlist_required");
    if (!CONSENTS.every((key) => data.get(key))) next.consent = t("err_consent_required");
    if (!token) next.captcha = t("err_captcha_required");

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const target = next.consent ? "consent_1" : next.email ? "applicantEmail" : next.discord ? "discordHandle" : "wishlist_yes";
      formRef.current?.querySelector<HTMLElement>(`[id="${target}"]`)?.focus();
      return;
    }

    // Valid: go to the confirm step. Nothing is sent until the applicant confirms.
    setEntry({ email, discord, wishlist: wishlist as Entry["wishlist"], consents: CONSENTS.filter((key) => data.get(key)) });
    setStep("confirm");
  }

  async function sendApplication() {
    if (!entry) return;
    // The captcha token can expire while the confirm step is open
    if (!token) {
      setStep("form");
      setErrors({ captcha: t("err_captcha_required") });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, token, locale }),
      });
      const result: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        clearDraft();
        setStep("done");
        return;
      }
      // The deadline passed while the application was on its way
      if (result.error === "closed") {
        router.replace("/");
        return;
      }
      // Back to the form, with the reason shown under the captcha
      setStep("form");
      setErrors({
        captcha: t(result.error === "captcha_failed" ? "err_captcha_failed" : "err_submit_failed"),
      });
    } catch {
      setStep("form");
      setErrors({ captcha: t("err_submit_failed") });
    } finally {
      setSubmitting(false);
      // The token is single use: get a fresh one
      setCaptchaKey((k) => k + 1);
    }
  }

  return (
    <>
      {/* Page title: follows the step (form -> confirm -> thank-you) */}
      <div ref={headingRef} className="mb-8 scroll-mt-24 text-center">
        <h1
          // German titles ("Bewerbungsformular") are long: smaller below 375px so they stay on one line
          className={`mt-6 text-3xl font-black tracking-wide text-gothic-body sm:text-4xl ${locale === "de" ? "max-[374px]:text-2xl" : ""}`}
        >
          {step === "done" ? t("apply_done_title") : step === "confirm" ? t("confirm_title") : t("form_main_title")}
        </h1>
        <div className="gold-filigree-bar mx-auto mt-3 w-40" />
      </div>

      {step === "done" ? (
        // Takes the place of "Before you apply" once the application has gone through
        <section className="info-frame relative mb-8 p-2 sm:p-4">
          <div className="space-y-4 text-base text-gothic-body">
            <p className="leading-relaxed">
              {t.rich("apply_done_lead", { b: (chunks) => <strong className="font-bold">{chunks}</strong> })}
            </p>
            <p className="leading-relaxed">{t("apply_done_not_selected")}</p>
            <div>
              <p className="leading-relaxed">{t("apply_done_from")}</p>
              <p className="mt-1 font-bold">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-gothic-gold underline hover:text-gothic-body"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
            <div className="space-y-1 text-sm text-gothic-body">
              <p>{t("apply_done_spam")}</p>
              <p>{t("apply_done_allow")}</p>
            </div>
            <div>
              <span className="mb-1 block text-sm font-bold tracking-wider text-gothic-gold">
                {t("apply_done_warn_title")}
              </span>
              <ul className="list-inside list-disc space-y-1">
                <li>{t("apply_done_warn_discord")}</li>
                <li>
                  {t.rich("apply_done_warn_server", {
                    link: (chunks) => (
                      <a
                        href={DISCORD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-gothic-gold underline hover:text-gothic-body"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : (
        step === "form" && guide
      )}

    <div ref={formAreaRef} className="scroll-mt-24">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onChange={checkFilled}
        onReset={() => setFilled(false)}
        noValidate
        className={step === "form" ? "space-y-6" : "hidden"}
      >
        <fieldset
          className={`${CARD} ${errors.consent ? "border-red-500/80" : ""}`}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        >
          <legend className="sr-only">{t("form_consent_label")}</legend>
          <p className={LABEL} aria-hidden="true">
            {t("form_consent_label")} <span className="text-gothic-gold">*</span>
          </p>
          <p className="mb-4 text-base text-gothic-body">{t("form_consent_sub")}</p>
          <div className="space-y-3">
            {CONSENTS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded border border-[#97691a]/40 bg-[#05070d] p-3.5 transition-colors hover:bg-[#141a2b]"
              >
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  defaultChecked={draft.consents.includes(key)}
                  onChange={() => clearError("consent")}
                  className="h-6 w-6 min-w-6 shrink-0 grow-0 basis-6 rounded-[4px] accent-gothic-gold"
                />
                <span className="text-base text-gothic-body">{t(key)}</span>
              </label>
            ))}
          </div>
          {errors.consent && <FieldError id="consent-error" message={errors.consent} />}
        </fieldset>

        <div className={CARD}>
          <label htmlFor="applicantEmail" className={LABEL}>
            {t("form_email_label")} <span className="text-gothic-gold">*</span>
          </label>
          <p className="mb-4 text-base text-gothic-body">{t("form_email_sub")}</p>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gothic-gold">
              <i className="fa-regular fa-envelope" aria-hidden="true" />
            </div>
            <input
              type="email"
              id="applicantEmail"
              name="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              defaultValue={draft.email}
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
          <div className="mb-3 space-y-1.5 rounded border border-[#97691a]/50 bg-[#05070d] p-3 text-sm text-gothic-body">
            <p>
              <strong>{t("discord_hint_ex")}</strong>{" "}
              <span className="text-gothic-gold">lunar_tester</span>
              <br />
              <span className="text-gothic-body">{t("discord_hint_1")}</span>
            </p>
            <p className="text-gothic-gold">{t("discord_hint_warn")}</p>
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
              defaultValue={draft.discord}
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
          className={`${CARD} ${errors.wishlist ? "border-red-500/80" : ""}`}
          aria-describedby={errors.wishlist ? "wishlist-error" : undefined}
        >
          <legend className="sr-only">{t("form_wishlist_label")}</legend>
          <p className={LABEL} aria-hidden="true">
            {t("form_wishlist_label")} <span className="text-gothic-gold">*</span>
          </p>
          <div className="mt-3 space-y-3">
            {(["yes", "no"] as const).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded border border-[#97691a]/40 bg-[#05070d] p-3.5 transition-colors hover:bg-[#141a2b]"
              >
                <input
                  type="radio"
                  id={`wishlist_${value}`}
                  name="wishlist"
                  value={value}
                  defaultChecked={draft.wishlist === value}
                  onChange={() => clearError("wishlist")}
                  className="h-6 w-6 min-w-6 shrink-0 grow-0 basis-6 accent-gothic-gold"
                />
                <span className="text-base text-gothic-body">{t(`wishlist_${value}`)}</span>
              </label>
            ))}
          </div>
          {errors.wishlist && <FieldError id="wishlist-error" message={errors.wishlist} />}
        </fieldset>

        <div className="flex flex-col items-center pt-2">
          <div className={`flex flex-col items-center ${token ? "" : "mb-5"}`}>
            {/* Hidden (not unmounted) once verified, so it reappears if the token expires */}
            <div className={token ? "hidden" : undefined}>
              <Turnstile
                resetKey={captchaKey}
                onToken={(value) => {
                  setToken(value);
                  if (value) clearError("captcha");
                }}
              />
            </div>
            {errors.captcha && <FieldError id="captcha-error" message={errors.captcha} />}
          </div>
          <div className="btn-wrap">
            <button
              type="submit"
              disabled={!filled || !token}
              className="btn-img text-gothic-body! flex cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 items-center justify-center gap-3 text-base font-black uppercase tracking-wider"
            >
              <span>{t("btn_next")}</span>
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      {step === "confirm" && entry && (
        <section className="space-y-6">
          <p className="text-center text-base leading-relaxed text-gothic-body">{t("confirm_desc")}</p>

          <div className={CARD}>
            <p className={CONFIRM_LABEL}>
              {t("confirm_email_label")} <span className="text-gothic-gold">*</span>
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gothic-gold">
                <i className="fa-regular fa-envelope" aria-hidden="true" />
              </div>
              <div className={`${INPUT} break-all`}>{entry.email}</div>
            </div>
          </div>

          <div className={CARD}>
            <p className={CONFIRM_LABEL}>
              {t("confirm_discord_label")} <span className="text-gothic-gold">*</span>
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gothic-gold">
                <i className="fa-brands fa-discord" aria-hidden="true" />
              </div>
              <div className={`${INPUT} break-all`}>{entry.discord}</div>
            </div>
          </div>

          <div className={CARD}>
            <p className={CONFIRM_LABEL}>
              {t("confirm_wishlist_label")} <span className="text-gothic-gold">*</span>
            </p>
            <div className="flex items-center gap-3 rounded border border-[#97691a]/40 bg-[#05070d] p-3.5">
              <input
                type="radio"
                checked
                readOnly
                tabIndex={-1}
                className="pointer-events-none h-6 w-6 min-w-6 shrink-0 grow-0 basis-6 accent-gothic-gold"
              />
              <span className="text-base text-gothic-body">{t(`wishlist_${entry.wishlist}`)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4">
            <div className="btn-wrap">
              {!submitting && (
                <>
                  <div className="btn-glow" aria-hidden="true" />
                  <ButtonParticles />
                </>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={sendApplication}
                className="btn-img text-gothic-body! flex h-[72px]! w-[240px]! cursor-pointer items-center justify-center gap-3 text-base font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                <span>{t("btn_submit")}</span>
              </button>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep("form")}
              className="btn-top-img text-gothic-body! flex h-[72px]! w-[211px]! cursor-pointer items-center justify-center gap-3 text-base font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fa-solid fa-pen" aria-hidden="true" />
              <span>{t("confirm_btn_edit")}</span>
            </button>
          </div>
        </section>
      )}
    </div>
    </>
  );
}
