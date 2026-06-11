import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const LOCALES = ["en", "vi", "lo"];

export default getRequestConfig(async ({ requestLocale }) => {
  const raw = await requestLocale;
  const locale = LOCALES.includes(raw ?? "") ? (raw as string) : null;
  if (!locale) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
