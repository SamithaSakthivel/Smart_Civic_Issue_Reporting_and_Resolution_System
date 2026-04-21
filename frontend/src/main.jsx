import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Routes,BrowserRouter,Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import AuthInitializer from './components/AuthInitializer.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <Provider store={store}>
        <BrowserRouter>
         <AuthInitializer>
               <App/>
         </AuthInitializer>
         </BrowserRouter>
      </Provider>
    </LanguageProvider>
  </StrictMode>,
)
