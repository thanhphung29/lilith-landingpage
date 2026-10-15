import { SOCIALS } from "./socials";

export default function Footer({ showSocial = false }: { showSocial?: boolean }) {
  return (
    <footer className="relative z-10 border-t border-gothic-gold/60 bg-gothic-deep px-4 py-3 text-center text-xs text-gothic-lavender/60">
      {showSocial && (
        <div className="flex items-center justify-center gap-6 py-3 text-xl text-gothic-gold">
          {SOCIALS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors hover:text-gothic-ivory"
            >
              <i className={`fa-brands ${icon}`} aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
      <p className="font-cinzel tracking-wider text-gothic-ivory/80">
        <span className="inline-block">©2026 Fahrenheit 213 Inc. and Gianty Inc.</span>{" "}
        <span className="inline-block">All rights reserved. / LUNAR PULSE PROJECT</span>
      </p>
    </footer>
  );
}
