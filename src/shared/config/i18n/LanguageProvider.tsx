import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deviceLanguage, getLanguage, isLanguage, Language, setActiveLanguage} from './i18n.config';

const STORAGE_KEY = 'agrorahunok:language';
type LanguageContextValue = {language: Language; setLanguage: (language: Language) => void};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [language, updateLanguage] = useState<Language>(getLanguage);
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      const selected = saved && isLanguage(saved) ? saved : deviceLanguage();
      if (mounted) {setActiveLanguage(selected); updateLanguage(selected);}
    }).catch(() => {
      if (mounted) {const selected = deviceLanguage(); setActiveLanguage(selected); updateLanguage(selected);}
    });
    return () => {mounted = false;};
  }, []);
  const setLanguage = (selected: Language) => {
    setActiveLanguage(selected);
    updateLanguage(selected);
    AsyncStorage.setItem(STORAGE_KEY, selected).catch(() => undefined);
  };
  return <LanguageContext.Provider value={{language, setLanguage}}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider is missing');
  return context;
}
