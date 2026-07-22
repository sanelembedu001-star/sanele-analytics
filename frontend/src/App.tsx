import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NotebookPage from './pages/NotebookPage'
import PowerBIPage from './pages/PowerBIPage'
import AIOpsDashboard from './pages/AIOpsDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/notebook" replace />} />
          <Route path="notebook" element={<NotebookPage />} />
          <Route path="dashboard" element={<PowerBIPage />} />
          <Route path="ai-ops" element={<AIOpsDashboard />} />
          <Route path="*" element={<Navigate to="/notebook" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
