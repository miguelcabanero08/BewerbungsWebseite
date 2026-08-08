// Liest eine benötigte Umgebungsvariable und wirft einen klaren Fehler, wenn sie fehlt.
//
// Anders als der alte eigenständige Express-Server (der beim Start ohne
// SESSION_SECRET/SITE_PASSWORD_HASH komplett mit process.exit(1) abbrach) gibt
// es in Vercel Functions keinen sinnvollen "Prozessstart" zum Abbrechen — jede
// Function-Invocation ist eigenständig. Stattdessen wird hier pro Aufruf
// geprüft; ein fehlender Wert wirft, Vercel fängt das ab und liefert dem
// Client ein generisches 500, während der echte Grund in den Function-Logs
// auftaucht (Vercel-Dashboard -> Project -> Logs bzw. `vercel dev`-Konsole).
export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Fehlende Umgebungsvariable ${name}. In Vercel: Project Settings -> Environment ` +
        `Variables setzen (siehe .env.example). Lokal: .env im Projekt-Root anlegen.`
    )
  }
  return value
}
