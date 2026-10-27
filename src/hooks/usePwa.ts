import { useEffect, useRef, useState } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwa() {
  const prompt = useRef<InstallPrompt | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(() => window.matchMedia("(display-mode: standalone)").matches);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const connectivity = () => setOnline(navigator.onLine);
    const available = (event: Event) => {
      event.preventDefault(); prompt.current = event as InstallPrompt; setInstallable(true);
    };
    const installedNow = () => { setInstalled(true); prompt.current = null; setInstallable(false); };
    window.addEventListener("online", connectivity);
    window.addEventListener("offline", connectivity);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installedNow);
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => setMessage("A instalação não pôde ser preparada. Você pode continuar no navegador."));
    }
    return () => {
      window.removeEventListener("online", connectivity);
      window.removeEventListener("offline", connectivity);
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installedNow);
    };
  }, []);
  async function install() {
    if (!prompt.current) {
      setMessage("No iPhone: abra no Safari, toque em Compartilhar e em Adicionar à Tela de Início. No Android: use Instalar aplicativo ou Adicionar à tela inicial no menu do navegador.");
      return;
    }
    try { await prompt.current.prompt(); }
    catch { setMessage("Use a opção de instalação no menu do navegador."); }
    finally { prompt.current = null; setInstallable(false); }
  }
  return { online, installed, installable, install, message };
}
