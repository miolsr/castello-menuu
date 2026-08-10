import { supabaseClient } from './dataProvider.js';
import { applySavedTheme, toggleTheme } from './config.js';

let originalCurrencyCode = 'TRY';
let currentCurrencySymbol = 'TL';

window.addEventListener('DOMContentLoaded', async () => {
    applySavedTheme();
    
    // 🌟 جلب اللوغو المبدئي فور فتح الصفحة
    loadInitialRestaurantLogo();

    // 🌟 التحقق التلقائي من وجود جلسة دخول سابقة
    await checkUserSession();

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    const loginBtn = document.getElementById('btn-do-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginAdminUser);
    }
    
    const saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveAdminSettings);

    const addCatBtn = document.getElementById('btn-add-category');
    if (addCatBtn) addCatBtn.addEventListener('click', addAdminCategory);

    const addMealBtn = document.getElementById('btn-add-meal');
    if (addMealBtn) addMealBtn.addEventListener('click', addAdminMeal);
});

// 🌟 التحقق من جلسة التسجيل المخزنة
async function checkUserSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const loginOverlay = document.getElementById('loginOverlay');
            const adminContent = document.getElementById('adminContent');
            if (loginOverlay) loginOverlay.style.display = 'none';
            if (adminContent) adminContent.style.display = 'block';
            loadAdminSystem();
        }
    } catch (err) {
        console.error("خطأ في التحقق من الجلسة:", err);
    }
}

// 🌟 دالة جلب اللوغو المبدئي
async function loadInitialRestaurantLogo() {
    try {
        const { data: settings } = await supabaseClient.from('restaurant_settings').select('logo_url').eq('id', 1).single();
        
        const navLogo = document.getElementById('nav-res-logo');
        const loginLogo = document.getElementById('login-res-logo');

        if (settings && settings.logo_url) {
            if (navLogo) navLogo.src = settings.logo_url;
            if (loginLogo) loginLogo.src = settings.logo_url;
        } else {
            const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            if (navLogo) navLogo.src = transparentPixel;
            if (loginLogo) loginLogo.src = transparentPixel;
        }
    } catch (err) {
        console.error("خطأ أثناء جلب اللوغو المبدئي:", err);
    }
}

async function loginAdminUser() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(!email || !password) {
        return alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور للإدارة!");
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            alert("فشل التحقق: " + error.message + " ❌");
            return;
        }

        if (data && data.user) {
            alert("مرحباً بك، تم التحقق بنجاح");
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            loadAdminSystem();
        }
    } catch (catchErr) {
        alert("حدث خطأ في النظام أثناء الاتصال بالسيرفر!");
    }
}

async function loadAdminSystem() {
    try {
        const { data: settings } = await supabaseClient.from('restaurant_settings').select('*').eq('id', 1).single();
        if(settings) {
            if (document.getElementById('input-res-name')) document.getElementById('input-res-name').value = settings.restaurant_name || '';
            if (document.getElementById('input-res-status')) document.getElementById('input-res-status').value = settings.is_open ? "true" : "false";
            if (document.getElementById('input-working-hours')) document.getElementById('input-working-hours').value = settings.working_hours || "";
            if (document.getElementById('input-whatsapp')) document.getElementById('input-whatsapp').value = settings.whatsapp_number || '';
            if (document.getElementById('input-maps')) document.getElementById('input-maps').value = settings.google_maps_link || '';
            if (document.getElementById('input-address')) document.getElementById('input-address').value = settings.address || "";
            
            if (settings.logo_url) {
                const navLogo = document.getElementById('nav-res-logo');
                const loginLogo = document.getElementById('login-res-logo');
                if (navLogo) navLogo.src = settings.logo_url;
                if (loginLogo) loginLogo.src = settings.logo_url;
            }

            if (settings.currency_code && settings.currency_symbol) {
                originalCurrencyCode = settings.currency_code;
                currentCurrencySymbol = settings.currency_symbol;
                const selectBox = document.getElementById('input-currency-select');
                if (selectBox) {
                    selectBox.value = `${settings.currency_code}|${settings.currency_symbol}`;
                }
            }

            const historyBox = document.getElementById('currency-history-info');
            if (historyBox && settings.last_conversion_date) {
                const formattedDate = new Date(settings.last_conversion_date).toLocaleString('ar-SY', { hour12: true });
                historyBox.innerHTML = `<i class="fas fa-clock"></i> آخر تحويل أسعار شامل: <b>${settings.last_exchange_rate}</b> بتاريخ ${formattedDate}`;
            } else if (historyBox) {
                historyBox.innerHTML = `<i class="fas fa-info-circle"></i> لم يتم إجراء عمليات تحويل صرف تلقائية سابقة.`;
            }
        }

        const { data: categories } = await supabaseClient.from('categories').select('*').order('id', { ascending: true });
        
        if(categories && categories.length > 0) {
            const box = document.getElementById('meal-category-select');
            if (box) {
                box.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }

            const catManagementBox = document.getElementById('admin-categories-list');
            if (catManagementBox) {
                let catHtml = "";
                categories.forEach(c => {
                    catHtml += `
                        <div class="form-inline" style="margin-bottom: 8px; justify-content: space-between; align-items: center; background: var(--bg-deep-prime); padding: 8px; border-radius: 6px; border: 1px solid var(--border-luxury);">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 0.85rem; font-weight: 700;">العربية: ${c.name}</span>
                                <span style="font-size: 0.75rem; color: var(--text-dimmed)">Türkçe: ${c.name_tr || '—'} | English: ${c.name_en || '—'}</span>
                            </div>
                            <button class="inline-delete-btn delete-cat-btn" data-id="${c.id}" data-name="${c.name}" style="padding: 4px 8px;"><i class="fas fa-trash"></i> مسح</button>
                        </div>
                    `;
                });
                catManagementBox.innerHTML = catHtml;

                document.querySelectorAll('.delete-cat-btn').forEach(btn => {
                    btn.addEventListener('click', () => deleteAdminCategory(btn.dataset.id, btn.dataset.name));
                });
            }
        } else {
            const catManagementBox = document.getElementById('admin-categories-list');
            if (catManagementBox) catManagementBox.innerHTML = '<p class="loading-text">لا توجد أقسام حالياً.</p>';
        }

        renderAdminStockDashboard();
    } catch (err) {
        console.error("خطأ عام في تحميل لوحة الإدارة:", err);
    }
}

async function uploadToSupabaseStorage(fileObject, bucketName) {
    if (!fileObject) return null;
    try {
        const fileExtension = fileObject.name.split('.').pop();
        const uniqName = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExtension}`;
        const { error } = await supabaseClient.storage.from(bucketName).upload(uniqName, fileObject, {
            contentType: fileObject.type,
            cacheControl: '3600',
            upsert: true
        });
        if (error) {
            console.error("خطأ الرفع للستوريدج:", error.message);
            return null;
        }
        const { data: publicUrlData } = supabaseClient.storage.from(bucketName).getPublicUrl(uniqName);
        return publicUrlData.publicUrl;
    } catch (e) {
        console.error("استثناء أسباب الرفع:", e);
        return null;
    }
}

async function saveAdminSettings() {
    try {
        const bannerInput = document.getElementById('input-banner-file');
        let bannerUrl = null;
        if (bannerInput && bannerInput.files && bannerInput.files[0]) {
            bannerUrl = await uploadToSupabaseStorage(bannerInput.files[0], 'banners');
        }

        const logoInput = document.getElementById('input-logo-file');
        let logoUrl = null;
        if (logoInput && logoInput.files && logoInput.files[0]) {
            logoUrl = await uploadToSupabaseStorage(logoInput.files[0], 'restaurant-assets');
        }

        const currencySelect = document.getElementById('input-currency-select');
        const [newCurrencyCode, newCurrencySymbol] = currencySelect ? currencySelect.value.split('|') : [originalCurrencyCode, currentCurrencySymbol];

        const updateFields = {
            restaurant_name: document.getElementById('input-res-name')?.value || '',
            is_open: document.getElementById('input-res-status')?.value === "true",
            working_hours: document.getElementById('input-working-hours')?.value || '',
            whatsapp_number: document.getElementById('input-whatsapp')?.value || '',
            google_maps_link: document.getElementById('input-maps')?.value || '',
            address: document.getElementById('input-address')?.value || '',
            currency_code: newCurrencyCode,
            currency_symbol: newCurrencySymbol
        };
        
        if (bannerUrl) updateFields.cover_url = bannerUrl;
        if (logoUrl) updateFields.logo_url = logoUrl;

        await supabaseClient.from('restaurant_settings').update(updateFields).eq('id', 1);

        if (logoUrl) {
            const navLogo = document.getElementById('nav-res-logo');
            const loginLogo = document.getElementById('login-res-logo');
            if (navLogo) navLogo.src = logoUrl;
            if (loginLogo) loginLogo.src = logoUrl;
            if (logoInput) logoInput.value = ""; 
        }
        if (bannerInput && bannerUrl) bannerInput.value = "";

        if (newCurrencyCode !== originalCurrencyCode) {
            openCurrencyConversionModal(originalCurrencyCode, newCurrencyCode);
        } else {
            alert("تم حفظ وتحديث الإعدادات بنجاح! ✨");
            loadAdminSystem();
        }
    } catch (err) {
        alert("حدث عطل: " + err.message);
    }
}

function openCurrencyConversionModal(oldCode, newCode) {
    const modal = document.getElementById('currencyConvertModal');
    const label = document.getElementById('exchange-rate-label');
    const rateInput = document.getElementById('input-exchange-rate');
    
    if (label && rateInput && modal) {
        label.innerText = `سعر الصرف الحالي (1 ${oldCode} كم يعادل بـ ${newCode}؟):`;
        rateInput.value = ""; 
        modal.style.display = 'flex';

        const btnSubmit = document.getElementById('btn-submit-auto-convert');
        const btnSkip = document.getElementById('btn-skip-convert');
        
        const newBtnSubmit = btnSubmit.cloneNode(true);
        const newBtnSkip = btnSkip.cloneNode(true);
        btnSubmit.parentNode.replaceChild(newBtnSubmit, btnSubmit);
        btnSkip.parentNode.replaceChild(newBtnSkip, btnSkip);

        newBtnSubmit.addEventListener('click', async () => {
            const rate = parseFloat(rateInput.value);
            if (isNaN(rate) || rate <= 0) {
                return alert("الرجاء إدخال سعر صرف صحيح وقيمته أكبر من الصفر!");
            }

            if (!confirm(`⚠️ تحذير أمني: هل أنت متأكد؟ سيتم تحويل أسعار جميع الوجبات والعروض بـ (${rate}) وتحديث السيرفر فوراً!`)) return;

            try {
                const { data: meals, error: fetchErr } = await supabaseClient.from('meals').select('id, price, offer_price');
                
                if (fetchErr) return alert("خطأ أثناء جلب الوجبات: " + fetchErr.message);

                if (meals && meals.length > 0) {
                    const updatedMeals = meals.map(m => ({
                        id: m.id,
                        price: Math.round((m.price * rate) * 100) / 100,
                        offer_price: m.offer_price ? Math.round((m.offer_price * rate) * 100) / 100 : null
                    }));

                    const { error: batchErr } = await supabaseClient.from('meals').upsert(updatedMeals);
                    if (batchErr) throw batchErr;
                }

                await supabaseClient.from('restaurant_settings').update({
                    last_exchange_rate: rate,
                    last_conversion_date: new Date().toISOString()
                }).eq('id', 1);

                alert("تم تحويل وتحديث أسعار كافة الوجبات والعروض بنجاح! 🚀💰");
                modal.style.display = 'none';
                loadAdminSystem();
            } catch (err) {
                alert("حدث خطأ غير متوقع أثناء معالجة التحويل الشامل: " + err.message);
            }
        });

        newBtnSkip.addEventListener('click', () => {
            alert("تم اعتماد العملة الجديدة بدون تعديل مالي تلقائي، يرجى مراجعة أسعار الوجبات وتحديثها يدوياً. 📝");
            modal.style.display = 'none';
            loadAdminSystem();
        });
    }
}

async function addAdminCategory() {
    const nameInput = document.getElementById('new-category-name');
    const nameTrInput = document.getElementById('new-category-name-tr');
    const nameEnInput = document.getElementById('new-category-name-en');
    
    if (!nameInput) return;
    const name = nameInput.value.trim();
    const name_tr = nameTrInput ? nameTrInput.value.trim() : '';
    const name_en = nameEnInput ? nameEnInput.value.trim() : '';

    if(!name) return alert("الرجاء كتابة اسم القسم بالعربية أولاً!");
    try {
        await supabaseClient.from('categories').insert([{ 
            name, 
            name_tr, 
            name_en, 
            sort_order: 5 
        }]);
        alert("تمت إضافة القسم الجديد بنجاح! 🎉");
        nameInput.value = "";
        if(nameTrInput) nameTrInput.value = "";
        if(nameEnInput) nameEnInput.value = "";
        loadAdminSystem();
    } catch (err) {
        console.error(err);
    }
}

async function deleteAdminCategory(catId, catName) {
    if (!confirm(`هل أنتِ متأكدة من حذف قسم "${catName}" بالكامل؟`)) return;

    try {
        const { data: relatedMeals } = await supabaseClient
            .from('meals')
            .select('id')
            .eq('category_id', catId);

        if (relatedMeals && relatedMeals.length > 0) {
            return alert(`🚨 لا يمكن حذف هذا القسم! يحتوي على (${relatedMeals.length}) وجبات حالياً. احذفي الوجبات التابعة له أولاً من لوحة المخزون.`);
        }

        const { error: deleteError } = await supabaseClient
            .from('categories')
            .delete()
            .eq('id', catId);

        if (deleteError) {
            alert("فشل حذف القسم: " + deleteError.message);
        } else {
            alert(`تم حذف قسم "${catName}" بنجاح! 🗑️✨`);
            loadAdminSystem();
        }
    } catch (err) {
        alert("حدث خطأ غير متوقع: " + err.message);
    }
}

// 🌟 دالة إضافة وجبة جديدة متضمنة ميزة قسم العروض والسعر الجديد
async function addAdminMeal() {
    const titleInput = document.getElementById('new-meal-title');
    const priceInput = document.getElementById('new-meal-price');
    const offerPriceInput = document.getElementById('new-meal-offer-price');
    const isOfferInput = document.getElementById('new-meal-is-offer');
    const descInput = document.getElementById('new-meal-desc');
    
    if (!titleInput || !priceInput) return;

    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    const offerPrice = offerPriceInput && offerPriceInput.value ? parseFloat(offerPriceInput.value) : null;
    const isOffer = isOfferInput ? isOfferInput.value === 'true' : false;
    const desc = descInput ? descInput.value.trim() : '';

    const title_tr = document.getElementById('new-meal-title-tr')?.value.trim() || '';
    const title_en = document.getElementById('new-meal-title-en')?.value.trim() || '';
    const description_tr = document.getElementById('new-meal-desc-tr')?.value.trim() || '';
    const description_en = document.getElementById('new-meal-desc-en')?.value.trim() || '';

    if(!title || isNaN(price)) {
        return alert("الرجاء تعبئة الحقول الأساسية: الاسم والسعر الأصلي!");
    }

    if(isOffer && (isNaN(offerPrice) || offerPrice === null)) {
        return alert("⚠️ في حال تفعيل الخصم/العرض، يجب إدخال سعر العرض الجديد!");
    }

    try {
        const box = document.getElementById('meal-category-select');
        let categoryId = box ? parseInt(box.value) : null;

        if (!categoryId || isNaN(categoryId)) {
            const { data: firstCat } = await supabaseClient.from('categories').select('id').limit(1).single();
            if (firstCat) {
                categoryId = firstCat.id;
            } else {
                return alert("🚨 لا يوجد أي أقسام مسجلة في قاعدة البيانات! أضف قسماً أولاً.");
            }
        }

        const mealInput = document.getElementById('new-meal-file');
        let finalImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';

        if (mealInput && mealInput.files && mealInput.files[0]) {
            const uploaded = await uploadToSupabaseStorage(mealInput.files[0], 'meals');
            if(uploaded) finalImg = uploaded;
        }

        const { error } = await supabaseClient.from('meals').insert([{
            category_id: categoryId,
            title: title,
            title_tr: title_tr,
            title_en: title_en,
            price: price, // السعر الأصلي (القديم المشطوب عند وجود عرض)
            offer_price: offerPrice, // السعر الجديد الخاص بالعرض
            is_offer: isOffer, // حالة هل الوجبة مضافة لقسم العروض
            image_url: finalImg,
            description: desc,
            description_tr: description_tr,
            description_en: description_en,
            is_available: true
        }]);

        if(error) {
            alert("فشل إضافة الوجبة: " + error.message);
        } else {
            alert("تمت إضافة الوجبة بنجاح! 🍔🔥");
            titleInput.value = "";
            priceInput.value = "";
            if (offerPriceInput) offerPriceInput.value = "";
            if (descInput) descInput.value = "";
            
            ['new-meal-title-tr', 'new-meal-title-en', 'new-meal-desc-tr', 'new-meal-desc-en'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            if(mealInput) mealInput.value = "";
            renderAdminStockDashboard();
        }
    } catch (err) {
        alert("خطأ برمجي: " + err.message);
    }
}

// 🌟 عرض لوحة إدارة الوجبات مع التحكم في قسم العروض والأسعار (السعر القديم والجديد)
async function renderAdminStockDashboard() {
    const container = document.getElementById('admin-stock-container');
    if (!container) return;
    
    container.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> جاري تحميل عناصر المخزون والعروض...</p>';

    try {
        const { data: meals, error } = await supabaseClient.from('meals').select('*').order('id', { ascending: false });
        
        if(error || !meals || meals.length === 0) {
            container.innerHTML = '<p class="loading-text">لا توجد وجبات حالياً.</p>';
            return;
        }

        let html = "";
        meals.forEach(meal => {
            const isAvailable = meal.is_available !== false;
            const isOffer = meal.is_offer === true;

            html += `
                <div class="stock-item-card" id="stock-card-${meal.id}" style="margin-bottom:15px; border-right: 4px solid ${isOffer ? '#e74c3c' : 'var(--border-luxury)'};">
                    <img src="${meal.image_url}" alt="${meal.title}" loading="lazy">
                    <div class="stock-details">
                        <div style="margin-bottom:8px;">
                            <label style="font-size:0.8rem; font-weight:bold;">الاسم (العربية / Türkçe / English):</label>
                            <input type="text" id="inline-title-${meal.id}" value="${meal.title || ''}" placeholder="الاسم بالعربي" style="margin-bottom:4px;">
                            <input type="text" id="inline-title-tr-${meal.id}" value="${meal.title_tr || ''}" placeholder="İsim Türkçe" style="margin-bottom:4px;">
                            <input type="text" id="inline-title-en-${meal.id}" value="${meal.title_en || ''}" placeholder="Name English">
                        </div>

                        <div style="margin-bottom:8px;">
                            <label style="font-size:0.8rem; font-weight:bold;">الوصف (العربية / Türkçe / English):</label>
                            <textarea id="inline-desc-${meal.id}" placeholder="الوصف بالعربي" style="margin-bottom:4px; height:45px; resize:none;">${meal.description || ''}</textarea>
                            <textarea id="inline-desc-tr-${meal.id}" placeholder="Açıklama Türkçe" style="margin-bottom:4px; height:45px; resize:none;">${meal.description_tr || ''}</textarea>
                            <textarea id="inline-desc-en-${meal.id}" placeholder="Description English" style="height:45px; resize:none;">${meal.description_en || ''}</textarea>
                        </div>

                        <!-- 🌟 التحكم في أسعار العروض (السعر الأصلي والسعر الخصم) -->
                        <div class="stock-action-inputs" style="display: flex; gap: 10px;">
                            <div style="flex:1;">
                                <label style="font-size:0.75rem;">السعر الأصلي / القديم (${currentCurrencySymbol}):</label>
                                <input type="number" id="inline-price-${meal.id}" value="${meal.price}">
                            </div>
                            <div style="flex:1;">
                                <label style="font-size:0.75rem; color: #e74c3c; font-weight:bold;">سعر العرض الجديد (${currentCurrencySymbol}):</label>
                                <input type="number" id="inline-offer-price-${meal.id}" value="${meal.offer_price || ''}" placeholder="مثال: 150">
                            </div>
                        </div>

                        <!-- 🌟 تفعيل العرض والحالة -->
                        <div class="stock-action-inputs" style="display: flex; gap: 10px; margin-top: 6px;">
                            <div style="flex:1;">
                                <label style="font-size:0.75rem;">إضافة لقسم العروض🏷️:</label>
                                <select id="inline-is-offer-${meal.id}">
                                    <option value="false" ${!isOffer ? 'selected' : ''}>❌ بدون عرض</option>
                                    <option value="true" ${isOffer ? 'selected' : ''}>🔥 عرض خاص</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label style="font-size:0.75rem;">حالة الوجبة:</label>
                                <select id="inline-status-${meal.id}">
                                    <option value="true" ${isAvailable ? 'selected' : ''}>🟢 متوفرة</option>
                                    <option value="false" ${!isAvailable ? 'selected' : ''}>🔴 غير متوفرة</option>
                                </select>
                            </div>
                        </div>

                        <div class="stock-buttons-group" style="margin-top: 10px;">
                            <button class="inline-save-btn" data-id="${meal.id}"><i class="fas fa-check"></i> حفظ التعديل</button>
                            <button class="inline-delete-btn" data-id="${meal.id}"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // 🌟 تطبيق حفظ التعديل لكل وجبة
        document.querySelectorAll('.inline-save-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const updatedTitle = document.getElementById(`inline-title-${id}`).value.trim();
                const updatedTitleTr = document.getElementById(`inline-title-tr-${id}`).value.trim();
                const updatedTitleEn = document.getElementById(`inline-title-en-${id}`).value.trim();
                
                const updatedDesc = document.getElementById(`inline-desc-${id}`).value.trim();
                const updatedDescTr = document.getElementById(`inline-desc-tr-${id}`).value.trim();
                const updatedDescEn = document.getElementById(`inline-desc-en-${id}`).value.trim();

                const newPrice = parseFloat(document.getElementById(`inline-price-${id}`).value);
                const rawOfferPrice = document.getElementById(`inline-offer-price-${id}`).value;
                const newOfferPrice = rawOfferPrice ? parseFloat(rawOfferPrice) : null;
                const isOfferVal = document.getElementById(`inline-is-offer-${id}`).value === 'true';
                const newStatus = document.getElementById(`inline-status-${id}`).value === 'true';
                
                if (isOfferVal && (isNaN(newOfferPrice) || newOfferPrice === null)) {
                    return alert("⚠️ يرجى تحديد سعر العرض الجديد عند تفعيل خيار العرض الخاص!");
                }

                const { error: updateErr } = await supabaseClient.from('meals').update({ 
                    title: updatedTitle,
                    title_tr: updatedTitleTr,
                    title_en: updatedTitleEn,
                    description: updatedDesc,
                    description_tr: updatedDescTr,
                    description_en: updatedDescEn,
                    price: newPrice,
                    offer_price: newOfferPrice,
                    is_offer: isOfferVal,
                    is_available: newStatus 
                }).eq('id', id);

                if(updateErr) {
                    alert("فشل التحديث: " + updateErr.message);
                } else {
                    alert("تم حفظ التعديلات والعروض بنجاح! ✔🔥");
                    renderAdminStockDashboard();
                }
            });
        });

        document.querySelectorAll('.inline-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if(confirm("هل أنن متأكد من حذف هذه الوجبة؟")) {
                    await supabaseClient.from('meals').delete().eq('id', id);
                    alert("تم الحذف بنجاح!");
                    document.getElementById(`stock-card-${id}`).remove();
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
}
