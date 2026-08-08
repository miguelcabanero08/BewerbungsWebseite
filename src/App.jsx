import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LightboxProvider } from './context/LightboxContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import PageTransition from './components/PageTransition.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import Lightbox from './components/Lightbox.jsx'

// Home bleibt eager (Landingpage, soll ohne Ladeverzögerung erscheinen).
// Die restlichen Seiten werden erst beim Aufruf nachgeladen, das hält den
// initialen Bundle klein (v.a. wichtig, da UeberMich via DepthCarousel
// zusätzlich noch gsap nachlädt).
import Home from './pages/Home.jsx'
const UeberMich = lazy(() => import('./pages/UeberMich.jsx'))
const Projekte = lazy(() => import('./pages/Projekte.jsx'))
const Dokumente = lazy(() => import('./pages/Dokumente.jsx'))
const Impressum = lazy(() => import('./pages/Impressum.jsx'))

function RouteFallback() {
  return <div className="h-64 animate-pulse rounded-2xl bg-fg/5" />
}

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LightboxProvider>
          <SmoothScroll />
          <ScrollProgress />
          <CustomCursor />
          <AnimatedBackground />
          <Navbar />
          <Lightbox />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route
                path="/ueber-mich"
                element={
                  <PageTransition>
                    <Suspense fallback={<RouteFallback />}>
                      <UeberMich />
                    </Suspense>
                  </PageTransition>
                }
              />
              <Route
                path="/projekte"
                element={
                  <PageTransition>
                    <Suspense fallback={<RouteFallback />}>
                      <Projekte />
                    </Suspense>
                  </PageTransition>
                }
              />
              <Route
                path="/dokumente"
                element={
                  <PageTransition>
                    <Suspense fallback={<RouteFallback />}>
                      <Dokumente />
                    </Suspense>
                  </PageTransition>
                }
              />
              <Route
                path="/impressum"
                element={
                  <PageTransition>
                    <Suspense fallback={<RouteFallback />}>
                      <Impressum />
                    </Suspense>
                  </PageTransition>
                }
              />
              <Route path="/lebenslauf" element={<Navigate to="/ueber-mich" replace />} />
              <Route path="/staerken" element={<Navigate to="/ueber-mich" replace />} />
              <Route path="/persoenliches" element={<Navigate to="/ueber-mich" replace />} />
            </Routes>
          </AnimatePresence>

          {!isHome && <Footer />}
          </LightboxProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
