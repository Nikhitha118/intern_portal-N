"use client"
import { useState, useEffect } from "react"

export const STORAGE_KEY_LANG = "ip-language"

export const LANGUAGES = [
  { code: "en", label: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeName: "Français", flag: "🇫🇷" },
]

export const TRANSLATIONS = {
  en: {
    // Navigation items
    Dashboard: "Dashboard",
    Tasks: "Tasks",
    "Skill Test": "Skill Test",
    Attendance: "Attendance",
    Journals: "Journals",
    Evaluation: "Evaluation",
    Analytics: "Analytics",
    Calendar: "Calendar",
    Messages: "Messages",
    Mentor: "Mentor",
    Settings: "Settings",
    Logout: "Logout",
    "Internship Progress": "Internship Progress",
    "Days Left": "Days Left",
    Intern: "Intern",

    // Settings tabs & headers
    Profile: "Profile",
    Security: "Security",
    Notifications: "Notifications",
    Appearance: "Appearance",
    Privacy: "Privacy",
    Account: "Account",
    "Profile Settings": "Profile Settings",
    "Security Settings": "Security Settings",
    "Notification Preferences": "Notification Preferences",
    "Privacy Settings": "Privacy Settings",
    "Account Management": "Account Management",

    // Descriptions
    "Personal info & skills": "Personal info & skills",
    "Password & 2FA": "Password & 2FA",
    "Alerts & reminders": "Alerts & reminders",
    "Theme & display": "Theme & display",
    "Data & visibility": "Data & visibility",
    "Manage account": "Manage account",

    // Appearance
    Theme: "Theme",
    "Dark Mode": "Dark Mode",
    "Light Mode": "Light Mode",
    "Black & blue futuristic UI": "Black & blue futuristic UI",
    "Clean light interface": "Clean light interface",
    Language: "Interface Language",
    "Select Interface Language": "Select interface display language",
    "Theme changed to": "Theme changed to",
    "Language updated to": "Language updated to",

    // Profile Fields
    "Full Name": "Full Name",
    Email: "Email",
    Role: "Role",
    Phone: "Phone",
    Bio: "Bio",
    Skills: "Skills",
    "Change Photo": "Change Photo",
    "Save Changes": "Save Changes",
    "Saved!": "Saved successfully!",

    // Security
    "Current Password": "Current Password",
    "New Password": "New Password",
    "Confirm New Password": "Confirm New Password",
    "Two-Factor Authentication": "Two-Factor Authentication",
    "Add extra security to your account": "Add extra security to your account",
    "Update Password": "Update Password",

    // Notifications
    "Email Notifications": "Email Notifications",
    "Receive updates via email": "Receive updates via email",
    "Push Notifications": "Push Notifications",
    "Browser push notifications": "Browser push notifications",
    "Task Reminders": "Task Reminders",
    "Reminders for upcoming deadlines": "Reminders for upcoming deadlines",
    "Journal Reminders": "Journal Reminders",
    "Daily journal writing reminders": "Daily journal writing reminders",

    // Privacy & Account
    "Public Profile": "Public Profile",
    "Allow others to see your profile": "Allow others to see your profile",
    "Activity Visibility": "Activity Visibility",
    "Show your activity to mentors": "Show your activity to mentors",
    "Data Export": "Data Export",
    "Download all your data as a JSON file": "Download all your data as a JSON file",
    "Export My Data": "Export My Data",
    "Add Another Account": "Add Another Account",
    "Sign in with a different account": "Sign in with a different account",
    "Delete Account": "Delete Account",
    "Sign out from this device": "Sign out from this device",
  },
  hi: {
    // Navigation items
    Dashboard: "डैशबोर्ड",
    Tasks: "कार्य (Tasks)",
    "Skill Test": "कौशल परीक्षा",
    Attendance: "उपस्थिति",
    Journals: "दैनिक जर्नल",
    Evaluation: "मूल्यांकन",
    Analytics: "एनालिटिक्स",
    Calendar: "कैलेंडर",
    Messages: "संदेश (Chat)",
    Mentor: "मेंटर्स (Mentor)",
    Settings: "सेटिंग्स",
    Logout: "लॉग आउट",
    "Internship Progress": "इंटर्नशिप प्रगति",
    "Days Left": "दिन शेष",
    Intern: "प्रशिक्षु",

    // Settings tabs & headers
    Profile: "प्रोफ़ाइल",
    Security: "सुरक्षा",
    Notifications: "अधिसूचनाएँ",
    Appearance: "दिखावट (Appearance)",
    Privacy: "गोपनीयता",
    Account: "खाता",
    "Profile Settings": "प्रोफ़ाइल सेटिंग्स",
    "Security Settings": "सुरक्षा सेटिंग्स",
    "Notification Preferences": "अधिसूचना प्राथमिकताएँ",
    "Privacy Settings": "गोपनीयता सेटिंग्स",
    "Account Management": "खाता प्रबंधन",

    // Descriptions
    "Personal info & skills": "व्यक्तिगत जानकारी और कौशल",
    "Password & 2FA": "पासवर्ड और 2FA",
    "Alerts & reminders": "अलर्ट और अनुस्मारक",
    "Theme & display": "थीम और डिस्प्ले",
    "Data & visibility": "डेटा और दृश्यता",
    "Manage account": "खाता प्रबंधित करें",

    // Appearance
    Theme: "थीम",
    "Dark Mode": "डार्क मोड",
    "Light Mode": "लाइट मोड",
    "Black & blue futuristic UI": "डार्क फ्यूचरिस्टिक इंटरफ़ेस",
    "Clean light interface": "स्वच्छ एवं स्पष्ट लाइट इंटरफ़ेस",
    Language: "इंटरफ़ेस भाषा",
    "Select Interface Language": "डिस्प्ले भाषा का चयन करें",
    "Theme changed to": "थीम बदलकर की गई",
    "Language updated to": "भाषा बदलकर की गई",

    // Profile Fields
    "Full Name": "पूरा नाम",
    Email: "ईमेल",
    Role: "भूमिका",
    Phone: "फ़ोन",
    Bio: "बायो",
    Skills: "कौशल",
    "Change Photo": "फ़ोटो बदलें",
    "Save Changes": "परिवर्तन सहेजें",
    "Saved!": "सफलतापूर्वक सहेजा गया!",

    // Security
    "Current Password": "वर्तमान पासवर्ड",
    "New Password": "नया पासवर्ड",
    "Confirm New Password": "नए पासवर्ड की पुष्टि करें",
    "Two-Factor Authentication": "द्वि-चरणीय प्रमाणीकरण (2FA)",
    "Add extra security to your account": "अपने खाते में अतिरिक्त सुरक्षा जोड़ें",
    "Update Password": "पासवर्ड अपडेट करें",

    // Notifications
    "Email Notifications": "ईमेल सूचनाएं",
    "Receive updates via email": "ईमेल के माध्यम से अपडेट प्राप्त करें",
    "Push Notifications": "पुश सूचनाएं",
    "Browser push notifications": "ब्राउज़र पुश सूचनाएं",
    "Task Reminders": "कार्य अनुस्मारक",
    "Reminders for upcoming deadlines": "आगामी समय-सीमा के अनुस्मारक",
    "Journal Reminders": "जर्नल अनुस्मारक",
    "Daily journal writing reminders": "दैनिक जर्नल लिखने के अनुस्मारक",

    // Privacy & Account
    "Public Profile": "सार्वजनिक प्रोफ़ाइल",
    "Allow others to see your profile": "दूसरों को आपकी प्रोफ़ाइल देखने दें",
    "Activity Visibility": "गतिविधि दृश्यता",
    "Show your activity to mentors": "मेंटर्स को अपनी गतिविधि दिखाएं",
    "Data Export": "डेटा निर्यात",
    "Download all your data as a JSON file": "अपना सारा डेटा JSON के रूप में डाउनलोड करें",
    "Export My Data": "मेरा डेटा डाउनलोड करें",
    "Add Another Account": "अन्य खाता जोड़ें",
    "Sign in with a different account": "दूसरे खाते से साइन इन करें",
    "Delete Account": "खाता हटाएं",
    "Sign out from this device": "इस डिवाइस से साइन आउट करें",
  },
  es: {
    // Navigation items
    Dashboard: "Panel",
    Tasks: "Tareas",
    "Skill Test": "Evaluación",
    Attendance: "Asistencia",
    Journals: "Diarios",
    Evaluation: "Evaluación",
    Analytics: "Analítica",
    Calendar: "Calendario",
    Messages: "Mensajes",
    Mentor: "Mentores",
    Settings: "Ajustes",
    Logout: "Cerrar Sesión",
    "Internship Progress": "Progreso de Pasantía",
    "Days Left": "Días Restantes",
    Intern: "Pasante",

    // Settings tabs & headers
    Profile: "Perfil",
    Security: "Seguridad",
    Notifications: "Notificaciones",
    Appearance: "Apariencia",
    Privacy: "Privacidad",
    Account: "Cuenta",
    "Profile Settings": "Ajustes de Perfil",
    "Security Settings": "Ajustes de Seguridad",
    "Notification Preferences": "Preferencias de Notificación",
    "Privacy Settings": "Ajustes de Privacidad",
    "Account Management": "Gestión de Cuenta",

    // Descriptions
    "Personal info & skills": "Información personal y habilidades",
    "Password & 2FA": "Contraseña y 2FA",
    "Alerts & reminders": "Alertas y recordatorios",
    "Theme & display": "Tema y pantalla",
    "Data & visibility": "Datos y visibilidad",
    "Manage account": "Administrar cuenta",

    // Appearance
    Theme: "Tema",
    "Dark Mode": "Modo Oscuro",
    "Light Mode": "Modo Claro",
    "Black & blue futuristic UI": "Interfaz futurista oscura",
    "Clean light interface": "Interfaz clara y limpia",
    Language: "Idioma de Interfaz",
    "Select Interface Language": "Seleccionar idioma de visualización",
    "Theme changed to": "Tema cambiado a",
    "Language updated to": "Idioma actualizado a",

    // Profile Fields
    "Full Name": "Nombre Completo",
    Email: "Correo Electrónico",
    Role: "Rol",
    Phone: "Teléfono",
    Bio: "Biografía",
    Skills: "Habilidades",
    "Change Photo": "Cambiar Foto",
    "Save Changes": "Guardar Cambios",
    "Saved!": "¡Guardado con éxito!",

    // Security
    "Current Password": "Contraseña Actual",
    "New Password": "Nueva Contraseña",
    "Confirm New Password": "Confirmar Nueva Contraseña",
    "Two-Factor Authentication": "Autenticación en Dos Pasos",
    "Add extra security to your account": "Añade seguridad adicional a tu cuenta",
    "Update Password": "Actualizar Contraseña",

    // Notifications
    "Email Notifications": "Notificaciones por Correo",
    "Receive updates via email": "Recibir actualizaciones por correo",
    "Push Notifications": "Notificaciones Push",
    "Browser push notifications": "Notificaciones push del navegador",
    "Task Reminders": "Recordatorios de Tareas",
    "Reminders for upcoming deadlines": "Recordatorios de próximas fechas límite",
    "Journal Reminders": "Recordatorios de Diarios",
    "Daily journal writing reminders": "Recordatorios diarios de escritura de diario",

    // Privacy & Account
    "Public Profile": "Perfil Público",
    "Allow others to see your profile": "Permitir que otros vean tu perfil",
    "Activity Visibility": "Visibilidad de Actividad",
    "Show your activity to mentors": "Mostrar tu actividad a los mentores",
    "Data Export": "Exportación de Datos",
    "Download all your data as a JSON file": "Descarga todos tus datos en un archivo JSON",
    "Export My Data": "Exportar Mis Datos",
    "Add Another Account": "Añadir Otra Cuenta",
    "Sign in with a different account": "Iniciar sesión con una cuenta diferente",
    "Delete Account": "Eliminar Cuenta",
    "Sign out from this device": "Cerrar sesión en este dispositivo",
  },
  fr: {
    Dashboard: "Tableau de bord",
    Tasks: "Tâches",
    "Skill Test": "Évaluation",
    Attendance: "Présence",
    Journals: "Journaux",
    Evaluation: "Évaluation",
    Analytics: "Analytique",
    Calendar: "Calendrier",
    Messages: "Messages",
    Mentor: "Mentor",
    Settings: "Paramètres",
    Logout: "Déconnexion",
    "Internship Progress": "Progrès du Stage",
    "Days Left": "Jours Restants",
    Intern: "Stagiaire",
    Profile: "Profil",
    Security: "Sécurité",
    Notifications: "Notifications",
    Appearance: "Apparence",
    Privacy: "Confidentialité",
    Account: "Compte",
    Theme: "Thème",
    "Dark Mode": "Mode Sombre",
    "Light Mode": "Mode Clair",
    Language: "Langue",
    "Save Changes": "Enregistrer",
    "Saved!": "Enregistré avec succès!",
  }
}

export function getLanguage() {
  if (typeof window === "undefined") return "en"
  return localStorage.getItem(STORAGE_KEY_LANG) || "en"
}

export function setLanguage(lang) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY_LANG, lang)
  try {
    document.documentElement.lang = lang
    window.dispatchEvent(new CustomEvent("ip_language_changed", { detail: lang }))
  } catch {}
}

export function t(key, lang = "en") {
  const currentLang = lang || getLanguage()
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS["en"]?.[key] || key
}

export function useTranslation() {
  const [lang, setLangState] = useState("en")

  useEffect(() => {
    const active = getLanguage()
    setLangState(active)

    const onLangChange = (e) => {
      setLangState(e.detail || getLanguage())
    }

    window.addEventListener("ip_language_changed", onLangChange)
    return () => window.removeEventListener("ip_language_changed", onLangChange)
  }, [])

  const changeLanguage = (newLang) => {
    setLanguage(newLang)
    setLangState(newLang)
  }

  const translate = (key) => t(key, lang)

  return { lang, setLang: changeLanguage, t: translate }
}
