export const SUPABASE_URL = "https://goarjqknndwyntkywpfv.supabase.co";
export const SUPABASE_KEY = "sb_publishable_OtlBg4rq8V9BKUCuNcf4Qg_bzqqeUs-";
export const ADMIN_PASSWORD = "CastelloAdmin2026";

// 🌍 قاموس لغات النظام الثابتة للواجهات (Arabic / Turkish / English)
export const translations = {
    ar: {
        res_status_open: "🟢 مفتوح الآن",
        res_status_closed: "🔴 مغلق حالياً",
        working_hours_title: "أوقات العمل",
        address_title: "العنوان",
        currency_tl: "ل.ت",
        all_meals: "الكل",
        loading_meals: "جاري تحميل قائمة الطعام الفاخرة...",
        no_meals: "لا توجد وجبات في هذا القسم حالياً.",
        btn_save: "حفظ التعديلات",
        btn_delete: "حذف",
        btn_add: "إضافة",
        status_available: "متوفرة",
        status_unavailable: "غير متوفرة",
        price_label: "السعر",
        search_placeholder: "ابحث عن وجبتك المفضلة...",
        admin_panel_title: "لوحة تحكم كاستيلو"
    },
    tr: {
        res_status_open: "🟢 Şimdi Açık",
        res_status_closed: "🔴 Şu Anda Kapalı",
        working_hours_title: "Çalışma Saatleri",
        address_title: "Adres",
        currency_tl: "TL",
        all_meals: "Hepsi",
        loading_meals: "Lüks menü yükleniyor...",
        no_meals: "Bu kategoride henüz yemek bulunmamaktadır.",
        btn_save: "Değişiklikleri Kaydet",
        btn_delete: "Sil",
        btn_add: "Ekle",
        status_available: "Mevcut",
        status_unavailable: "Mevcut Değil",
        price_label: "Fiyat",
        search_placeholder: "Favori yemeğinizi arayın...",
        admin_panel_title: "Castello Yönetim Paneli"
    },
    en: {
        res_status_open: "🟢 Open Now",
        res_status_closed: "🔴 Currently Closed",
        working_hours_title: "Working Hours",
        address_title: "Address",
        currency_tl: "TL",
        all_meals: "All",
        loading_meals: "Loading luxury menu...",
        no_meals: "No meals found in this category.",
        btn_save: "Save Changes",
        btn_delete: "Delete",
        btn_add: "Add",
        status_available: "Available",
        status_unavailable: "Unavailable",
        price_label: "Price",
        search_placeholder: "Search your favorite meal...",
        admin_panel_title: "Castello Admin Dashboard"
    }
};

// 🗺️ دالة جلب اللغة الحالية المخزنة أو تعيين العربية كافتراضية
export function getCurrentLanguage() {
    return localStorage.getItem('app-lang') || 'ar';
}

// 🗺️ دالة تغيير اللغة وحفظها في المتصفح
export function changeLanguage(langCode) {
    if (['ar', 'tr', 'en'].includes(langCode)) {
        localStorage.setItem('app-lang', langCode);
        // ضبط اتجاه الصفحة تلقائياً: RTL للعربية و LTR للتركي والإنجليزي
        document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = langCode;
    }
}

// 🌓 دالة مشتركة لتفعيل الثيم في جميع الصفحات تلقائياً
export function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    document.body.className = savedTheme;
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerHTML = savedTheme === 'dark-theme' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
    
    // ضبط اتجاه النص للغة الحالية عند تشغيل النظام تلقائياً
    const currentLang = getCurrentLanguage();
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

export function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.className = 'light-theme';
        localStorage.setItem('theme', 'light-theme');
    } else {
        document.body.className = 'dark-theme';
        localStorage.setItem('theme', 'dark-theme');
    }
    applySavedTheme();
}