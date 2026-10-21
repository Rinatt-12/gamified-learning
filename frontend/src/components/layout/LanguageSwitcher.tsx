import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  function changeLang(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => changeLang('kk')}
        className={`px-2 py-1 rounded text-sm font-medium transition ${
          i18n.language === 'kk'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        ҚАЗ
      </button>
      <button
        onClick={() => changeLang('ru')}
        className={`px-2 py-1 rounded text-sm font-medium transition ${
          i18n.language === 'ru'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        РУС
      </button>
    </div>
  );
}