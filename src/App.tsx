import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Incomes } from './pages/Incomes';
import { Budget } from './pages/Budget';
import { Months } from './pages/Months';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/months" element={<Months />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
