// Erzeugt einen bcrypt-Hash fürs Passwort, zum Einfügen in server/.env als SITE_PASSWORD_HASH.
// Aufruf: npm run hash-password -- <passwort>
import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Bitte Passwort als Argument angeben: npm run hash-password -- <passwort>')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log('\nSITE_PASSWORD_HASH=' + hash + '\n')
console.log('Diese Zeile in server/.env einfügen (bestehende SITE_PASSWORD_HASH-Zeile ersetzen).')
