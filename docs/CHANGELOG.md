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

## [Login & Registration UI Fixes] - 2026-07-24
- Aggiunto il pulsante per mostrare/nascondere la password in chiaro sia in Login che in Registrazione.
- Aggiunta la checkbox "Rimani connesso" con estensione della sessione a 30 giorni nel backend.
- Sistemato l'allineamento verticale della spunta dei Termini di Servizio durante la registrazione.
- Tradotte le diciture legali del footer e dei modali in inglese (Terms of Service, Privacy Policy).
- Aggiunto nel footer il riferimento e link diretto al profilo GitHub dell'autore (`giosci1994`).
- Risolto un problema di loop di redirect (ERR_TOO_MANY_REDIRECTS) dovuto ai vecchi cookie di sessione rimasti sul browser dopo il reset del database.
- Risolto il bug di reindirizzamento all'indirizzo interno del container (`0.0.0.0:3000`) utilizzando `req.nextUrl.clone()` al posto di `new URL(..., req.url)` nei middleware e route handler.

## [UI Improvements & Extended Demo Data] - 2026-07-24
- Popolato il ricettario con immagini HD di anteprima da Unsplash.
- Creato il Menù Degustazione "Gusto e Tradizione" a fianco del Menù alla Carta.
- Aggiunti ordini dimostrativi di magazzino sia in stato BOZZA che INVIATO.
- Aggiunta una prep-list "Mise en place del giorno" per data oltre alla lista ricorrente.
- Ottimizzata la tabella Inventario per schermi mobile: rimossa l'icona ingombrante e lasciati in evidenza nome completo, giacenza e unità.
- Aggiornato il testo nella Prep-List rimuovendo la posizione "a sinistra" per adattarsi alla vista smartphone.
- Aggiunta la possibilità di vedere la password in chiaro nella pagina Profilo (sezione Sicurezza) e aggiornati i link del footer in inglese con riferimento a GitHub `giosci1994`.
