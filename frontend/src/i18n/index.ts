import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kk from './kk.json';
import ru from './ru.json';

i18n.use(initReactI18next).init({
  resources: {
    kk: { translation: kk },
    ru: { translation: ru },
  },
  lng: localStorage.getItem('language') || 'kk',
  fallbackLng: 'kk',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;