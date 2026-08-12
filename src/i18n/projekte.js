export const projekte = {
  de: {
    title: 'Projekte',
    intro:
      'Ausgewählte Schul- und Privatprojekte. Karte antippen/hovern für Details, anklicken zeigt das Projektabstrakt direkt hier auf der Seite.',
    categories: { schule: 'Schule', privat: 'Privat' },
    viewProject: 'Projekt ansehen',
    githubRepo: 'GitHub Repo',
    liveSite: 'Live-Website',
    abstractHeading: 'Projektabstrakt',
    fields: {
      ziel: 'Ziel',
      technologien: 'Technologien',
      meineRolle: 'Meine Rolle',
      wasGelernt: 'Was ich gelernt habe',
    },
    close: 'Schliessen',
    projects: {
      1: {
        title: 'Erste eigene Webseite',
        category: 'schule',
        description:
          'Meine erste eigene Webseite, entstanden im Fach Praxistraining zur Sammlung praktischer Erfahrung: eine einfache Seite mit HTML, CSS und JavaScript, die mich als Person reflektiert.',
        abstract: {
          ziel: 'Im Rahmen des Fachs Praxistraining eine erste eigene, mehrseitige Webseite über mich selbst erstellen, mit Startseite, Steckbrief, Hobbys, Interessen und Kontakt.',
          technologien: 'HTML, CSS (ohne Framework, ohne Backend).',
          meineRolle: 'Einzelprojekt. Konzept, Struktur, Inhalt und Umsetzung lagen komplett bei mir.',
          wasGelernt:
            'Mein erster Kontakt mit Webentwicklung überhaupt: Grundlagen von HTML-Struktur, CSS-Styling und der Aufbau mehrerer verlinkter Seiten.',
        },
      },
      2: {
        title: 'Manchester United Webseite',
        category: 'schule',
        description:
          'Statische Fan-Webseite für Manchester United mit Fokus auf UI/UX. Reines HTML/CSS/JavaScript ohne Framework, als Schulprojekt umgesetzt und live auf Vercel gehostet.',
        abstract: {
          ziel: 'Eine moderne, statische Fan-Webseite für Manchester United mit Fokus auf UI/UX gestalten, inkl. Team-, Store-, News- und Kontaktseite.',
          technologien:
            'Reines HTML (mehrere verlinkte Seiten: index.html, team.html, news.html, store.html, contact.html), ein gemeinsames styles.css, Vanilla JavaScript inline im <script>-Tag, komprimierte Video- und Bilddateien, Hosting auf Vercel. Kein Framework, kein Build-Tool.',
          meineRolle:
            'Einzelprojekt. Konzept, UI/UX-Design, Umsetzung sowie Einbindung und Optimierung der Medien-Assets lagen komplett bei mir.',
          wasGelernt:
            'Aufbau einer mehrseitigen Webseite mit reinem HTML/CSS/JavaScript ohne Framework, Fokus auf UI/UX-Gestaltung sowie das Einbinden, Komprimieren und Organisieren von Video- und Bilddateien für eine performante, statisch gehostete Webseite.',
        },
      },
      3: {
        title: 'HotelsoftSolutions',
        category: 'schule',
        description:
          '.NET MAUI-Applikation für Mitarbeitende in Hotels: Reservationen erstellen, Zimmer zuteilen und weitere Abläufe der Hotelverwaltung digital abbilden.',
        abstract: {
          ziel: 'Eine Applikation für Mitarbeitende in Hotels, mit der sich Reservationen erstellen, Zimmer zuteilen und weitere organisatorische Abläufe digital abwickeln lassen.',
          technologien: '.NET MAUI, C#.',
          meineRolle: 'Einzelprojekt im Rahmen des Moduls Windows Application. Ich habe die Applikation komplett selbst erstellt.',
          wasGelernt:
            'Meine erste Erfahrung mit .NET MAUI: Das gesamte Framework war für mich komplettes Neuland.',
        },
      },
      4: {
        title: 'BookLoan',
        category: 'schule',
        description:
          'Webprojekt aus einer Projektwoche für die simulierte Kollegen-Firma "Planary", umgesetzt mit React: eine Plattform zur Verwaltung von Buchausleihen.',
        abstract: {
          ziel: 'Eine Webanwendung zur Bibliotheksverwaltung entwickeln, mit Verwaltung von Bibliotheken, Büchern und Ausleihen, Benutzerregistrierung, mehrsprachiger Oberfläche und Dark Mode.',
          technologien:
            'React 19, TypeScript, Vite (Frontend); NestJS, Prisma, MySQL (Backend); JWT-Authentifizierung, Docker.',
          meineRolle:
            'Gruppenprojekt zu dritt im Lehrmodul LBV 294 für die simulierte Firma "Planary". Ich war an Konzept sowie Umsetzung von Frontend und Backend beteiligt.',
          wasGelernt:
            'Zusammenarbeit im Team an einem Full-Stack-Projekt, Arbeiten mit Prisma und MySQL im Backend sowie der Einsatz von Docker fürs Deployment.',
        },
      },
      5: {
        title: 'CarPin',
        category: 'schule',
        description:
          'Mobile App zum Speichern und Verwalten von Parkplätzen, entstanden während eines überbetrieblichen Kurses (ÜK) in Gruppenarbeit, entwickelt mit React Native.',
        abstract: {
          ziel: 'Eine mobile App, mit der man seinen Parkplatz-Standort speichern, mit Foto und Timer versehen und die Rückroute per Karten-App wiederfinden kann.',
          technologien: 'React Native, Expo, TypeScript.',
          meineRolle:
            'Gruppenarbeit während eines überbetrieblichen Kurses (ÜK). Ich war für die Kartenmarker, die Timer-Benachrichtigung, das Menü-UX, die Verlaufsanzeige sowie die Erstellung der Teilen-Nachricht zuständig.',
          wasGelernt:
            'Arbeiten mit Gerätefunktionen (GPS-Standort, Kamera/Galerie) in React Native sowie lokale Datenspeicherung mit AsyncStorage.',
        },
      },
      6: {
        title: 'URL Shortener',
        category: 'schule',
        description: 'Projekt mit Fokus auf Codequalität, Git-Workflows, Pipelines und GitOps.',
        abstract: {
          ziel: 'Kein klassisches URL-Shortener-Projekt im engeren Sinn, sondern ein Übungsfeld für professionelle Infrastruktur (GitOps, Kubernetes und CI/CD) rund um eine einfache Anwendung.',
          technologien:
            'NestJS (zwei Microservices "Shorty" & "Keeper"), MariaDB, Docker, Kubernetes, GitLab CI, ArgoCD, Kustomize.',
          meineRolle:
            'Einzelprojekt im Rahmen eines überbetrieblichen Kurses (ÜK). Der URL Shortener selbst war bereits vorgegeben, dort musste ich nur ein paar Fehler suchen und beheben. Der eigentliche Fokus des ÜK lag auf der Infrastruktur drumherum, GitOps, Kubernetes und CI/CD, die ich komplett selbst aufgebaut habe.',
          wasGelernt:
            'Aufbau eines GitOps-Workflows mit getrennten Code-/Manifest-Repos, CI/CD-Pipelines und automatisiertem Kubernetes-Deployment über ArgoCD.',
        },
      },
      7: {
        title: 'Unendliches Tic-Tac-Toe',
        category: 'schule',
        description:
          'Eine erweiterte Version des klassischen Tic-Tac-Toe-Spiels, entstanden im Fach Praxistraining: Statt normal zu enden, verschwinden die ältesten Spielsteine wieder, sodass eine Partie theoretisch endlos weitergehen kann.',
        abstract: {
          ziel: 'Die klassische Tic-Tac-Toe-Idee um eine unendliche Variante erweitern, bei der jeweils der älteste eigene Spielstein wieder verschwindet, sobald ein neuer gesetzt wird, sodass das Spiel nie in einem klassischen Unentschieden feststeckt.',
          technologien: 'C#, Windows Forms.',
          meineRolle:
            'Einzelprojekt im Fach Praxistraining. Konzept, Spiellogik und die komplette Umsetzung der Windows-Forms-Oberfläche lagen bei mir.',
          wasGelernt:
            'Umsetzung von Spiellogik mit eigener Zustandsverwaltung, um zu bestimmen, welcher Stein als nächstes verschwinden muss, sowie der Aufbau einer funktionierenden Desktop-Oberfläche mit Windows Forms in C#.',
        },
      },
      8: {
        title: 'Film Finder',
        category: 'privat',
        description:
          'Filmfinder ist eine moderne Filmsuche-Webanwendung, mit der Nutzer Filme durchsuchen, beliebte und aktuelle Titel entdecken sowie detaillierte Informationen wie Besetzung, Trailer und Bewertungen einsehen können. Favoriten lassen sich ohne Login lokal im Browser speichern. Die App wurde mit React, TypeScript und der TMDB-API umgesetzt und ist live auf Vercel gehostet.',
        abstract: {
          ziel: 'Eine moderne, responsive Filmsuche entwickeln, mit der Nutzer Filme durchsuchen, entdecken und detaillierte Informationen (Besetzung, Trailer, Bewertungen) einsehen sowie Favoriten lokal speichern können.',
          technologien: 'React, TypeScript, Vite, Tailwind CSS, React Router, TMDB-API.',
          meineRolle:
            'Einzelprojekt. Konzept, Architektur und Umsetzung (Frontend, API-Anbindung, Deployment) lagen komplett bei mir.',
          wasGelernt:
            'Anbindung einer externen REST-API mit sauberer Fehlerbehandlung (fehlende Daten, Rate-Limits, ungültige Keys), Aufbau einer modularen Komponenten- und Hook-Architektur über mehrere Seiten und Routen hinweg sowie clientseitiges State-Management (Favoriten, Filter) ohne zusätzliche Libraries.',
        },
      },
      9: {
        title: 'SlapFighters',
        category: 'privat',
        description:
          '3D-Sumo-Kampfspiel in Unity: sich gegenseitig von der Plattform schubsen, mit selbst in Blender erstellten Charakteren und Animationen. Noch in Entwicklung.',
        abstract: {
          ziel: 'Ein 3D-Sumo-Kampfspiel entwickeln, bei dem zwei Charaktere sich gegenseitig treffen, um den Gegner mit jedem Treffer weiter wegzuschleudern. Ziel ist es, den Gegner von der Plattform zu kämpfen. Multiplayer-Funktion und finales Design sind noch in Arbeit.',
          technologien: 'Unity, C#, Blender (3D-Modellierung und Animation der Charaktere).',
          meineRolle:
            'Einzelprojekt. Konzept, Spiellogik sowie Modellierung und Animation der 3D-Charaktere in Blender lagen komplett bei mir.',
          wasGelernt:
            'Mein allererstes 3D-Spiel und allererstes selbst erstelltes 3D-Objekt: Einstieg in Unity-Spielphysik (Treffer-Impulse, Rauswurf von der Plattform) sowie Grundlagen von 3D-Modellierung und Charakteranimation in Blender.',
        },
      },
      10: {
        title: 'Tunehead',
        category: 'privat',
        description:
          'Webbasiertes Stimmgerät für Gitarre und Bass mit Live-Tonhöhenerkennung über das Mikrofon, frei konfigurierbaren Stimmungen und Metronom. Die Pitch-Detection läuft komplett im Browser über die Web Audio API, Login und gespeicherte Stimmungen laufen über Supabase.',
        abstract: {
          ziel: 'Ein präzises, browserbasiertes Stimmgerät für Gitarre und Bass entwickeln, das Töne live über das Mikrofon erkennt, beliebige Stimmungen unterstützt (inkl. Presets wie Drop D oder DADGAD) und eigene Stimmungen zu einem Konto speichern kann.',
          technologien:
            'React, Vite, Web Audio API (eigene YIN-Pitch-Detection-Implementierung), Supabase (Auth, Postgres mit Row Level Security), CSS Modules.',
          meineRolle:
            'Einzelprojekt. Konzept, Audio-Signalverarbeitung, Frontend sowie Backend-Anbindung lagen komplett bei mir.',
          wasGelernt:
            'Implementierung eines Pitch-Detection-Algorithmus (YIN) von Grund auf statt einer fertigen Library, inklusive Umgang mit typischen Problemen bei echtem Audio-Input wie Oktavfehlern bei tiefen Saiten und Hintergrundrauschen. Ausserdem Aufbau einer sicheren Multi-User-Datenbank mit Row-Level-Security in Supabase, sodass Nutzer:innen ausschliesslich auf ihre eigenen Daten zugreifen können.',
        },
      },
      11: {
        title: 'ProfileAuth',
        category: 'privat',
        description:
          'Zentrales Konto-System für alle miguel-cabanero.ch-Webseiten: eine Anmeldung, die per geteiltem Cookie über alle Subdomains hinweg funktioniert. Profilverwaltung (Username, Avatar, E-Mail, Passwort, Kontolöschung) läuft ausschliesslich hier, andere Apps wie Tunehead lesen nur noch Username und Avatar und leiten für den Login hierher um.',
        abstract: {
          ziel: 'Ein einziges Konto-System aufbauen, das von allen eigenen Webseiten unter *.miguel-cabanero.ch gemeinsam genutzt wird: zentrale Anmeldung/Registrierung, Profilverwaltung (Username, Avatar-Upload, E-Mail- und Passwort-Änderung, Kontolöschung) sowie eine über alle Subdomains geteilte Login-Session, statt für jede Webseite ein eigenes Konto zu brauchen.',
          technologien:
            'React, Vite, Supabase (Auth, Postgres mit Row Level Security, Storage für Avatare), CSS Modules, cookie-basiertes Session-Sharing über Subdomains hinweg (Domain=.miguel-cabanero.ch), Vercel.',
          meineRolle:
            'Einzelprojekt. Konzept (inkl. Architektur-Dokumentation für Session-Sharing und Redirect-Flow), Frontend, Datenbankschema/RLS-Policies sowie die Migration von Tunehead auf das neue geteilte System lagen komplett bei mir.',
          wasGelernt:
            'Aufbau eines cookie-basierten Session-Sharings über mehrere Subdomains hinweg statt des Standard-localStorage, inklusive Absicherung des Redirect-Flows gegen Open-Redirect-Angriffe. Ausserdem die nachträgliche Migration einer bereits laufenden Webseite (Tunehead) auf ein neues, geteiltes Auth-System, ohne bestehende Funktionen zu brechen.',
        },
      },
    },
  },

  en: {
    title: 'Projects',
    intro:
      'Selected school and personal projects. Tap/hover a card for details, click to view the project abstract directly on this page.',
    categories: { schule: 'School', privat: 'Personal' },
    viewProject: 'View project',
    githubRepo: 'GitHub Repo',
    liveSite: 'Live Site',
    abstractHeading: 'Project Abstract',
    fields: {
      ziel: 'Goal',
      technologien: 'Technologies',
      meineRolle: 'My Role',
      wasGelernt: 'What I Learned',
    },
    close: 'Close',
    projects: {
      1: {
        title: 'My First Website',
        category: 'schule',
        description:
          'My very first website, created in the Praxistraining course to gain practical experience: a simple site built with HTML, CSS and JavaScript that reflects me as a person.',
        abstract: {
          ziel: 'As part of the Praxistraining course, build my first ever multi-page website about myself, with a home page, profile, hobbies, interests and contact page.',
          technologien: 'HTML, CSS (no framework, no backend).',
          meineRolle: 'Solo project. Concept, structure, content and implementation were entirely my own.',
          wasGelernt:
            'My very first contact with web development: the basics of HTML structure, CSS styling and building multiple linked pages.',
        },
      },
      2: {
        title: 'Manchester United Website',
        category: 'schule',
        description:
          'A static Manchester United fan website focused on UI/UX. Plain HTML/CSS/JavaScript with no framework, built as a school project and hosted live on Vercel.',
        abstract: {
          ziel: 'Design a modern, static fan website for Manchester United with a focus on UI/UX, including team, store, news and contact pages.',
          technologien:
            'Plain HTML (multiple linked pages: index.html, team.html, news.html, store.html, contact.html), a shared styles.css, vanilla JavaScript inline in <script> tags, compressed video and image files, hosting on Vercel. No framework, no build tool.',
          meineRolle:
            'Solo project. Concept, UI/UX design, implementation and integration/optimization of media assets were entirely my own.',
          wasGelernt:
            'Building a multi-page website with plain HTML/CSS/JavaScript without a framework, focusing on UI/UX design, and embedding, compressing and organizing video and image files for a performant, statically hosted website.',
        },
      },
      3: {
        title: 'HotelsoftSolutions',
        category: 'schule',
        description:
          '.NET MAUI application for hotel staff: creating reservations, assigning rooms and digitizing other hotel management processes.',
        abstract: {
          ziel: 'An application for hotel staff that allows creating reservations, assigning rooms and handling other organizational processes digitally.',
          technologien: '.NET MAUI, C#.',
          meineRolle: 'Solo project for the Windows Application module. I built the entire application myself.',
          wasGelernt:
            'My first experience with .NET MAUI: the whole framework was completely new to me.',
        },
      },
      4: {
        title: 'BookLoan',
        category: 'schule',
        description:
          'Web project from a project week for the simulated company "Planary", built with React: a platform for managing book loans.',
        abstract: {
          ziel: 'Develop a web application for library management, including management of libraries, books and loans, user registration, a multilingual interface and dark mode.',
          technologien:
            'React 19, TypeScript, Vite (frontend); NestJS, Prisma, MySQL (backend); JWT authentication, Docker.',
          meineRolle:
            'Group project of three for the LBV 294 module for the simulated company "Planary". I was involved in the concept as well as frontend and backend implementation.',
          wasGelernt:
            'Working as a team on a full-stack project, working with Prisma and MySQL on the backend, and using Docker for deployment.',
        },
      },
      5: {
        title: 'CarPin',
        category: 'schule',
        description:
          'Mobile app for saving and managing parking spots, created during an inter-company course (ÜK) as a group project, built with React Native.',
        abstract: {
          ziel: 'A mobile app that lets you save your parking location, attach a photo and timer, and find your way back via a maps app.',
          technologien: 'React Native, Expo, TypeScript.',
          meineRolle:
            'Group project during an inter-company course (ÜK). I was responsible for the map markers, timer notification, menu UX, history view, and building the share message feature.',
          wasGelernt:
            'Working with device features (GPS location, camera/gallery) in React Native, as well as local data storage with AsyncStorage.',
        },
      },
      6: {
        title: 'URL Shortener',
        category: 'schule',
        description: 'Project focused on code quality, Git workflows, pipelines and GitOps.',
        abstract: {
          ziel: 'Not a classic URL shortener project in the strict sense, but rather a practice ground for professional infrastructure (GitOps, Kubernetes and CI/CD) built around a simple application.',
          technologien:
            'NestJS (two microservices, "Shorty" & "Keeper"), MariaDB, Docker, Kubernetes, GitLab CI, ArgoCD, Kustomize.',
          meineRolle:
            'Solo project as part of an inter-company course (ÜK). The URL shortener application itself was already provided; I only had to find and fix a few bugs there. The actual focus of the ÜK was the surrounding infrastructure, GitOps, Kubernetes and CI/CD, which I built entirely myself.',
          wasGelernt:
            'Setting up a GitOps workflow with separate code/manifest repos, CI/CD pipelines, and automated Kubernetes deployment via ArgoCD.',
        },
      },
      7: {
        title: 'Infinite Tic-Tac-Toe',
        category: 'schule',
        description:
          'An extended version of classic tic-tac-toe, created in the Praxistraining course: instead of the game just ending, the oldest pieces disappear again, so a match can theoretically go on forever.',
        abstract: {
          ziel: 'Extend the classic tic-tac-toe idea into an infinite variant, where your own oldest piece disappears again as soon as you place a new one, so the game never gets stuck in a classic draw.',
          technologien: 'C#, Windows Forms.',
          meineRolle:
            'Solo project for the Praxistraining course. Concept, game logic and the entire Windows Forms interface were built by me.',
          wasGelernt:
            'Implementing game logic with my own state management to determine which piece needs to disappear next, as well as building a working desktop interface with Windows Forms in C#.',
        },
      },
      8: {
        title: 'Film Finder',
        category: 'privat',
        description:
          'Film Finder is a modern movie search web app that lets users browse movies, discover popular and trending titles, and view detailed information such as cast, trailers and ratings. Favorites can be saved locally in the browser without any login. Built with React, TypeScript and the TMDB API, and hosted live on Vercel.',
        abstract: {
          ziel: 'Build a modern, responsive movie search app that lets users browse and discover movies, view detailed information (cast, trailers, ratings), and save favorites locally.',
          technologien: 'React, TypeScript, Vite, Tailwind CSS, React Router, TMDB API.',
          meineRolle:
            'Solo project. Concept, architecture and implementation (frontend, API integration, deployment) were entirely my own.',
          wasGelernt:
            'Integrating an external REST API with clean error handling (missing data, rate limits, invalid keys), building a modular component and hook architecture across multiple pages and routes, and client-side state management (favorites, filters) without additional libraries.',
        },
      },
      9: {
        title: 'SlapFighters',
        category: 'privat',
        description:
          'A 3D sumo fighting game built in Unity: knock each other off the platform, with characters and animations self-made in Blender. Still in development.',
        abstract: {
          ziel: 'Build a 3D sumo fighting game where two characters hit each other, each hit knocking the opponent further away. The goal is to knock the opponent off the platform. Multiplayer and final visual design are still in progress.',
          technologien: 'Unity, C#, Blender (3D modeling and animation of the characters).',
          meineRolle:
            'Solo project. Concept, game logic, and modeling/animating the 3D characters in Blender were entirely my own.',
          wasGelernt:
            'My very first 3D game and very first self-made 3D object: getting started with Unity game physics (hit impulses, knocking players off the platform) as well as the basics of 3D modeling and character animation in Blender.',
        },
      },
      10: {
        title: 'Tunehead',
        category: 'privat',
        description:
          'Web-based tuner for guitar and bass with live pitch detection via the microphone, freely configurable tunings and a metronome. Pitch detection runs entirely in the browser via the Web Audio API; login and saved tunings run on Supabase.',
        abstract: {
          ziel: 'Build a precise, browser-based tuner for guitar and bass that detects notes live via the microphone, supports arbitrary tunings (including presets like Drop D or DADGAD), and can save custom tunings to an account.',
          technologien:
            'React, Vite, Web Audio API (custom YIN pitch-detection implementation), Supabase (Auth, Postgres with Row Level Security), CSS Modules.',
          meineRolle:
            'Solo project. Concept, audio signal processing, frontend and backend integration were entirely my own.',
          wasGelernt:
            'Implementing a pitch-detection algorithm (YIN) from scratch instead of using an off-the-shelf library, including handling real-world audio issues like octave errors on low strings and background noise. Also building a secure multi-user database with Row Level Security in Supabase, so users can only ever access their own data.',
        },
      },
      11: {
        title: 'ProfileAuth',
        category: 'privat',
        description:
          'Central account system for all miguel-cabanero.ch websites: a login that works across every subdomain via a shared cookie. Profile management (username, avatar, email, password, account deletion) lives exclusively here — other apps like Tunehead only read the username and avatar and redirect here for login.',
        abstract: {
          ziel: 'Build a single account system shared by all my own websites under *.miguel-cabanero.ch: central login/signup, profile management (username, avatar upload, email/password changes, account deletion), and a login session shared across every subdomain, instead of needing a separate account per website.',
          technologien:
            'React, Vite, Supabase (Auth, Postgres with Row Level Security, Storage for avatars), CSS Modules, cookie-based session sharing across subdomains (Domain=.miguel-cabanero.ch), Vercel.',
          meineRolle:
            'Solo project. Concept (including architecture documentation for session sharing and the redirect flow), frontend, database schema/RLS policies, and migrating Tunehead onto the new shared system were entirely my own.',
          wasGelernt:
            'Building cookie-based session sharing across multiple subdomains instead of default localStorage, including securing the redirect flow against open-redirect attacks. Also migrating an already-live website (Tunehead) onto a new shared auth system without breaking existing functionality.',
        },
      },
    },
  },

  fr: {
    title: 'Projets',
    intro:
      'Une sélection de projets scolaires et personnels. Survolez une carte pour un aperçu, cliquez pour afficher le résumé du projet directement sur cette page.',
    categories: { schule: 'École', privat: 'Personnel' },
    viewProject: 'Voir le projet',
    githubRepo: 'GitHub Repo',
    liveSite: 'Site en direct',
    abstractHeading: 'Résumé du projet',
    fields: {
      ziel: 'Objectif',
      technologien: 'Technologies',
      meineRolle: 'Mon rôle',
      wasGelernt: "Ce que j'ai appris",
    },
    close: 'Fermer',
    projects: {
      1: {
        title: 'Mon premier site web',
        category: 'schule',
        description:
          "Mon tout premier site web, créé dans le cadre du cours Praxistraining pour acquérir de l'expérience pratique : un site simple en HTML, CSS et JavaScript qui me représente en tant que personne.",
        abstract: {
          ziel: "Dans le cadre du cours Praxistraining, créer mon tout premier site web personnel à plusieurs pages, avec page d'accueil, profil, loisirs, centres d'intérêt et contact.",
          technologien: 'HTML, CSS (sans framework, sans backend).',
          meineRolle: 'Projet individuel. Concept, structure, contenu et réalisation étaient entièrement de mon ressort.',
          wasGelernt:
            'Mon tout premier contact avec le développement web : les bases de la structure HTML, du style CSS et de la construction de plusieurs pages reliées entre elles.',
        },
      },
      2: {
        title: 'Site Manchester United',
        category: 'schule',
        description:
          "Site de fans statique pour Manchester United axé sur l'UI/UX. HTML/CSS/JavaScript pur sans framework, réalisé dans le cadre d'un projet scolaire et hébergé en direct sur Vercel.",
        abstract: {
          ziel: "Concevoir un site de fans statique et moderne pour Manchester United avec un accent sur l'UI/UX, avec pages équipe, boutique, actualités et contact.",
          technologien:
            "HTML pur (plusieurs pages reliées : index.html, team.html, news.html, store.html, contact.html), un fichier styles.css commun, JavaScript vanilla intégré dans des balises <script>, fichiers vidéo et images compressés, hébergement sur Vercel. Sans framework, sans outil de build.",
          meineRolle:
            "Projet individuel. Concept, design UI/UX, réalisation ainsi qu'intégration et optimisation des ressources multimédias étaient entièrement de mon ressort.",
          wasGelernt:
            "Construction d'un site multi-pages en HTML/CSS/JavaScript pur sans framework, accent mis sur le design UI/UX, ainsi qu'intégration, compression et organisation de fichiers vidéo et images pour un site performant hébergé statiquement.",
        },
      },
      3: {
        title: 'HotelsoftSolutions',
        category: 'schule',
        description:
          "Application .NET MAUI destinée au personnel hôtelier : création de réservations, attribution des chambres et numérisation d'autres processus de gestion hôtelière.",
        abstract: {
          ziel: "Une application pour le personnel hôtelier permettant de créer des réservations, d'attribuer des chambres et de gérer numériquement d'autres processus organisationnels.",
          technologien: '.NET MAUI, C#.',
          meineRolle:
            "Projet individuel dans le cadre du module Windows Application. J'ai réalisé l'application entièrement moi-même.",
          wasGelernt:
            "Ma première expérience avec .NET MAUI : tout ce framework était complètement nouveau pour moi.",
        },
      },
      4: {
        title: 'BookLoan',
        category: 'schule',
        description:
          "Projet web réalisé lors d'une semaine de projet pour l'entreprise fictive « Planary », développé avec React : une plateforme de gestion des prêts de livres.",
        abstract: {
          ziel: "Développer une application web de gestion de bibliothèque, avec gestion des bibliothèques, des livres et des prêts, inscription des utilisateurs, interface multilingue et mode sombre.",
          technologien:
            'React 19, TypeScript, Vite (frontend) ; NestJS, Prisma, MySQL (backend) ; authentification JWT, Docker.',
          meineRolle:
            "Projet de groupe à trois dans le cadre du module LBV 294 pour l'entreprise fictive « Planary ». J'ai participé à la conception ainsi qu'à la réalisation du frontend et du backend.",
          wasGelernt:
            "Travail d'équipe sur un projet full-stack, utilisation de Prisma et MySQL côté backend, ainsi qu'utilisation de Docker pour le déploiement.",
        },
      },
      5: {
        title: 'CarPin',
        category: 'schule',
        description:
          "Application mobile pour enregistrer et gérer des places de parking, réalisée lors d'un cours interentreprises (ÜK) en groupe, développée avec React Native.",
        abstract: {
          ziel: "Une application mobile permettant d'enregistrer l'emplacement de sa place de parking, d'y ajouter une photo et une minuterie, et de retrouver le chemin du retour via une application de cartes.",
          technologien: 'React Native, Expo, TypeScript.',
          meineRolle:
            "Travail de groupe réalisé lors d'un cours interentreprises (ÜK). J'étais responsable des marqueurs sur la carte, de la notification du minuteur, de l'UX du menu, de l'affichage de l'historique ainsi que de la création du message de partage.",
          wasGelernt:
            "Utilisation des fonctionnalités de l'appareil (géolocalisation GPS, appareil photo/galerie) avec React Native, ainsi que stockage local des données avec AsyncStorage.",
        },
      },
      6: {
        title: 'URL Shortener',
        category: 'schule',
        description: 'Projet axé sur la qualité du code, les workflows Git, les pipelines et le GitOps.',
        abstract: {
          ziel: "Pas un projet classique de raccourcisseur d'URL à proprement parler, mais plutôt un terrain d'entraînement pour une infrastructure professionnelle (GitOps, Kubernetes et CI/CD) autour d'une application simple.",
          technologien:
            'NestJS (deux microservices « Shorty » et « Keeper »), MariaDB, Docker, Kubernetes, GitLab CI, ArgoCD, Kustomize.',
          meineRolle:
            "Projet individuel réalisé dans le cadre d'un cours interentreprises (ÜK). Le raccourcisseur d'URL en lui-même était déjà fourni ; je n'ai eu qu'à chercher et corriger quelques bugs. L'objectif principal de l'ÜK portait sur l'infrastructure autour, GitOps, Kubernetes et CI/CD, que j'ai entièrement mise en place moi-même.",
          wasGelernt:
            'Mise en place d\'un workflow GitOps avec dépôts séparés pour le code et les manifestes, pipelines CI/CD et déploiement Kubernetes automatisé via ArgoCD.',
        },
      },
      7: {
        title: 'Morpion infini',
        category: 'schule',
        description:
          "Une version étendue du morpion classique, réalisée dans le cadre du cours Praxistraining : au lieu de simplement se terminer, les pions les plus anciens disparaissent à nouveau, si bien qu'une partie peut théoriquement continuer indéfiniment.",
        abstract: {
          ziel: "Étendre le concept classique du morpion à une variante infinie, où son propre pion le plus ancien disparaît dès qu'un nouveau est posé, afin que la partie ne se bloque jamais sur un match nul classique.",
          technologien: 'C#, Windows Forms.',
          meineRolle:
            "Projet individuel réalisé dans le cadre du cours Praxistraining. Le concept, la logique de jeu et toute l'interface Windows Forms ont été réalisés par moi.",
          wasGelernt:
            "Mise en œuvre de la logique de jeu avec ma propre gestion d'état pour déterminer quel pion doit disparaître ensuite, ainsi que la construction d'une interface de bureau fonctionnelle avec Windows Forms en C#.",
        },
      },
      8: {
        title: 'Film Finder',
        category: 'privat',
        description:
          "Film Finder est une application web moderne de recherche de films qui permet aux utilisateurs de parcourir des films, de découvrir les titres populaires et tendances, et de consulter des informations détaillées telles que le casting, les bandes-annonces et les évaluations. Les favoris peuvent être enregistrés localement dans le navigateur, sans connexion. L'application a été développée avec React, TypeScript et l'API TMDB, et est hébergée en direct sur Vercel.",
        abstract: {
          ziel: "Développer une application de recherche de films moderne et responsive permettant aux utilisateurs de parcourir et découvrir des films, de consulter des informations détaillées (casting, bandes-annonces, évaluations) et d'enregistrer des favoris localement.",
          technologien: 'React, TypeScript, Vite, Tailwind CSS, React Router, API TMDB.',
          meineRolle:
            "Projet individuel. Le concept, l'architecture et la réalisation (frontend, intégration de l'API, déploiement) étaient entièrement de mon ressort.",
          wasGelernt:
            "Intégration d'une API REST externe avec une gestion d'erreurs propre (données manquantes, limites de requêtes, clés invalides), mise en place d'une architecture modulaire de composants et de hooks sur plusieurs pages et routes, ainsi que gestion d'état côté client (favoris, filtres) sans bibliothèques supplémentaires.",
        },
      },
      9: {
        title: 'SlapFighters',
        category: 'privat',
        description:
          'Un jeu de combat de sumo en 3D réalisé avec Unity : se pousser mutuellement hors de la plateforme, avec des personnages et animations créés soi-même dans Blender. Encore en développement.',
        abstract: {
          ziel: "Développer un jeu de combat de sumo en 3D où deux personnages se frappent, chaque coup propulsant l'adversaire plus loin. Le but est de faire tomber l'adversaire de la plateforme. Le mode multijoueur et le design final sont encore en cours.",
          technologien: 'Unity, C#, Blender (modélisation 3D et animation des personnages).',
          meineRolle:
            "Projet individuel. Le concept, la logique de jeu ainsi que la modélisation et l'animation des personnages 3D dans Blender étaient entièrement de mon ressort.",
          wasGelernt:
            "Mon tout premier jeu 3D et mon tout premier objet 3D créé moi-même : découverte de la physique de jeu Unity (impulsions lors des coups, éjection de la plateforme) ainsi que les bases de la modélisation 3D et de l'animation de personnages dans Blender.",
        },
      },
      10: {
        title: 'Tunehead',
        category: 'privat',
        description:
          "Accordeur web pour guitare et basse avec détection de la hauteur en direct via le microphone, accordages librement configurables et métronome intégré. La détection de hauteur tourne entièrement dans le navigateur via la Web Audio API ; la connexion et les accordages enregistrés fonctionnent avec Supabase.",
        abstract: {
          ziel: "Développer un accordeur web précis pour guitare et basse qui détecte les notes en direct via le microphone, prend en charge des accordages arbitraires (avec des préréglages comme Drop D ou DADGAD) et permet d'enregistrer des accordages personnalisés sur un compte.",
          technologien:
            'React, Vite, Web Audio API (implémentation YIN de détection de hauteur réalisée moi-même), Supabase (Auth, Postgres avec Row Level Security), CSS Modules.',
          meineRolle:
            'Projet individuel. Le concept, le traitement du signal audio, le frontend ainsi que l\'intégration du backend étaient entièrement de mon ressort.',
          wasGelernt:
            "Implémentation d'un algorithme de détection de hauteur (YIN) entièrement par moi-même plutôt qu'avec une bibliothèque toute faite, y compris la gestion de problèmes réels comme les erreurs d'octave sur les cordes graves et le bruit de fond. Également mise en place d'une base de données multi-utilisateurs sécurisée avec Row Level Security dans Supabase, afin que chaque utilisateur·rice n'accède qu'à ses propres données.",
        },
      },
      11: {
        title: 'ProfileAuth',
        category: 'privat',
        description:
          "Système de compte central pour tous les sites miguel-cabanero.ch : une connexion qui fonctionne sur tous les sous-domaines grâce à un cookie partagé. La gestion du profil (nom d'utilisateur, avatar, e-mail, mot de passe, suppression du compte) se fait exclusivement ici — d'autres applications comme Tunehead ne font que lire le nom d'utilisateur et l'avatar et redirigent ici pour la connexion.",
        abstract: {
          ziel: "Construire un système de compte unique partagé par tous mes propres sites sous *.miguel-cabanero.ch : connexion/inscription centralisée, gestion du profil (nom d'utilisateur, upload d'avatar, changement d'e-mail/mot de passe, suppression du compte), ainsi qu'une session de connexion partagée sur tous les sous-domaines, au lieu d'avoir besoin d'un compte séparé par site.",
          technologien:
            'React, Vite, Supabase (Auth, Postgres avec Row Level Security, Storage pour les avatars), CSS Modules, partage de session basé sur des cookies entre sous-domaines (Domain=.miguel-cabanero.ch), Vercel.',
          meineRolle:
            "Projet individuel. Le concept (y compris la documentation d'architecture pour le partage de session et le flux de redirection), le frontend, le schéma de base de données/politiques RLS, ainsi que la migration de Tunehead vers le nouveau système partagé étaient entièrement de mon ressort.",
          wasGelernt:
            "Mise en place d'un partage de session basé sur des cookies entre plusieurs sous-domaines au lieu du localStorage par défaut, y compris la sécurisation du flux de redirection contre les attaques par redirection ouverte (open redirect). Également la migration d'un site déjà en ligne (Tunehead) vers un nouveau système d'authentification partagé, sans casser les fonctionnalités existantes.",
        },
      },
    },
  },
}
