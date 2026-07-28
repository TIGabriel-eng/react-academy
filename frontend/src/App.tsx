import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService } from './services/auth';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AmbientePage } from './pages/AmbientePage';
import { LoginPage } from './pages/LoginPage';
import { MeusCursosPage } from './pages/MeusCursosPage';
import { EventosPage } from './pages/EventosPage';
import { ContinuarAssistindoPage } from './pages/ContinuarAssistindoPage';
import { CursosConcluidosPage } from './pages/CursosConcluidosPage';
import { TrilhasPage } from './pages/TrilhasPage';
import { CursoPage } from './pages/CursoPage';
import { SuportePage } from './pages/SuportePage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { MeuPerfilPage } from './pages/MeuPerfilPage';
import { CertificadosPage } from './pages/CertificadosPage';
import { NotificacoesPage } from './pages/NotificacoesPage';
import { VideoAreaPage } from './pages/VideoAreaPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = AuthService.isLoggedIn();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/video-area/:cursoSlug" element={
          <ProtectedRoute>
            <VideoAreaPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="team" element={<HomePage />} />
          <Route path="business" element={<HomePage />} />
          <Route path="meus-cursos" element={<MeusCursosPage />} />
          <Route path="eventos" element={<EventosPage />} />
          <Route path="continuar-assistindo" element={<ContinuarAssistindoPage />} />
          <Route path="cursos-concluidos" element={<CursosConcluidosPage />} />
          <Route path="trilhas" element={<TrilhasPage />} />
          <Route path="curso/:slug" element={<CursoPage />} />
          <Route path="suporte" element={<SuportePage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="meu-perfil" element={<MeuPerfilPage />} />
          <Route path="certificados" element={<CertificadosPage />} />
          <Route path="notificacoes" element={<NotificacoesPage />} />
          <Route path="time" element={<AmbientePage />} />
          <Route path="orcomakers" element={<AmbientePage />} />
          <Route path="contabil" element={<AmbientePage />} />
          <Route path="empresarial" element={<AmbientePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}