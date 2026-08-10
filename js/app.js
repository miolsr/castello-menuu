import { getRestaurantSettings, getCategories, getMeals } from './dataProvider.js';
import {
    applySavedTheme,
    toggleTheme,
    getCurrentLanguage,
    changeLanguage,
    translations
} from './config.js';
import { addToCart } from './cart.js';

let currentCategoryId = null;
let currentCurrencySymbol = 'TL';
let cachedMeals = [];

// ==========================================
// تهيئة التطبيق
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();

    // زر الثيم
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // =========================
    // تغيير اللغة
    // =========================

    const langSelect = document.getElementById('lang-change-select');

    if (langSelect) {
        langSelect.value = getCurrentLanguage();

        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
            loadMenuSystem();
        });
    }

    // =========================
    // البحث
    // =========================

    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterAndRenderMeals(query);
        });
    }

    // تشغيل النظام
    loadMenuSystem();
});


// ==========================================
// تحميل نظام المنيو بالكامل
// ==========================================

async function loadMenuSystem() {
    try {
        const lang = getCurrentLanguage();
        const t = translations[lang] || translations['ar'];

        // =========================
        // إعدادات المطعم
        // =========================

        const settings = await getRestaurantSettings();

        if (settings) {
            const resName = document.getElementById('restaurant-name');
            const workHours = document.getElementById('working-hours');
            const resAddr = document.getElementById('restaurant-address');
            const mapsLink = document.getElementById('maps-link');

            if (resName) {
                resName.innerText = settings.restaurant_name || '';
            }

            if (workHours) {
                workHours.innerHTML =
                    `<i class="far fa-clock"></i> ${t.working_hours_title}: ${settings.working_hours || ''}`;
            }

            if (resAddr) {
                resAddr.innerHTML =
                    `<i class="fas fa-map-marker-alt"></i> ${settings.address || ''}`;
            }

            if (mapsLink) {
                mapsLink.href = settings.google_maps_link || '#';
            }

            if (settings.currency_symbol) {
                currentCurrencySymbol = settings.currency_symbol;
            }

            // حالة المطعم
            const statusElement = document.getElementById('restaurant-status');

            if (statusElement) {
                if (settings.is_open) {
                    statusElement.innerText = t.res_status_open;
                    statusElement.className = 'status-tag open';
                } else {
                    statusElement.innerText = t.res_status_closed;
                    statusElement.className = 'status-tag closed';
                }
            }

            // صورة البانر
            if (settings.cover_url) {
                const banner = document.getElementById('restaurant-banner');

                if (banner) {
                    banner.style.backgroundImage =
                        `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${settings.cover_url}')`;
                }
            }
        }

        // =========================
        // Placeholder البحث
        // =========================

        const searchInput = document.getElementById('search-input');

        if (searchInput) {
            if (lang === 'tr') {
                searchInput.placeholder = 'Yemek, mezze veya içecek ara...';
            } else if (lang === 'en') {
                searchInput.placeholder = 'Search for a meal, appetizer, or drink...';
            } else {
                searchInput.placeholder = 'ابحث عن وجبة، مقبلات، أو عصير...';
            }
        }

        // =========================
        // تحميل الأقسام
        // =========================

        const categories = await getCategories();
        const catContainer = document.getElementById('categories-container');

        if (catContainer) {

            // زر الكل
            let catHtml = `
                <span
                    class="category-tab ${currentCategoryId === null ? 'active' : ''}"
                    data-id="all">
                    ${t.all_meals}
                </span>
            `;

            // زر العروض الخاصة
            const offersLabel =
                lang === 'tr'
                    ? '🔥 Özel Fırsatlar'
                    : lang === 'en'
                        ? '🔥 Special Offers'
                        : '🔥 العروض الخاصة';

            catHtml += `
                <span
                    class="category-tab ${currentCategoryId === 'offers' ? 'active' : ''}"
                    data-id="offers">
                    ${offersLabel}
                </span>
            `;

            // الأقسام العادية
            if (categories) {
                categories.forEach(cat => {

                    let catName = cat.name;

                    if (lang === 'tr' && cat.name_tr) {
                        catName = cat.name_tr;
                    }

                    if (lang === 'en' && cat.name_en) {
                        catName = cat.name_en;
                    }

                    catHtml += `
                        <span
                            class="category-tab ${currentCategoryId === cat.id ? 'active' : ''}"
                            data-id="${cat.id}">
                            ${catName}
                        </span>
                    `;
                });
            }

            catContainer.innerHTML = catHtml;

            // =========================
            // أحداث أزرار الأقسام
            // =========================

            document.querySelectorAll('.category-tab').forEach(tab => {

                tab.addEventListener('click', async () => {

                    document
                        .querySelectorAll('.category-tab')
                        .forEach(t => t.classList.remove('active'));

                    tab.classList.add('active');

                    const selectedId = tab.dataset.id;

                    // الكل
                    if (selectedId === 'all') {
                        currentCategoryId = null;
                    }

                    // العروض
                    else if (selectedId === 'offers') {
                        currentCategoryId = 'offers';
                    }

                    // قسم عادي
                    else {
                        currentCategoryId = selectedId;
                    }

                    // تحديث عنوان القسم
                    const titleEl =
                        document.getElementById('current-category-title');

                    if (titleEl) {
                        titleEl.innerText = tab.innerText.trim();
                    }

                    // تنظيف البحث
                    if (searchInput) {
                        searchInput.value = '';
                    }

                    // جلب الوجبات
                    await fetchAndStoreMeals();
                });
            });
        }

        // =========================
        // عنوان القسم الحالي
        // =========================

        const currentCatTitle =
            document.getElementById('current-category-title');

        if (currentCatTitle) {

            const activeTab =
                document.querySelector('.category-tab.active');

            if (activeTab) {
                currentCatTitle.innerText = activeTab.innerText.trim();
            } else {
                currentCatTitle.innerText = t.all_meals;
            }
        }

        // تحميل الوجبات
        await fetchAndStoreMeals();

    } catch (err) {
        console.error('خطأ في تحميل نظام المنيو:', err);
    }
}


// ==========================================
// جلب وتخزين الوجبات
// ==========================================

async function fetchAndStoreMeals() {

    const container = document.getElementById('meals-container');

    if (!container) {
        return;
    }

    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];

    container.innerHTML = `
        <span class="loading-text">
            <i class="fas fa-spinner fa-spin"></i>
            ${t.loading_meals}
        </span>
    `;

    try {

        /*
         * عندما نكون في قسم العروض:
         * نجلب كل الوجبات ثم نفلتر is_offer.
         *
         * هذا أفضل من افتراض وجود category خاص بالعروض
         * داخل جدول categories.
         */

        if (currentCategoryId === 'offers') {
            cachedMeals = await getMeals(null);
        } else {
            cachedMeals = await getMeals(currentCategoryId);
        }

        if (!Array.isArray(cachedMeals)) {
            cachedMeals = [];
        }

        filterAndRenderMeals('');

    } catch (error) {

        console.error('خطأ في جلب الوجبات:', error);

        container.innerHTML = `
            <p class="loading-text">
                ${t.no_meals || 'تعذر تحميل الوجبات.'}
            </p>
        `;
    }
}


// ==========================================
// التحقق من كون الوجبة عرضاً
// ==========================================

function isMealOffer(meal) {

    // دعم boolean الحقيقي
    if (meal.is_offer === true) {
        return true;
    }

    // دعم القيمة النصية القادمة من بعض المصادر
    if (
        meal.is_offer === 'true' ||
        meal.is_offer === 1 ||
        meal.is_offer === '1'
    ) {
        return true;
    }

    return false;
}


// ==========================================
// التحقق من وجود سعر عرض صالح
// ==========================================

function hasValidOfferPrice(meal) {

    if (!isMealOffer(meal)) {
        return false;
    }

    const offerPrice = Number(meal.offer_price);

    return Number.isFinite(offerPrice) && offerPrice > 0;
}


// ==========================================
// محرك البحث والفلترة والرندر
// ==========================================

function filterAndRenderMeals(searchQuery) {

    const container = document.getElementById('meals-container');

    if (!container) {
        return;
    }

    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];

    // =========================
    // فلترة البحث
    // =========================

    let filteredMeals = cachedMeals.filter(meal => {

        const titleAr = (meal.title || '').toLowerCase();
        const titleTr = (meal.title_tr || '').toLowerCase();
        const titleEn = (meal.title_en || '').toLowerCase();

        const descAr = (meal.description || '').toLowerCase();
        const descTr = (meal.description_tr || '').toLowerCase();
        const descEn = (meal.description_en || '').toLowerCase();

        return (
            titleAr.includes(searchQuery) ||
            titleTr.includes(searchQuery) ||
            titleEn.includes(searchQuery) ||
            descAr.includes(searchQuery) ||
            descTr.includes(searchQuery) ||
            descEn.includes(searchQuery)
        );
    });


    // =========================
    // إذا نحن في تبويب العروض
    // =========================

    if (currentCategoryId === 'offers') {

        filteredMeals = filteredMeals.filter(meal =>
            hasValidOfferPrice(meal)
        );

        if (filteredMeals.length === 0) {

            container.innerHTML = `
                <p class="loading-text">
                    ${t.no_meals || 'لا توجد عروض حالياً.'}
                </p>
            `;

            return;
        }

        let offersHtml = '';

        filteredMeals.forEach(meal => {
            offersHtml += generateMealCardHTML(
                meal,
                lang,
                t,
                true
            );
        });

        container.innerHTML = `
            <div class="meals-grid">
                ${offersHtml}
            </div>
        `;

        bindCartButtons();

        return;
    }


    // =========================
    // تبويب "الكل"
    // =========================

    let offersHtml = '';

    if (currentCategoryId === null) {

        const offerMeals = filteredMeals.filter(meal =>
            hasValidOfferPrice(meal)
        );

        if (offerMeals.length > 0) {

            let offerCards = '';

            offerMeals.forEach(meal => {
                offerCards += generateMealCardHTML(
                    meal,
                    lang,
                    t,
                    true
                );
            });

            const offersTitle =
                lang === 'tr'
                    ? '🔥 Özel Fırsatlar'
                    : lang === 'en'
                        ? '🔥 Special Offers'
                        : '🔥 العروض الخاصة';

            offersHtml = `
                <div class="offers-section">
                    <h2 class="offers-title">
                        ${offersTitle}
                    </h2>

                    <div class="offers-grid">
                        ${offerCards}
                    </div>
                </div>
            `;
        }

        /*
         * مهم:
         * لا نكرر الوجبات التي هي عروض داخل قائمة "الكل".
         * لأنها ظهرت بالفعل في قسم العروض بالأعلى.
         */

        filteredMeals = filteredMeals.filter(meal =>
            !hasValidOfferPrice(meal)
        );
    }


    // =========================
    // إذا لم توجد وجبات
    // =========================

    if (
        filteredMeals.length === 0 &&
        offersHtml === ''
    ) {

        container.innerHTML = `
            <p class="loading-text">
                ${t.no_meals || 'لم نجد وجبات تطابق بحثك...'}
            </p>
        `;

        return;
    }


    // =========================
    // بناء القائمة الرئيسية
    // =========================

    let mainMealsHtml = '';

    filteredMeals.forEach(meal => {

        mainMealsHtml += generateMealCardHTML(
            meal,
            lang,
            t,
            false
        );
    });


    const mainGridHtml =
        mainMealsHtml
            ? `
                <div class="meals-grid">
                    ${mainMealsHtml}
                </div>
            `
            : '';


    container.innerHTML =
        offersHtml +
        mainGridHtml;


    // إعادة ربط أزرار السلة
    bindCartButtons();
}


// ==========================================
// ربط أزرار إضافة للسلة
// ==========================================

function bindCartButtons() {

    document
        .querySelectorAll('.add-to-cart-btn:not([disabled])')
        .forEach(btn => {

            btn.addEventListener('click', () => {

                addToCart({
                    id: btn.dataset.id,
                    title: btn.dataset.title,
                    price: parseFloat(btn.dataset.price)
                });

            });

        });
}


// ==========================================
// توليد كرت الوجبة
// ==========================================

function generateMealCardHTML(
    meal,
    lang,
    t,
    isOfferSection
) {

    const isAvailable =
        meal.is_available !== false;

    const hasOffer =
        hasValidOfferPrice(meal);

    const normalPrice =
        Number(meal.price) || 0;

    const offerPrice =
        Number(meal.offer_price) || 0;

    // السعر النهائي للسلة
    const finalPrice =
        hasOffer
            ? offerPrice
            : normalPrice;


    // =========================
    // اسم ووصف الوجبة
    // =========================

    let mealTitle =
        meal.title || '';

    let mealDesc =
        meal.description ||
        'طبق مميز محضر من أفضل المكونات الطازجة.';


    if (lang === 'tr') {

        if (meal.title_tr) {
            mealTitle = meal.title_tr;
        }

        if (meal.description_tr) {
            mealDesc = meal.description_tr;
        }

    } else if (lang === 'en') {

        if (meal.title_en) {
            mealTitle = meal.title_en;
        }

        if (meal.description_en) {
            mealDesc = meal.description_en;
        }
    }


    // =========================
    // السعر
    // =========================

    let priceDisplay = `
        <span class="meal-price">
            ${normalPrice.toLocaleString()} ${currentCurrencySymbol}
        </span>
    `;


    if (hasOffer) {

        priceDisplay = `
            <div class="price-container">

                <span class="old-price">
                    ${normalPrice.toLocaleString()}
                    ${currentCurrencySymbol}
                </span>

                <span class="new-price">
                    ${offerPrice.toLocaleString()}
                    ${currentCurrencySymbol}
                </span>

            </div>
        `;
    }


    // =========================
    // شارة العرض
    // =========================

    const offerBadgeText =
        lang === 'tr'
            ? 'Fırsat'
            : lang === 'en'
                ? 'Offer'
                : 'عرض خاص';


    // =========================
    // HTML
    // =========================

    return `
        <div class="meal-card
            ${!isAvailable ? 'meal-disabled' : ''}
            ${hasOffer ? 'meal-has-offer' : ''}">

            <div
                class="meal-img-wrapper"
                style="position: relative;"
            >

                <img
                    src="${meal.image_url || ''}"
                    class="meal-img"
                    alt="${mealTitle}"
                    loading="lazy"
                >

                ${
                    hasOffer
                        ? `<div class="offer-badge">
                                ${offerBadgeText} 🔥
                           </div>`
                        : ''
                }

                ${
                    !isAvailable
                        ? `<div class="unavailable-badge">
                                ${t.status_unavailable}
                           </div>`
                        : ''
                }

            </div>


            <div class="meal-info">

                <div class="meal-title-row">

                    <h3>
                        ${mealTitle}
                    </h3>

                    ${priceDisplay}

                </div>


                <p class="meal-desc">
                    ${mealDesc}
                </p>


                <button
                    class="add-to-cart-btn"
                    data-id="${meal.id}"
                    data-title="${mealTitle}"
                    data-price="${finalPrice}"
                    ${!isAvailable ? 'disabled' : ''}
                >

                    ${
                        isAvailable
                            ? `${t.btn_add} <i class="fas fa-plus"></i>`
                            : `${t.status_unavailable}
                               <i class="fas fa-minus-circle"></i>`
                    }

                </button>

            </div>

        </div>
    `;
}