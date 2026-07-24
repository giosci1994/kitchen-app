<h1 align="center">Kitchen App</h1>
<p align="center">
  <b>Modern Kitchen & Restaurant Management</b><br/>
  Manage your kitchen, inventory, recipe book, and prep-lists with a modern reactive UI installable as a PWA.<br/>
  <i>Gestisci la tua cucina, magazzino, ricettario e prep-list con un'interfaccia moderna e reattiva installabile come PWA.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-00bcd4.svg" alt="Status: Active" />
  <img src="https://img.shields.io/badge/next.js-v15.0+-000000.svg" alt="Next.js 15+" />
  <img src="https://img.shields.io/badge/react-v19+-61DAFB.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/prisma-ORM-2D3748.svg" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/postgresql-15+-4169E1.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/docker-compose-2496ED.svg" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8.svg" alt="PWA Ready" />
</p>

<p align="center">🇮🇹 <a href="#-italiano"><b>Italiano</b></a> · 🇬🇧 <a href="#-english"><b>English</b></a></p>

---

## 📸 UI overview · Panoramica UI

> Dark theme, built for kitchen tablets, headless servers and responsive mobile screens.

<table align="center" style="border: none; text-align: center;">
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Home.jpg" alt="Home" width="200" /><br>
      <sup>Dashboard</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Magazzino.jpg" alt="Magazzino" width="200" /><br>
      <sup>Inventario</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Ricettario.jpg" alt="Ricettario" width="200" /><br>
      <sup>Ricettario</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Menu.jpg" alt="Menu" width="200" /><br>
      <sup>Carte & Menu</sup>
    </td>
  </tr>
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Prep_list.jpg" alt="Prep List" width="200" /><br>
      <sup>Prep-list</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Mis_en_place.jpg" alt="Mise en place" width="200" /><br>
      <sup>Mise en place</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Eventi.jpg" alt="Eventi" width="200" /><br>
      <sup>Calendario Eventi</sup>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="docs/Chat.jpg" alt="Chat" width="200" /><br>
      <sup>Chat Brigata</sup>
    </td>
  </tr>
</table>

---

# 🇮🇹 Italiano

## ✨ Panoramica

**Kitchen App** è un'applicazione web leggera e reattiva progettata per ottimizzare la gestione quotidiana di una cucina professionale e di un ristorante. 
Offre una **dashboard in tempo reale** per il magazzino, un ricettario dettagliato con fotografie, liste di preparazione (prep-list e mise en place) e un sistema di chat integrato per la brigata. Tutto integrato in una Progressive Web App (PWA) moderna, senza fronzoli, pronta per essere installata su qualsiasi dispositivo.

Nessun software ingombrante: solo Docker, Next.js, Prisma e PostgreSQL.

## 🚀 Funzionalità principali

### Magazzino e Inventario
- Visualizzazione immediata dello stato del magazzino.
- Interfaccia ottimizzata per schermi mobili e tablet da cucina, riducendo le informazioni superflue a favore di **Nome ingrediente, giacenza e unità**.

### Ricettario e Menu
- Schede ricetta complete con dosaggi precisi e procedimenti dettagliati.
- Organizzazione delle carte del ristorante e dei percorsi di **Menu Degustazione**.

### Prep-list e Mise en place
- Pianificazione dei compiti della brigata e della linea di servizio suddivisi per data.
- Avanzamento visivo immediato delle preparazioni (Task completion).

### Organizzazione ed Eventi
- Calendario integrato per la gestione dei banchetti e delle prenotazioni speciali.
- Chat interna per le comunicazioni rapide tra sala e cucina.

### Progressive Web App (PWA)
- L'app può essere **installata nativamente** su iOS, Android e Desktop.
- Esperienza a schermo intero senza interfaccia del browser.

## 🧱 Architettura

- **Frontend / Backend** — Sviluppato in **Next.js 15 (App Router)** e React 19, con server rendering (SSR) ottimizzato. L'interfaccia usa CSS Vanilla per il massimo controllo e leggerezza.
- **Database** — PostgreSQL gestito tramite **Prisma ORM**.
- **Deployment** — Interamente containerizzato con **Docker** e `docker-compose.yml`, pronto al deploy con un solo comando.

## 📋 Requisiti

- Docker Engine 20.10+ con Docker Compose.
- NodeJS (se eseguito localmente in ambiente di sviluppo).

## 🛠️ Installazione Rapida (Docker)

```bash
git clone https://github.com/giosci1994/kitchen-app.git
cd kitchen-app
docker compose up -d --build
```

Per inizializzare il database con i dati di esempio:
```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app node scripts/seed-demo.js
```

---

# 🇬🇧 English

## ✨ Overview

**Kitchen App** is a lightweight, responsive web application designed to streamline the daily operations of professional kitchens and restaurants.
It provides a **real-time dashboard** for inventory management, a detailed digital recipe book with photos, prep-lists, mise en place task tracking, and an integrated staff chat system. Everything is packaged in a modern Progressive Web App (PWA) ready to be installed on any device.

No bloated enterprise software: just Docker, Next.js, Prisma, and PostgreSQL.

## 🚀 Main features

### Inventory & Stock
- Real-time stock overview.
- Mobile and tablet-optimized interface designed specifically for kitchen use, stripping away unnecessary clutter to focus on **Ingredient name, stock level, and units**.

### Recipe Book & Menus
- Comprehensive recipe cards with precise measurements and step-by-step procedures.
- Restaurant menu planning, including dedicated **Degustation Menus**.

### Prep-list & Mise en place
- Date-specific brigade task planning and service line organization.
- Instant visual progress of preparations (Task completion).

### Organization & Events
- Built-in calendar to manage banquets and special reservations.
- Internal chat for quick communication between front-of-house and the kitchen brigade.

### Progressive Web App (PWA)
- The app can be **natively installed** on iOS, Android, and Desktop.
- Full-screen, app-like experience without browser UI elements.

## 🧱 Architecture

- **Frontend / Backend** — Built with **Next.js 15 (App Router)** and React 19, leveraging optimized server-side rendering (SSR). The UI uses Vanilla CSS for maximum control and minimal footprint.
- **Database** — PostgreSQL managed via **Prisma ORM**.
- **Deployment** — Fully containerized using **Docker** and `docker-compose.yml`, ready to deploy with a single command.

## 📋 Requirements

- Docker Engine 20.10+ with Docker Compose.
- NodeJS (if running locally for development).

## 🛠️ Quickstart (Docker)

```bash
git clone https://github.com/giosci1994/kitchen-app.git
cd kitchen-app
docker compose up -d --build
```

To initialize the database with demo data:
```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app node scripts/seed-demo.js
```

---

<p align="center">
  Crafted with ❤️ by <a href="https://github.com/giosci1994">giosci1994</a>
</p>
