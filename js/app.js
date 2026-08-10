import { getRestaurantSettings, getCategories, getMeals } from './dataProvider.js';
import { applySavedTheme, toggleTheme, getCurrentLanguage, changeLanguage, translations } from './config.js';
import { addToCart } from './cart.js';

let currentCategoryId = null;
let currentCurrencySymbol = 'TL';
let cachedMeals = []; // 🌟 مصفوفة لتخزين الوجبات المجلوبة لفلترتها فوراً بدون ضرب السيرفر

window.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    // 🌍 إدارة وربط حدث اختيار اللغة من الواجهة
    const langSelect = document.getElementById('lang-change-select');
    if (langSelect) {
        langSelect.value = getCurrentLanguage();
        
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
            loadMenuSystem();
        });
    }

    // 🔍 ربط حدث الكتابة داخل صندوق البحث للفلترة الفورية الـ Real-time
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterAndRenderMeals(query);
        });
    }

    loadMenuSystem();
});

async function loadMenuSystem() {
    try {
        const lang = getCurrentLanguage();
        const t = translations[lang] || translations['ar']; 
        
        const settings = await getRestaurantSettings();
        
        if (settings) {
            const resName = document.getElementById('restaurant-name');
            const workHours = document.getElementById('working-hours');
            const resAddr = document.getElementById('restaurant-address');
            const mapsLink = document.getElementById('maps-link');

            if (resName) resName.innerText = settings.restaurant_name || '';
            if (workHours) workHours.innerHTML = `<i class="far fa-clock"></i> ${t.working_hours_title}: ${settings.working_hours || ''}`;
            if (resAddr) resAddr.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settings.address || ''}`;
            if (mapsLink) mapsLink.href = settings.google_maps_link || '#';

            if (settings.currency_symbol) {
                currentCurrencySymbol = settings.currency_symbol;
            }

            const statusElement = document.getElementById('restaurant-status');
            if (statusElement) {
                if (settings.is_open) {
                    statusElement.innerText = t.res_status_open;
                    statusElement.className = "status-tag open";
                } else {
                    statusElement.innerText = t.res_status_closed;
                    statusElement.className = "status-tag closed";
                }
            }

            if (settings.cover_url) {
                const banner = document.getElementById('restaurant-banner');
                if (banner) {
                    banner.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${settings.cover_url}')`;
                }
            }
        }
        
        // 🔍 تحديث الـ Placeholder الخاص بمربع البحث حسب اللغة النشطة
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            if (lang === 'tr') searchInput.placeholder = "Yemek, mezze veya içecek ara...";
            else if (lang === 'en') searchInput.placeholder = "Search for a meal, appetizer, or drink...";
            else searchInput.placeholder = "ابحث عن وجبة، مقبلات، أو عصير...";
        }

        const categories = await getCategories();
        const catContainer = document.getElementById('categories-container');
        
        if (catContainer && categories) {
            let catHtml = `<span class="category-tab active" data-id="all">${t.all_meals}</span>`;
            categories.forEach(cat => {
                let catName = cat.name;
                if (lang === 'tr' && cat.name_tr) catName = cat.name_tr;
                if (lang === 'en' && cat.name_en) catName = cat.name_en;

                catHtml += `<span class="category-tab" data-id="${cat.id}">${catName}</span>`;
            });
            catContainer.innerHTML = catHtml;

            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentCategoryId = tab.dataset.id === 'all' ? null : tab.dataset.id;
                    
                    const titleEl = document.getElementById('current-category-title');
                    if (titleEl) titleEl.innerText = tab.innerText;
                    
                    // تنظيف خانة البحث عند تغيير القسم
                    if (searchInput) searchInput.value = "";
                    
                    fetchAndStoreMeals();
                });
            });
        }

        const currentCatTitle = document.getElementById('current-category-title');
        if (currentCatTitle) {
            const activeTab = document.querySelector('.category-tab.active');
            currentCatTitle.innerText = currentCategoryId === null ? t.all_meals : (activeTab ? activeTab.innerText : t.all_meals);
        }

        fetchAndStoreMeals();
    } catch (err) {
        console.error("خطأ في تحميل نظام المنيو:", err);
    }
}

// دالة وسيطة لجلب البيانات وتخزينها محلياً
async function fetchAndStoreMeals() {
    const container = document.getElementById('meals-container');
    if (!container) return;

    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];

    container.innerHTML = `<span class="loading-text"><i class="fas fa-spinner fa-spin"></i> ${t.loading_meals}</span>`;
    
    // جلب المنتجات وحفظها كاش
    cachedMeals = await getMeals(currentCategoryId);
    
    // بناء الواجهة
    filterAndRenderMeals("");
}

// 🧠 محرك الفلترة وتجميع قسم العروض والواجهة الرئيسية
function filterAndRenderMeals(searchQuery) {
    const container = document.getElementById('meals-container');
    if (!container) return;

    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];
    
    // فلترة الوجبات المخزنة بناءً على البحث
    const filteredMeals = cachedMeals.filter(meal => {
        const titleAr = (meal.title || "").toLowerCase();
        const titleTr = (meal.title_tr || "").toLowerCase();
        const titleEn = (meal.title_en || "").toLowerCase();
        const descAr = (meal.description || "").toLowerCase();
        const descTr = (meal.description_tr || "").toLowerCase();
        const descEn = (meal.description_en || "").toLowerCase();
        
        return titleAr.includes(searchQuery) || 
               titleTr.includes(searchQuery) || 
               titleEn.includes(searchQuery) || 
               descAr.includes(searchQuery) || 
               descTr.includes(searchQuery) || 
               descEn.includes(searchQuery);
    });

    if (filteredMeals.length === 0) {
        container.innerHTML = `<p class="loading-text">${t.no_meals || "لم نجد وجبات تطابق بحثك..."}</p>`;
        return;
    }

    // 🌟 تجميع قسم العروض الخاصة أولاً إذا كنا في عرض "الكل" أو إذا أظهر الفلتر وجبات عروض
    const offerMeals = filteredMeals.filter(m => m.is_offer === true);
    let offersHtml = "";

    if (offerMeals.length > 0 && currentCategoryId === null) {
        let offerCards = "";
        offerMeals.forEach(meal => {
            offerCards += generateMealCardHTML(meal, lang, t, true);
        });

        const offersTitle = lang === 'tr' ? '🔥 Özel Fırsatlar' : (lang === 'en' ? '🔥 Special Offers' : '🔥 العروض الخاصة');

        offersHtml = `
            <div class="offers-section" style="width: 100%; margin-bottom: 25px;">
                <h2 class="offers-title">${offersTitle}</h2>
                <div class="offers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${offerCards}
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--border-luxury, #333); margin: 20px 0; width: 100%;">
        `;
    }

    // بناء كروت باقي القائمة
    let mainMealsHtml = "";
    filteredMeals.forEach(meal => {
        mainMealsHtml += generateMealCardHTML(meal, lang, t, false);
    });

    container.innerHTML = offersHtml + `<div class="meals-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; width: 100%;">${mainMealsHtml}</div>`;

    // إعادة ربط أحداث "إضافة إلى السلة"
    document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart({
                id: btn.dataset.id,
                title: btn.dataset.title,
                price: parseFloat(btn.dataset.price)
            });
        });
    });
}

// 🛠️ دالة مساعدة لتوليد HTML كرت الوجبة مع دعم العروض والأسعار
function generateMealCardHTML(meal, lang, t, isOfferSection) {
    const isAvailable = meal.is_available !== false; 
    const hasOffer = meal.is_offer === true && meal.offer_price;

    let mealTitle = meal.title;
    let mealDesc = meal.description || 'طبق مميز محضر من أفضل المكونات الطازجة.';

    if (lang === 'tr') {
        if (meal.title_tr) mealTitle = meal.title_tr;
        if (meal.description_tr) mealDesc = meal.description_tr;
    } else if (lang === 'en') {
        if (meal.title_en) mealTitle = meal.title_en;
        if (meal.description_en) mealDesc = meal.description_en;
    }

    // تحديد السعر الفعلي والنهائي المعتمد للإضافة للسلة
    const finalPrice = hasOffer ? meal.offer_price : meal.price;

    // بناء عرض السعر (مشطوب إذا وجد عرض)
    let priceDisplay = `<span class="meal-price">${meal.price.toLocaleString()} ${currentCurrencySymbol}</span>`;
    if (hasOffer) {
        priceDisplay = `
            <div class="price-container">
                <span class="old-price">${meal.price.toLocaleString()} ${currentCurrencySymbol}</span>
                <span class="new-price">${meal.offer_price.toLocaleString()} ${currentCurrencySymbol}</span>
            </div>
        `;
    }

    const offerBadgeText = lang === 'tr' ? 'Fırsat' : (lang === 'en' ? 'Offer' : 'عرض خاص');

    return `
        <div class="meal-card ${!isAvailable ? 'meal-disabled' : ''} ${hasOffer ? 'meal-has-offer' : ''}">
            <div class="meal-img-wrapper" style="position: relative;">
                <img src="${meal.image_url}" class="meal-img" alt="${mealTitle}" loading="lazy">
                ${hasOffer ? `<div class="offer-badge">${offerBadgeText} 🔥</div>` : ''}
                ${!isAvailable ? `<div class="unavailable-badge">${t.status_unavailable}</div>` : ''}
            </div>
            <div class="meal-info">
                <div class="meal-title-row">
                    <h3>${mealTitle}</h3>
                    ${priceDisplay}
                </div>
                <p class="meal-desc">${mealDesc}</p>
                
                <button class="add-to-cart-btn" 
                        data-id="${meal.id}" 
                        data-title="${mealTitle}" 
                        data-price="${finalPrice}"
                        ${!isAvailable ? 'disabled' : ''}>
                    ${isAvailable ? `${t.btn_add} <i class="fas fa-plus"></i>` : `${t.status_unavailable} <i class="fas fa-minus-circle"></i>`}
                </button>
            </div>
        </div>
    `;
}