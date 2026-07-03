import { getRestaurantSettings, getCategories, getMeals } from './dataProvider.js';
import { applySavedTheme, toggleTheme, getCurrentLanguage, changeLanguage, translations } from './config.js';
import { addToCart } from './cart.js';

let currentCategoryId = null;
let currentCurrencySymbol = 'TL';
let cachedMeals = []; // 🌟 مصفوفة لتخزين الوجبات المجلوبة لفلترتها فوراً بدون ضرب السيرفر

window.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    
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
        
        document.getElementById('restaurant-name').innerText = settings.restaurant_name;
        document.getElementById('working-hours').innerHTML = `<i class="far fa-clock"></i> ${t.working_hours_title}: ${settings.working_hours}`;
        document.getElementById('restaurant-address').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settings.address}`;
        document.getElementById('maps-link').href = settings.google_maps_link;
        
        // 🔍 تحديث الـ Placeholder الخاص بمربع البحث حسب اللغة النشطة
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            if (lang === 'tr') searchInput.placeholder = "Yemek, mezze veya içecek ara...";
            else if (lang === 'en') searchInput.placeholder = "Search for a meal, appetizer, or drink...";
            else searchInput.placeholder = "ابحث عن وجبة، مقبلات، أو عصير...";
        }

        if (settings && settings.currency_symbol) {
            currentCurrencySymbol = settings.currency_symbol;
        }

        const statusElement = document.getElementById('restaurant-status');
        if (settings.is_open) {
            statusElement.innerText = t.res_status_open;
            statusElement.className = "status-tag open";
        } else {
            statusElement.innerText = t.res_status_closed;
            statusElement.className = "status-tag closed";
        }

        if(settings.cover_url) {
            document.getElementById('restaurant-banner').style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${settings.cover_url}')`;
        }

        const categories = await getCategories();
        const catContainer = document.getElementById('categories-container');
        
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
                document.getElementById('current-category-title').innerText = tab.innerText;
                
                // تنظيف خانة البحث عند تغيير القسم لضمان تجربة زبون سليمة
                if (searchInput) searchInput.value = "";
                
                fetchAndStoreMeals();
            });
        });

        document.getElementById('current-category-title').innerText = currentCategoryId === null ? t.all_meals : document.querySelector('.category-tab.active').innerText;

        fetchAndStoreMeals();
    } catch (err) {
        console.error(err);
    }
}

// دالة وسيطة لجلب البيانات من الـ Database وتخزينها كاش محلي
async function fetchAndStoreMeals() {
    const container = document.getElementById('meals-container');
    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];

    container.innerHTML = `<span class="loading-text"><i class="fas fa-spinner fa-spin"></i> ${t.loading_meals}</span>`;
    
    // جلب المنتجات وحفظها محلياً
    cachedMeals = await getMeals(currentCategoryId);
    
    // عرضها فوراً بدون فلتر
    filterAndRenderMeals("");
}

// 🧠 محرك الفلترة والتصنيع الفوري لكروت الواجهة
function filterAndRenderMeals(searchQuery) {
    const container = document.getElementById('meals-container');
    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];
    
    let html = "";
    
    // فلترة الوجبات المخزنة محلياً بناءً على الاسم أو الوصف بجميع اللغات المدعومة
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

    filteredMeals.forEach(meal => {
        const isAvailable = meal.is_available !== false; 

        let mealTitle = meal.title;
        let mealDesc = meal.description || 'طبق مميز محضر من أفضل المكونات الطازجة.';

        if (lang === 'tr') {
            if (meal.title_tr) mealTitle = meal.title_tr;
            if (meal.description_tr) mealDesc = meal.description_tr;
        } else if (lang === 'en') {
            if (meal.title_en) mealTitle = meal.title_en;
            if (meal.description_en) mealDesc = meal.description_en;
        }

        html += `
            <div class="meal-card ${!isAvailable ? 'meal-disabled' : ''}">
                <div class="meal-img-wrapper" style="position: relative;">
                    <img src="${meal.image_url}" class="meal-img" alt="${mealTitle}" loading="lazy">
                    ${!isAvailable ? `<div class="unavailable-badge">${t.status_unavailable}</div>` : ''}
                </div>
                <div class="meal-info">
                    <div class="meal-title-row">
                        <h3>${mealTitle}</h3>
                        <span class="meal-price">${meal.price.toLocaleString()} ${currentCurrencySymbol}</span>
                    </div>
                    <p class="meal-desc">${mealDesc}</p>
                    
                    <button class="add-to-cart-btn" 
                            data-id="${meal.id}" 
                            data-title="${mealTitle}" 
                            data-price="${meal.price}"
                            ${!isAvailable ? 'disabled' : ''}>
                        ${isAvailable ? `${t.btn_add} <i class="fas fa-plus"></i>` : `${t.status_unavailable} <i class="fas fa-minus-circle"></i>`}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    // إعادة ربط أحداث أزرار "إضافة إلى السلة" بعد كل عملية فلترة ديناميكية
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