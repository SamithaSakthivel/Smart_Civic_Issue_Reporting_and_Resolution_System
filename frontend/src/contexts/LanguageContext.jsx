import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const translateText = useCallback(async (text, targetLang) => {
    if (targetLang === 'en') return text;
    
    // ✅ Check cache FIRST
    if (translations[text]) return translations[text];
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();
      const translated = data.responseData?.translatedText || text;
      
      // ✅ CACHE result forever!
      setTranslations(prev => ({ ...prev, [text]: translated }));
      return translated;
    } catch {
      return text;
    }
  }, [translations]);

  const t = useCallback(async (text) => {
    return await translateText(text, language);
  }, [language, translateText]);

  // Pre-load common texts (optional speed boost)
  useEffect(() => {
    const commonTexts = {
      'MyApp': 'MyApp', 'CivicHub': 'CivicHub', 'Fullname': 'Fullname',
      'Report new issue': 'Report new issue', 'Login': 'Login'
    };
    
    const preload = async () => {
      const preloaded = {};
      for (const [key, text] of Object.entries(commonTexts)) {
        preloaded[key] = await translateText(text, language);
      }
      setTranslations(prev => ({ ...prev, ...preloaded }));
    };
    
    if (language !== 'en') preload();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);