# FoCient (Focus & Efficient) — Tech Stack & Monorepo Architecture

> **FoCient** (Focus & Efficient) — Arsitektur Monorepo (`focient-sourcecode`) berbasis **Turborepo & pnpm**, dengan target rilis multi-platform (Web Desktop, Android, iOS) dan Server Logic Engine dengan standar tipografi **100% Inter Font Family**.

---

## 1. Ringkasan Eksekutif & Filosofi Arsitektur

Arsitektur sistem FoCient dirancang untuk merealisasikan prinsip kerja **Focus and Efficient** serta pendekatan **Guilt-Free Productivity**:

- **Pemisahan Logika Terpusat (Backend USP)**: Seluruh kalkulasi deterministik kapasitas beban kerja (*workload scoring*), penyusunan prioritas Top 3, penempatan slot linimasa pasif (*silent placement*), dan pergeseran jadwal adaptif (*guilt-free rescheduling*) diproses di sisi server agar klien Web dan Mobile selalu sinkron secara konsisten.
- **Contract-First Development**: Seluruh definisi model data, antarmuka DTO (*Data Transfer Object*), dan enumerasi dikunci dalam pustaka bersama `@focient/contracts` sebelum implementasi antarmuka dilakukan.
- **Performa & Rendah Beban Kognitif**: Mengutamakan antarmuka yang bersih (*decluttered*), rendering instan untuk kebutuhan publik/SEO via SSG/RSC, serta persistensi data lokal (*offline-first*) di perangkat seluler via Drift (SQLite).

---

## 2. Matriks Pemilihan Teknologi (Technology Stack)

| Lapisan / Layer | Teknologi Utama | Pustaka & Perkakas Pendukung | Justifikasi & Peran Fungsional |
| :--- | :--- | :--- | :--- |
| **Web Client**<br>(Marketing & Core App) | **Next.js 14+**<br>(TypeScript, App Router) | • Tailwind CSS + shadcn/ui<br>• Zustand (UI State Lokal)<br>• TanStack Query (Server State)<br>• @hello-pangea/dnd (Timeline DND)<br>• Framer Motion (Mikro-interaksi) | Menggabungkan Landing Page / Company Profile (SSG/RSC yang cepat dan ramah SEO) serta Core Web App interaktif (`/today`, `/tasks`, `/insights`) dalam satu repositori menggunakan Route Groups. |
| **Mobile Client**<br>(Android & iOS) | **Flutter 3.x**<br>(Dart) | • Riverpod (State Management)<br>• Drift (SQLite) (Offline Storage)<br>• reorderables (Drag-and-Drop Linimasa)<br>• flutter_local_notifications<br>• workmanager (Background Tasks)<br>• google_sign_in (Flutter SDK) | Satu basis kode untuk eksekusi native di Android dan iOS. Penyimpanan lokal Drift memungkinkan pembukaan linimasa harian secara instan tanpa hambatan koneksi internet (*offline-first*). |
| **Backend & Logic Engine** | **Node.js (NestJS / Express)** | • Prisma ORM<br>• BullMQ (Job Queue)<br>• Class-Validator / Zod | Menjalankan REST API dan modul Core Rule-Based Engine (kalkulasi kapasitas, filter Top 3, dan penjadwalan adaptif) dengan latensi pemrosesan rendah. |
| **Basis Data & Caching** | **PostgreSQL**<br>(Relational Primary) | • Redis (In-Memory Cache & Queue) | Menjamin integritas relasi entitas tugas, batasan jam kerja, log energi, dan riwayat pergeseran jadwal. Redis menangani caching rencana harian aktif dan antrean pemrosesan latar belakang (*silent processing*). |
| **Autentikasi** | **Hybrid Auth**<br>(Google OAuth 2.0 + Manual Email) | • NextAuth.js / Supabase Auth<br>• google_sign_in (Flutter SDK)<br>• JWT Session Tokens | Integrasi Google Sign-In memberikan aktivasi cepat tanpa gesekan (*zero-friction*), sedangkan pendaftaran email/kata sandi manual mengakomodasi pengguna kustom. Profil disatukan via Account Linking. |
| **Modul AI / Heuristik** | **Rule-Based Engine Core**<br>(Modular AI Extension) | • TypeScript Rule Engine (Inti Deterministik)<br>• LiteLLM / Gemini Flash API (Ekstensi teks empatik & parser non-kritis) | Logika utama bekerja 100% deterministik dan instan. Modul AI/LLM bertindak sebagai ekstensi asinkron untuk menyusun teks komunikasi empatik dan rekomendasi tugas tanpa memblokir alur utama sistem. |
| **Infrastruktur & DevOps** | **Vercel & Cloud Containers** | • Docker & Docker Compose<br>• GitHub Actions (CI/CD Pipeline)<br>• Firebase Cloud Messaging (FCM)<br>• Sentry & PostHog | Hosting Next.js di Vercel, API backend di container cloud, push notifikasi adaptif via FCM, serta pelacakan performa dan analitik adopsi produk terpadu. |

---

## 3. Struktur Monorepo (`focient-sourcecode`)

```
focient-sourcecode/
├── .github/
│   └── workflows/              # CI/CD: lint, test, build per paket
├── apps/
│   ├── web/                    # Next.js App Router (Marketing + Web App)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/# Landing Page & Company Profile (SSG/RSC)
│   │   │   │   ├── (auth)/     # Login, Register, Google Callback
│   │   │   │   └── (app)/      # Protected Core App: /onboarding, /today, /tasks, /insights
│   │   │   ├── components/     # UI Primitives & Organisms (100% Inter font family)
│   │   │   ├── hooks/          # TanStack Query Hooks & State Store
│   │   │   └── lib/            # HTTP Fetcher & Auth Client
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mobile/                 # Flutter Application (Android & iOS)
│   │   ├── lib/
│   │   │   ├── core/           # Inter Theme, token visual, HTTP network client
│   │   │   ├── data/           # Drift (SQLite) local DB & DTO mappers
│   │   │   ├── presentation/   # Riverpod providers & Screens (Onboarding, Today, Tasks)
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   │
│   └── server/                 # API Server & Backend Logic Engine (NestJS / Express)
│       ├── src/
│       │   ├── modules/        # Auth (Google/Email), Tasks, Timeline, Categories, Insights
│       │   ├── engine/         # Logika Deterministik Inti FoCient
│       │   │   ├── workload.engine.ts
│       │   │   ├── silent-placement.engine.ts
│       │   │   ├── top3-priorities.engine.ts
│       │   │   └── adaptive-reschedule.engine.ts
│       │   ├── extensions/     # Modul AI / LLM Asinkron Opsional
│       │   └── main.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── contracts/              # Shared DTOs, Enums, & Model Definitions (TypeScript)
│   │   ├── src/
│   │   │   ├── dtos.ts         # Kontrak data terpusat (Task, User, Schedule)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/               # PostgreSQL Migrations & Skema Data
│   │   ├── migrations/         # Skrip DDL SQL
│   │   ├── schema.prisma       # Definisi skema relasional
│   │   └── package.json
│   │
│   └── ui-tokens/              # Design Tokens Ekstraksi Figma Dev Mode
│       ├── src/
│       │   ├── colors.json     # Deep Cobalt, Soft Teal, Warm Amber, Cool Slate
│       │   ├── typography.json # 100% Inter Font Family & Tabular Figure Tokens
│       │   ├── spacing.json    # 4-point / 8-point grid tokens
│       │   ├── shadows.json    # 2-Layer Drop Shadow tokens
│       │   └── motion.json     # Easing curve & 5-tier duration tokens (100ms - 400ms)
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json                # Root Workspace Orchestrator
├── turbo.json                  # Turborepo Build Pipelines
└── README.md
```

---

## 4. Standar Desain Token & Konvensi Tipografi (100% Inter)

### A. Fondasi Tipografi Tunggal (Single Typeface System)
- **Font Family**: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`.
- **Pembatasan Bobot Huruf (Strict 3-Tier Weight)**:
  - **Regular (400)**: Teks badan (*body copy*), deskripsi tugas, catatan panduan empatik.
  - **Medium (500)**: Label tombol sekunder/tertier, input form, tab navigation, metadata waktu, status badge.
  - **SemiBold (600)**: Seluruh tingkat judul (Display, H1, H2, H3), tombol aksi utama (CTA), metrik analitik penting.
  - *Catatan*: Bobot ExtraBold (800) dan Black (900) dilarang digunakan untuk menjaga persona *anti-toxic productivity*.

### B. Matriks Skala Tipografi Multi-Platform (Inter Type Scale)
| Token Semantik | Bobot | Mobile (Size / Line Height) | Web Desktop (Size / Line Height) | Tracking | Penggunaan Komponen FoCient |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `type.display` | SemiBold (600) | 32px / 40px (2.00rem) | 40px / 48px (2.50rem) | -0.02em | Onboarding hero, banner sambutan, ringkasan capaian besar. |
| `type.heading.h1` | SemiBold (600) | 24px / 32px (1.50rem) | 28px / 36px (1.75rem) | -0.015em | Judul layar utama (Today Plan, Task Management, Insights). |
| `type.heading.h2` | SemiBold (600) | 20px / 28px (1.25rem) | 22px / 30px (1.375rem) | -0.01em | Header seksi (Top 3 Priorities, Timeline Schedule, Workload Score). |
| `type.heading.h3` | SemiBold (600) | 16px / 24px (1.00rem) | 18px / 26px (1.125rem) | 0em | Judul kartu tugas (Task Card), header dialog modal Adaptive Reschedule. |
| `type.body.lg` | Regular (400) | 16px / 24px (1.00rem) | 16px / 26px (1.00rem) | 0em | Pesan panduan guilt-free, deskripsi rekomendasi jadwal, catatan refleksi mingguan. |
| `type.body.md` | Regular (400) | 14px / 20px (0.875rem) | 14px / 22px (0.875rem) | 0em | Teks isi default, form input, daftar sub-task, catatan aktivitas harian. |
| `type.label.md` | Medium (500) | 14px / 20px (0.875rem) | 14px / 20px (0.875rem) | +0.01em | Teks tombol CTA, tab navigasi, chip filter kategori tugas. |
| `type.caption` | Reg / Med (500) | 12px / 16px (0.75rem) | 12px / 18px (0.75rem) | +0.01em | Penanda jam linimasa, alokasi durasi tugas, energy capacity tag. |
| `type.micro` | SemiBold (600) | 11px / 14px (0.6875rem) | 11px / 16px (0.6875rem) | +0.05em | Label status kapsul (WORKLOAD RATIO, ENERGY LEVEL, ACTIVE FOCUS). |

### C. Angka Numerik & Waktu Dinamis (Tabular Figures)
Setiap komponen yang menampilkan nilai angka, timer fokus, linimasa jam, dan persentase kapasitas energi wajib mengaktifkan fitur OpenType `tnum` (`font-variant-numeric: tabular-nums` atau `FontFeature.tabularFigures()`):
- Mencegah pergeseran tata letak horizontal (*layout jitter*) saat nilai angka berganti secara dinamis.
- Menjamin baris slot linimasa jam dan durasi tugas tetap lurus secara visual.

### D. Warna Semantik & Guardrail Reschedule
- **Pilar Focus (Primary)**: Deep Cobalt Blue (`#2563EB`) — Mengunci atensi pada tugas prioritas aktif.
- **Pilar Efficient (Secondary)**: Soft Balance Teal (`#0D9488`) — Alur penyesuaian adaptif dan meteran kapasitas yang menenangkan.
- **Pilar Accent**: Deep Violet (`#7C3AED`) — Penanda kategori proyek dan analitik wawasan mingguan.
- **Kanvas & Struktur (Neutral)**: Cool Slate (`#F8FAFC` untuk latar belakang, `#FFFFFF` untuk kartu, `#0F172A` untuk teks utama).
- **Reschedule Guardrail**: Larangan keras memakai warna Danger (merah) untuk tugas tertunda; dialihkan secara adaptif ke token **Warning Amber** (`#D97706` / `#FFFBEB`) dengan pesan yang solutif.
