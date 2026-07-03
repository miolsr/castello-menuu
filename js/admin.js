

import { supabaseClient } from './dataProvider.js';
import { applySavedTheme, toggleTheme } from './config.js';

let originalCurrencyCode = 'TRY';
let currentCurrencySymbol = 'TL';

window.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    
    // 🌟 تشغيل جلب اللوغو فوراً عند فتح الصفحة ليظهر في شاشة تسجيل الدخول بدون أخطاء اتصال
    loadInitialRestaurantLogo();

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    const loginBtn = document.getElementById('btn-do-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginAdminUser);
    }
    
    document.getElementById('btn-save-settings').addEventListener('click', saveAdminSettings);
    document.getElementById('btn-add-category').addEventListener('click', addAdminCategory);
    document.getElementById('btn-add-meal').addEventListener('click', addAdminMeal);
});

// 🌟 دالة جلب اللوغو المبدئي النظيفة والمصححة تماماً
async function loadInitialRestaurantLogo() {
    try {
        const { data: settings } = await supabaseClient.from('restaurant_settings').select('logo_url').eq('id', 1).single();
        
        const navLogo = document.getElementById('nav-res-logo');
        const loginLogo = document.getElementById('login-res-logo');

        if (settings && settings.logo_url) {
            // إذا وجدنا رابط الشعار الحقيقي في قاعدة البيانات، نقوم بوضعه فوراً
            if (navLogo) navLogo.src = settings.logo_url;
            if (loginLogo) loginLogo.src = settings.logo_url;
        } else {
            // 🛠️ الحل الذكي بدون روابط خارجية مكسورة: إذا كان اللوغو فارغاً في السيرفر، نعطيه صورة بيكسل شفافة مؤقتاً لئلا يظهر مربع مكسور
            const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            if (navLogo) navLogo.src = transparentPixel;
            if (loginLogo) loginLogo.src = transparentPixel;
        }
    } catch (err) {
        console.error("خطأ أثناء جلب اللوغو المبدئي:", err);
    }
}

async function loginAdminUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

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
        const { data: settings, error: settingsError } = await supabaseClient.from('restaurant_settings').select('*').eq('id', 1).single();
        if(settings) {
            document.getElementById('input-res-name').value = settings.restaurant_name || '';
            document.getElementById('input-res-status').value = settings.is_open ? "true" : "false";
            document.getElementById('input-working-hours').value = settings.working_hours || "";
            document.getElementById('input-whatsapp').value = settings.whatsapp_number || '';
            document.getElementById('input-maps').value = settings.google_maps_link || '';
            document.getElementById('input-address').value = settings.address || "";
            
            // تحديث الشعار في الواجهات عند تحميل النظام الكامل
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

        const { data: categories, error: catError } = await supabaseClient.from('categories').select('*').order('id', { ascending: true });
        
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
        const { data, error } = await supabaseClient.storage.from(bucketName).upload(uniqName, fileObject, {
            contentType: fileObject.type,
            cacheControl: '3600',
            upsert: true
        });
        if (error) return null;
        const { data: publicUrlData } = supabaseClient.storage.from(bucketName).getPublicUrl(uniqName);
        return publicUrlData.publicUrl;
    } catch (e) {
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

        const currencySelectValue = document.getElementById('input-currency-select').value;
        const [newCurrencyCode, newCurrencySymbol] = currencySelectValue.split('|');

        const updateFields = {
            restaurant_name: document.getElementById('input-res-name').value,
            is_open: document.getElementById('input-res-status').value === "true",
            working_hours: document.getElementById('input-working-hours').value,
            whatsapp_number: document.getElementById('input-whatsapp').value,
            google_maps_link: document.getElementById('input-maps').value,
            address: document.getElementById('input-address').value,
            currency_code: newCurrencyCode,
            currency_symbol: newCurrencySymbol
        };
        
        if (bannerUrl) updateFields.cover_url = bannerUrl;
        if (logoUrl) updateFields.logo_url = logoUrl;

        await supabaseClient.from('restaurant_settings').update(updateFields).eq('id', 1);

        // 🌟 الـتـحـديـث الـفـوري الـمـبـاشـر: نمرر رابط السيرفر الصافي المرفوع إلى عناصر الـ HTML فوراً ليعرض الشعار الحقيقي دون فراغات
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

            if (!confirm(`⚠️ تحذير أمني: هل أنت متأكد؟ سيتم تحويل أسعار جميع الوجبات في قاعدة البيانات بـ (${rate}) وتحديث السيرفر فوراً!`)) return;

            try {
                const { data: meals, error: fetchErr } = await supabaseClient.from('meals').select('id');
                
                if (fetchErr) {
                    return alert("خطأ أثناء جلب الوجبات: " + fetchErr.message);
                }

                if (meals && meals.length > 0) {
                    for (let meal of meals) {
                        const priceInput = document.getElementById(`inline-price-${meal.id}`);
                        if (!priceInput) continue; 
                        
                        const currentPriceInScreen = parseFloat(priceInput.value);
                        if (isNaN(currentPriceInScreen)) continue;

                        const newPrice = Math.round((currentPriceInScreen * rate) * 100) / 100;
                        const stringMealId = String(meal.id).trim();
                        
                        await supabaseClient
                            .from('meals')
                            .update({ price: newPrice })
                            .eq('id', stringMealId);
                    }
                }

                await supabaseClient.from('restaurant_settings').update({
                    last_exchange_rate: rate,
                    last_conversion_date: new Date().toISOString()
                }).eq('id', 1);

                alert("تم تحويل وتحديث أسعار كافة الوجبات في قاعدة البيانات بنجاح! 🚀💰");
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
    const name = document.getElementById('new-category-name').value.trim();
    const nameTrInput = document.getElementById('new-category-name-tr');
    const nameEnInput = document.getElementById('new-category-name-en');
    
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
        document.getElementById('new-category-name').value = "";
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
        const { data: relatedMeals, error: checkError } = await supabaseClient
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

async function addAdminMeal() {
    const title = document.getElementById('new-meal-title').value.trim();
    const price = parseFloat(document.getElementById('new-meal-price').value);
    const desc = document.getElementById('new-meal-desc').value.trim();
    
    const titleTrInput = document.getElementById('new-meal-title-tr');
    const titleEnInput = document.getElementById('new-meal-title-en');
    const descTrInput = document.getElementById('new-meal-desc-tr');
    const descEnInput = document.getElementById('new-meal-desc-en');

    const title_tr = titleTrInput ? titleTrInput.value.trim() : '';
    const title_en = titleEnInput ? titleEnInput.value.trim() : '';
    const description_tr = descTrInput ? descTrInput.value.trim() : '';
    const description_en = descEnInput ? descEnInput.value.trim() : '';

    if(!title || isNaN(price)) {
        return alert("الرجاء تعبئة الحقول الأساسية: الاسم والسعر!");
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
            price: price,
            image_url: finalImg,
            description: desc,
            description_tr: description_tr,
            description_en: description_en,
            is_available: true
        }]);

        if(error) {
            alert("فشل إضافة الوجبة: " + error.message);
        } else {
            alert("تمت إضافة الوجبة الجديدة للمنيو بنجاح! 🍔🔥");
            document.getElementById('new-meal-title').value = "";
            document.getElementById('new-meal-price').value = "";
            document.getElementById('new-meal-desc').value = "";
            if(titleTrInput) titleTrInput.value = "";
            if(titleEnInput) titleEnInput.value = "";
            if(descTrInput) descTrInput.value = "";
            if(descEnInput) descEnInput.value = "";
            if(mealInput) mealInput.value = "";
            renderAdminStockDashboard();
        }
    } catch (err) {
        alert("خطأ برمجي: " + err.message);
    }
}

async function renderAdminStockDashboard() {
    const container = document.getElementById('admin-stock-container');
    container.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> جاري تحميل عناصر المخزون...</p>';

    try {
        const { data: meals, error } = await supabaseClient.from('meals').select('*').order('id', { ascending: false });
        
        if(error || !meals || meals.length === 0) {
            container.innerHTML = '<p class="loading-text">لا توجد وجبات حالياً.</p>';
            return;
        }

        let html = "";
        meals.forEach(meal => {
            const isAvailable = meal.is_available !== false;
            html += `
                <div class="stock-item-card" id="stock-card-${meal.id}" style="margin-bottom:15px;">
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

                        <div class="stock-action-inputs">
                            <label>السعر (${currentCurrencySymbol}):</label>
                            <input type="number" id="inline-price-${meal.id}" value="${meal.price}">
                        </div>
                        <div class="stock-action-inputs">
                            <label>الحالة:</label>
                            <select id="inline-status-${meal.id}">
                                <option value="true" ${isAvailable ? 'selected' : ''}>🟢 متوفرة</option>
                                <option value="false" ${!isAvailable ? 'selected' : ''}>🔴 غير متوفرة</option>
                            </select>
                        </div>
                        <div class="stock-buttons-group">
                            <button class="inline-save-btn" data-id="${meal.id}"><i class="fas fa-check"></i> حفظ التعديل</button>
                            <button class="inline-delete-btn" data-id="${meal.id}"><i class="fas fa-trash"></i> حذف</button>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

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
                const newStatus = document.getElementById(`inline-status-${id}`).value === 'true';
                
                const { error: updateErr } = await supabaseClient.from('meals').update({ 
                    title: updatedTitle,
                    title_tr: updatedTitleTr,
                    title_en: updatedTitleEn,
                    description: updatedDesc,
                    description_tr: updatedDescTr,
                    description_en: updatedDescEn,
                    price: newPrice, 
                    is_available: newStatus 
                }).eq('id', id);

                if(updateErr) {
                    alert("فشل التحديث: " + updateErr.message);
                } else {
                    alert("تم حفظ التعديلات والترجمات بنجاح! ✔🔥");
                }
            });
        });

        document.querySelectorAll('.inline-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if(confirm("هل أنتِ متأكدة من حذف هذه الوجبة?")) {
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