# Changelog Kitchen App

Tutte le modifiche strutturali o importanti verranno tracciate in questo documento per mantenere uno storico organizzato.

## [Inizializzazione] - 2026-07-11
- Aggiunta regola globale per il tracciamento delle modifiche (`docs/CHANGELOG.md`).
- Repository sincronizzata con GitHub.
- Configurazione Graphify completata.

## [Sanificazione & Rilascio Pubblico] - 2026-07-24
- Rimossi file multimediali caricati e ricette json locali per proteggere i dati personali.
- Aggiornato `.gitignore` per ignorare file caricati dagli utenti, dati sensibili/locali e cartelle di configurazione AI (`.claude`, `graphify-out`).
- Aggiornato `docker-compose.yml` per supportare variabili d'ambiente parametriche.
- Creato `.env.example` come template di riferimento.
- Azzerata la cronologia Git per eliminare residui dai vecchi commit non pubblici.

## [PWA Integration] - 2026-07-24
- Integrata la libreria `@serwist/next` per il supporto Service Worker nativo.
- Generato `src/app/manifest.ts` per rendere l'app installabile (standalone).
- Generata l'icona PWA personalizzata e salvata nei formati 192x192, 512x512 e apple-touch-icon.
- Creata la pagina di fallback offline in `src/app/~offline/page.tsx`.
- Configurato `src/app/sw.ts` con strategi di caching precache e runtime.
- Aggiornato `src/app/layout.tsx` con viewport e metadati `themeColor`.
