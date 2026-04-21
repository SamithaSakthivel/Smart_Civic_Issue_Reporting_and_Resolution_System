import '../Home.css';
import { useLanguage } from '../contexts/LanguageContext';  
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [navTexts, setNavTexts] = useState({
    MyApp: 'MyApp',
    Explore: 'Explore',
    Queries: 'Queries?'
  });

  useEffect(() => {
    const loadTexts = async () => {
      const texts = {
        MyApp: await t('MyApp'),
        Explore: await t('Explore'),
        Queries: await t('Queries?')
      };
      setNavTexts(texts);
    };
    
    loadTexts();
  }, [language, t]);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  // ✅ Smooth scroll to the queries section at the bottom of the page
  const handleQueriesClick = () => {
    const section = document.getElementById('queries-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="nav-bar">
      <span className="nav-left">{navTexts.MyApp}</span>
      <section className="nav-right">
        <button className="nav-link">{navTexts.Explore}</button>
        {/* ✅ Queries button now scrolls smoothly to the contact section */}
        <button className="nav-link queries-nav-btn" onClick={handleQueriesClick}>
          {navTexts.Queries}
        </button>
        <div className="language-switcher">
          <button className="globe-btn" title="Language">🌐</button>
          <div className="language-dropdown">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`lang-btn ${language === lang.code ? 'lang-active' : ''}`}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </nav>
  );
};

export default Navbar;
