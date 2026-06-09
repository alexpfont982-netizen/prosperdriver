import { useState } from "react";
import { translations } from "./translations";

export function useTranslation() {
  const [lang, setLang]         = useState("pt");
  const [currency, setCurrency] = useState({ code: "BRL", symbol: "R$" });

  const t = translations[lang];

  function setCountry(country) {
    setCurrency({ code: country.currency, symbol: country.symbol });
    setLang(country.lang);
  }

  return { t, lang, setLang, currency, setCurrency, setCountry };
}