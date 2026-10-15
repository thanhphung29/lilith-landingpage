import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import Logo from "./Logo";
import { SOCIALS } from "./socials";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-gothic-gold/60 bg-gothic-deep/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo className="mt-1 block h-10 w-auto shrink-0 sm:h-12" sizes="(min-width: 640px) 115px, 96px" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-lg text-gothic-gold sm:gap-5 sm:text-xl">
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
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
