import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "New Case": "New Case",
      "My Cases": "My Cases",
      "Help": "Help",
      "Settings": "Settings",
      "Admin": "Admin",
      "Logout": "Logout",
      "Connect DigiLocker": "Connect DigiLocker",
      "Verified": "Verified",
      
      "Welcome back": "Welcome back",
      "Your legal dashboard at a glance": "Your legal dashboard at a glance",
      "File New Case": "File New Case",
      "Total Cases": "Total Cases",
      "Active": "Active",
      "Filed": "Filed",
      "Nudges Sent": "Nudges Sent",
      "Get Started with Nyaya-Setu": "Get Started with Nyaya-Setu",
      "Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.": "Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.",
      "Start Initial Assessment": "Start Initial Assessment",
      "Recent Filings": "Recent Filings",
      "View All Vault": "View All Vault",
      "Identified Sections": "Identified Sections",
      "Scanning in progress": "Scanning in progress",
      
      "Your AI Legal Assistant has synced your cases. You have": "Your AI Legal Assistant has synced your cases. You have",
      "active": "active",
      "drafts awaiting action.": "drafts awaiting action.",
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "New Case": "नया मामला",
      "My Cases": "मेरे मामले",
      "Help": "सहायता",
      "Settings": "सेटिंग्स",
      "Admin": "व्यवस्थापक",
      "Logout": "लॉग आउट",
      "Connect DigiLocker": "डिजीलॉकर से जुड़ें",
      "Verified": "सत्यापित",
      
      "Welcome back": "वापसी पर स्वागत है",
      "Your legal dashboard at a glance": "एक नज़र में आपका कानूनी डैशबोर्ड",
      "File New Case": "नया मामला दर्ज करें",
      "Total Cases": "कुल मामले",
      "Active": "सक्रिय",
      "Filed": "दायर",
      "Nudges Sent": "भेजे गए संकेत",
      "Get Started with Nyaya-Setu": "न्याय-सेतु के साथ शुरुआत करें",
      "Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.": "आपका AI कानूनी सहायक आपकी पेशेवर FIR का मसौदा तैयार करने में मदद करने के लिए तैयार है।",
      "Start Initial Assessment": "प्रारंभिक मूल्यांकन शुरू करें",
      "Recent Filings": "हाल ही की फाइलिंग",
      "View All Vault": "सभी वॉल्ट देखें",
      "Identified Sections": "पहचाने गए अनुभाग",
      "Scanning in progress": "स्कैनिंग प्रगति पर है",
      
      "Your AI Legal Assistant has synced your cases. You have": "आपके AI कानूनी सहायक ने आपके मामलों को सिंक कर दिया है। आपके पास",
      "active": "सक्रिय",
      "drafts awaiting action.": "ड्राफ्ट कार्रवाई की प्रतीक्षा कर रहे हैं।",
    }
  },
  ta: {
    translation: {
      "Dashboard": "விவரப்பலகை",
      "New Case": "புதிய வழக்கு",
      "My Cases": "என் வழக்குகள்",
      "Help": "உதவி",
      "Settings": "அமைப்புகள்",
      "Admin": "நிர்வாகம்",
      "Logout": "வெளியேறு",
      "Connect DigiLocker": "DigiLocker ஐ இணைக்க",
      "Verified": "சரிபார்க்கப்பட்டது",
      
      "Welcome back": "மீண்டும் வருக",
      "Your legal dashboard at a glance": "உங்கள் சட்ட விவரப்பலகை ஒரு பார்வையில்",
      "File New Case": "புதிய வழக்கை தாக்கல் செய்க",
      "Total Cases": "மொத்த வழக்குகள்",
      "Active": "செயலில்",
      "Filed": "தாக்கல்",
      "Nudges Sent": "நினைவூட்டல்கள் அனுப்பப்பட்டன",
      "Get Started with Nyaya-Setu": "Nyaya-Setu உடன் தொடங்கவும்",
      "Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.": "தொழில்முறை FIR தயாரிப்பதற்கு உங்கள் ஏஐ சட்ட உதவியாளர் தயாராக இருக்கிறார்.",
      "Start Initial Assessment": "ஆரம்ப மதிப்பீட்டைத் தொடங்குங்கள்",
      "Recent Filings": "சமீபத்திய தாக்கல்கள்",
      "View All Vault": "அனைத்தையும் காண்க",
      "Identified Sections": "கண்டறியப்பட்ட பிரிவுகள்",
      "Scanning in progress": "ஸ்கேனிங் செயலில் உள்ளது",
      
      "Your AI Legal Assistant has synced your cases. You have": "உங்கள் AI சட்ட உதவியாளர் உங்கள் வழக்குகளை ஒத்திசைத்துள்ளார். உங்களிடம்",
      "active": "செயலில் உள்ள",
      "drafts awaiting action.": "வரைவுகள் நடவடிக்கைக்காக காத்திருக்கின்றன.",
    }
  },
  kn: {
    translation: {
      "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "New Case": "ಹೊಸ ಪ್ರಕರಣ",
      "My Cases": "ನನ್ನ ಪ್ರಕರಣಗಳು",
      "Help": "ಸಹಾಯ",
      "Settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      "Admin": "ಆಡಳಿತ",
      "Logout": "ಲಾಗ್ ಔಟ್",
      "Connect DigiLocker": "DigiLocker ಸಂಪರ್ಕಿಸಿ",
      "Verified": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
      
      "Welcome back": "ಮರಳಿ ಸ್ವಾಗತ",
      "Your legal dashboard at a glance": "ನಿಮ್ಮ ಕಾನೂನು ಡ್ಯಾಶ್ಬೋರ್ಡ್ ಒಂದು ನೋಟದಲ್ಲಿ",
      "File New Case": "ಹೊಸ ಪ್ರಕರಣ ದಾಖಲಿಸಿ",
      "Total Cases": "ಒಟ್ಟು ಪ್ರಕರಣಗಳು",
      "Active": "ಸಕ್ರಿಯ",
      "Filed": "ದಾಖಲಾಗಿದೆ",
      "Nudges Sent": "ಸೂಚನೆಗಳು ಕಳುಹಿಸಲಾಗಿದೆ",
      "Get Started with Nyaya-Setu": "ನ್ಯಾಯ-ಸೇತು ಜೊತೆ ಪ್ರಾರಂಭಿಸಿ",
      "Your AI-powered legal assistant is fully configured and ready to help you magically draft a professional FIR.": "ನಿಮ್ಮ AI ಕಾನೂನು ಸಹಾಯಕವು ನಿಮ್ಮ ವೃತ್ತಿಪರ ಎಫ್‌ಐಆರ್ ಅನ್ನು ರಚಿಸಲು ಸಿದ್ಧವಾಗಿದೆ.",
      "Start Initial Assessment": "ಆರಂಭಿಕ ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
      "Recent Filings": "ಇತ್ತೀಚಿನ ದಾಖಲಾತಿಗಳು",
      "View All Vault": "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
      "Identified Sections": "ಗುರುತಿಸಲಾದ ವಿಭಾಗಗಳು",
      "Scanning in progress": "ಸ್ಕ್ಯಾನಿಂಗ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      
      "Your AI Legal Assistant has synced your cases. You have": "ನಿಮ್ಮ AI ಕಾನೂನು ಸಹಾಯಕ ನಿಮ್ಮ ಪ್ರಕರಣಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಿದೆ. ನೀವು ಹೊಂದಿದ್ದೀರಿ",
      "active": "ಸಕ್ರಿಯ",
      "drafts awaiting action.": "ಕರಣಕ್ಕಾಗಿ ಕರಡುಗಳು ಕಾಯುತ್ತಿವೆ.",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
