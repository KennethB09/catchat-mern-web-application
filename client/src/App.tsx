import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Context
import { useAuthContext } from './context/AuthContext';
import { ConversationProvider } from './context/ConversationContext';
import { ThemeProvider } from "@/components/theme-provider"

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';

function App() {

  const { user } = useAuthContext();

  return (
    <section className="App">
      <BrowserRouter>
        <div className="Pages">
          <Routes>
            <Route
              path="/"
              element={
                user ?
                  <ThemeProvider>
                    <ConversationProvider>
                      <Home />
                    </ConversationProvider>
                  </ThemeProvider>
                  :
                  <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </section>
  )
}

export default App
