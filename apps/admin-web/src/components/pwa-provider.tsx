"use client";

import React, { useEffect, useState } from "react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowUpdate(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration failed:", err);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdate(false);
    }
  };

  return (
    <>
      {children}
      {showUpdate && (
        <aside
          aria-label="Atualização de versão"
          className="fixed bottom-4 right-4 z-50 max-w-md bg-[#00091D] border border-blue-600/50 rounded-xl p-4 shadow-2xl shadow-blue-950/50 text-white animate-fade-in flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-semibold text-sm">Nova versão disponível</p>
              <p className="text-xs text-slate-300">
                Uma atualização segura do sistema está pronta. Atualize quando conveniente sem perder suas alterações.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowUpdate(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition rounded"
            >
              Lembrar mais tarde
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 font-medium rounded-lg shadow transition"
            >
              Atualizar Agora
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
