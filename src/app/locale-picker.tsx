import { t, type ReaderLanguage } from "@/lib/i18n";
import { saveReaderLanguage } from "./locale-actions";

export function LocalePicker({ language }: { language: ReaderLanguage }) {
  return <form action={saveReaderLanguage} className="locale-picker"><label>{t(language, "language")}<select name="language" defaultValue={language}><option value="en">English</option><option value="es">Español</option></select></label><button className="quiet" type="submit">{t(language, "saveLanguage")}</button></form>;
}
