# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Berufsbildner:innen and HR people at Swiss companies offering an internship ("Praktikum") for Informatiker:in Applikationsentwicklung EFZ. They open the site from the link in Miguel's Bewerbungsschreiben (PDF/print), usually on a desktop at work, sometimes on a phone, and decide within a few minutes whether to invite him for an interview. They are not necessarily technical.

Secondary (unconfirmed weighting): developers/team leads at the same company who follow up on the projects and GitHub links.

## Product Purpose

Personal application website ("Bewerbungswebsite") of Miguel Cabañero, 18, from Thun BE, student at the Informatikmittelschule (IMS) at BWD Bern with Berufsmaturität Wirtschaft und Dienstleistung. Graduates summer 2027 and is looking for the internship from then on. Success = the reader leaves convinced he is a serious, reliable candidate who already builds real things, and invites him.

## Positioning

What a reader should remember (confirmed):
1. **Real, running projects**: not only school exercises. Several apps are live under his own domain (ProfileAuth at profile.miguel-cabanero.ch, TuneHead at tunehead.miguel-cabanero.ch, FilmFinder, ManUtd website), with public GitHub repos.
2. **Reliability and performance**: structured school career, EFZ average 5.1, BM average 5.1, a carefully prepared application.

A third point was indicated but not specified yet (open).

## Operating Context

- Entry point is a link in a printed or PDF application letter; first impression happens in seconds.
- The reader compares many applications; scannability of facts (who, what school, when available, what he built) matters.
- Application documents (Lebenslauf, Zeugnis, Bewerbungsschreiben) are behind a password the reader gets with the application.

## Capabilities and Constraints

- Stack: React 19 + Vite + Tailwind v4, deployed on Vercel. Serverless functions in `api/` handle login/session for the password-protected `/dokumente` area; PDFs live in a private Vercel Blob store. This backend must keep working unchanged.
- Multi-page structure must stay (explicitly **no one-pager**): Start, Über mich, Projekte, Dokumente, Impressum. Old routes `/lebenslauf`, `/staerken`, `/persoenliches` redirect to `/ueber-mich`.
- Languages: DE (default), EN, FR, all content in `src/i18n/`.
- Light/dark toggle removed; the world is a fixed night scene (see DESIGN.md).
- Project list and order in `src/data/projects.js`, texts in `src/i18n/projekte.js`.
- Redesign backlog (Miguel, 2026-10-08):
  1. New project card for Fellow Tenants (current game in development).
  2. Über mich: a "Spotify"-style player for his own recorded songs.
  3. Dokumente page: richer content plus a "download all" button.
  4. Landing page must load and run without lag (performance is a requirement; the old three.js pillar is out).
  5. A section for his Blender designs.
  6. A more creative design overall.
  7. More about who he is as a person.
  8. Skill levels: rework, remove percentage numbers.
  9. Show a cinematic film he made (new interest: cinematic video).
  Status (2026-10-09, React build): 1, 3, 4, 6, 7, 8, 9 done. 2 and 5 are built but empty until Miguel provides the song files and Blender renders. Structure: hall → room → PC with one URL per app (no one-pager). The Bewerbungsschreiben was added to the protected documents and must be uploaded once with `npm run upload-protected-files`.

## Brand Commitments

- Name written "Miguel Cabañero" (with ñ).
- Domain family miguel-cabanero.ch (shared identity across his apps).

## Evidence on Hand

- Portrait: `public/images/portrait.webp`.
- 11 project previews in `public/images/*_preview.webp` (BookLoan included), hotelsoft.webp.
- Interest media: `public/videos/musik-gitarre.mp4`, `public/videos/sport.mp4`, `public/images/manchester-united.webp`, movie and game images in `public/images/movies/`, `public/images/games/`.
- School path 2015–2027 and grades in `src/i18n/ueberMich.js`.
- **Fellow Tenants** (in progress, solo, Unity): story-mode horror game in an apartment block, core rule "Stille = Überleben", escape by talking to neighbours, multiple endings. Source folder `C:\Users\cabz3\Fellow Tenants` (Story/DESIGN.md, Story/HINTERGRUND.md, 11 neighbour character docs). Dev clips: `Dokumentation/NeighbourBillboard.mp4`, `NeighbourDialogs.mp4`, `NeighbourDoor.mp4`, `NeighbourInteract.mp4`.
- **Cinematic films** (own, shot/edited in DaVinci Resolve, 4K masters): `C:\Users\cabz3\DaVinci Films\Ausflug Blueme 4K.mp4`, `CatSleep4K.mp4`. Must ship as compressed web encodes, never the masters.
- **Recorded songs** (own guitar recordings, for a "Spotify"-like player on Über mich): files not located yet, to be provided by Miguel.
- **Blender designs** (2–3 own renders): files not located yet (`C:\Users\cabz3\SilentsBlender` is empty), to be provided by Miguel.
- No testimonials, references, or employer quotes exist; do not fabricate any.
- Media rule (confirmed by Miguel): keep personal photos and videos (portrait, guitar, sport, Manchester trip, project screenshots). Non-personal third-party imagery (game covers in `public/images/games/`, movie/series posters in `public/images/movies/`) may be dropped when it does not fit the design; the interest texts themselves stay.

## Product Principles

1. Facts first: who he is, what he is looking for, and from when must be readable in the first seconds.
2. Show the work: real, live projects are the strongest proof and get the most space.
3. Seriousness over spectacle: decoration never hides content or slows reading.
4. Personal, not generic: his actual interests and story give the site its character.

## Accessibility & Inclusion

Readers include non-technical HR staff of all ages: high legibility, solid contrast, respect for prefers-reduced-motion.
