import AboutApp from './AboutApp.jsx'
import ProjectsApp from './ProjectsApp.jsx'
import DocumentsApp from './DocumentsApp.jsx'
import MusicPlayer from './MusicPlayer.jsx'
import MakingOfApp from './MakingOfApp.jsx'
import { FilmsApp, BlenderApp, FellowApp, ImprintApp, BinApp } from './SmallApps.jsx'

// Zeichnet den Inhalt einer App. win.tab / onTab nur für Über mich.
export function AppContent({ id, tab, onTab }) {
  switch (id) {
    case 'about': return <AboutApp tab={tab} onTab={onTab} />
    case 'projects': return <ProjectsApp />
    case 'docs': return <DocumentsApp />
    case 'songs': return <MusicPlayer />
    case 'films': return <FilmsApp />
    case 'blender': return <BlenderApp />
    case 'fellow': return <FellowApp />
    case 'making': return <MakingOfApp />
    case 'imprint': return <ImprintApp />
    case 'bin': return <BinApp />
    default: return null
  }
}
