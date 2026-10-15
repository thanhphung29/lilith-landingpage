import Image from "next/image";
import { getLocale } from "next-intl/server";

// public/img/logo_<locale lowercased>.png, all the same size. Locales without a logo use English.
const LOGO_LOCALES = ["en", "ja", "ko", "ru", "zh-tw", "zh-cn"];
const LOGO_SIZE = { width: 520, height: 218 };

export default async function Logo({
  className,
  sizes,
  priority,
  style,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}) {
  const locale = await getLocale();
  const key = locale.toLowerCase();
  const variant = LOGO_LOCALES.includes(key) ? key : "en";

  return (
    <Image
      src={`/img/logo_${variant}.png`}
      alt="LUNAR PULSE"
      width={LOGO_SIZE.width}
      height={LOGO_SIZE.height}
      sizes={sizes}
      // Serve the file as is: no resizing/re-encoding, and no stale copy in the image cache
      unoptimized
      priority={priority}
      className={className}
      style={style}
    />
  );
}
