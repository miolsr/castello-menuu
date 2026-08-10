import { supabaseClient } from './dataProvider.js';
import { applySavedTheme, toggleTheme } from './config.js';

let originalCurrencyCode = 'TRY';
let currentCurrencySymbol = 'TL';


// ==========================================
// تشغيل لوحة الإدارة
// ==========================================

window.addEventListener('DOMContentLoaded', async () => {

    applySavedTheme();

    // تحميل اللوغو قبل تسجيل الدخول
    loadInitialRestaurantLogo();

    /*
     * مهم:
     * لا نقوم بفتح لوحة الإدارة تلقائياً بسبب session قديمة.
     * شاشة تسجيل الدخول يجب أن تبقى ظاهرة دائماً عند فتح admin.html.
     */
    await checkUserSession();

    // زر الثيم
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // زر تسجيل الدخول
    const loginBtn = document.getElementById('btn-do-login');

    if (loginBtn) {
        loginBtn.addEventListener('click', loginAdminUser);
    }

    // حفظ الإعدادات
    const saveSettingsBtn =
        document.getElementById('btn-save-settings');

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveAdminSettings);
    }

    // إضافة قسم
    const addCatBtn =
        document.getElementById('btn-add-category');

    if (addCatBtn) {
        addCatBtn.addEventListener('click', addAdminCategory);
    }

    // إضافة وجبة
    const addMealBtn =
        document.getElementById('btn-add-meal');

    if (addMealBtn) {
        addMealBtn.addEventListener('click', addAdminMeal);
    }
});


// ==========================================
// التحقق من الجلسة
// ==========================================

async function checkUserSession() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(
                'خطأ في قراءة جلسة المستخدم:',
                error.message
            );
        }

        /*
         * حتى لو كانت هناك session:
         *
         * لا نفتح لوحة الإدارة تلقائياً.
         * المستخدم يجب أن يمر عبر تسجيل الدخول.
         */

        const loginOverlay =
            document.getElementById('loginOverlay');

        const adminContent =
            document.getElementById('adminContent');

        if (loginOverlay) {
            loginOverlay.style.display = 'flex';
        }

        if (adminContent) {
            adminContent.style.display = 'none';
        }

        console.log(
            session
                ? 'تم العثور على جلسة محفوظة، لكن تم إبقاء شاشة الدخول ظاهرة.'
                : 'لا توجد جلسة دخول محفوظة.'
        );

    } catch (err) {

        console.error(
            'خطأ في التحقق من الجلسة:',
            err
        );

        const loginOverlay =
            document.getElementById('loginOverlay');

        const adminContent =
            document.getElementById('adminContent');

        if (loginOverlay) {
            loginOverlay.style.display = 'flex';
        }

        if (adminContent) {
            adminContent.style.display = 'none';
        }
    }
}


// ==========================================
// تحميل اللوغو
// ==========================================

async function loadInitialRestaurantLogo() {

    try {

        const {
            data: settings,
            error
        } = await supabaseClient
            .from('restaurant_settings')
            .select('logo_url')
            .eq('id', 1)
            .single();

        if (error) {
            console.error(
                'خطأ في جلب اللوغو:',
                error.message
            );
        }

        const navLogo =
            document.getElementById('nav-res-logo');

        const loginLogo =
            document.getElementById('login-res-logo');

        if (settings && settings.logo_url) {

            if (navLogo) {
                navLogo.src = settings.logo_url;
            }

            if (loginLogo) {
                loginLogo.src = settings.logo_url;
            }

        } else {

            const transparentPixel =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

            if (navLogo) {
                navLogo.src = transparentPixel;
            }

            if (loginLogo) {
                loginLogo.src = transparentPixel;
            }
        }

    } catch (err) {

        console.error(
            'خطأ أثناء جلب اللوغو المبدئي:',
            err
        );
    }
}


// ==========================================
// تسجيل دخول الإدارة
// ==========================================

async function loginAdminUser() {

    const emailInput =
        document.getElementById('login-email');

    const passwordInput =
        document.getElementById('login-password');

    if (!emailInput || !passwordInput) {
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();

    if (!email || !password) {

        return alert(
            'الرجاء إدخال البريد الإلكتروني وكلمة المرور للإدارة!'
        );
    }

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {

            console.error(
                'خطأ تسجيل الدخول:',
                error
            );

            return alert(
                'فشل التحقق: ' +
                error.message +
                ' ❌'
            );
        }

        if (data && data.user) {

            const loginOverlay =
                document.getElementById('loginOverlay');

            const adminContent =
                document.getElementById('adminContent');

            if (loginOverlay) {
                loginOverlay.style.display = 'none';
            }

            if (adminContent) {
                adminContent.style.display = 'block';
            }

            alert(
                'مرحباً بك، تم تسجيل الدخول بنجاح!'
            );

            await loadAdminSystem();
        }

    } catch (err) {

        console.error(
            'استثناء أثناء تسجيل الدخول:',
            err
        );

        alert(
            'حدث خطأ في النظام أثناء الاتصال بالسيرفر!'
        );
    }
}


// ==========================================
// تحميل لوحة الإدارة
// ==========================================

async function loadAdminSystem() {

    try {

        // ==================================
        // إعدادات المطعم
        // ==================================

        const {
            data: settings,
            error: settingsError
        } = await supabaseClient
            .from('restaurant_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (settingsError) {

            console.error(
                'خطأ في جلب إعدادات المطعم:',
                settingsError.message
            );

        } else if (settings) {

            const resName =
                document.getElementById('input-res-name');

            const resStatus =
                document.getElementById('input-res-status');

            const workingHours =
                document.getElementById('input-working-hours');

            const whatsapp =
                document.getElementById('input-whatsapp');

            const maps =
                document.getElementById('input-maps');

            const address =
                document.getElementById('input-address');


            if (resName) {
                resName.value =
                    settings.restaurant_name || '';
            }

            if (resStatus) {
                resStatus.value =
                    settings.is_open ? 'true' : 'false';
            }

            if (workingHours) {
                workingHours.value =
                    settings.working_hours || '';
            }

            if (whatsapp) {
                whatsapp.value =
                    settings.whatsapp_number || '';
            }

            if (maps) {
                maps.value =
                    settings.google_maps_link || '';
            }

            if (address) {
                address.value =
                    settings.address || '';
            }


            // اللوغو
            if (settings.logo_url) {

                const navLogo =
                    document.getElementById('nav-res-logo');

                const loginLogo =
                    document.getElementById('login-res-logo');

                if (navLogo) {
                    navLogo.src =
                        settings.logo_url;
                }

                if (loginLogo) {
                    loginLogo.src =
                        settings.logo_url;
                }
            }


            // العملة
            if (
                settings.currency_code &&
                settings.currency_symbol
            ) {

                originalCurrencyCode =
                    settings.currency_code;

                currentCurrencySymbol =
                    settings.currency_symbol;

                const selectBox =
                    document.getElementById(
                        'input-currency-select'
                    );

                if (selectBox) {

                    selectBox.value =
                        `${settings.currency_code}|${settings.currency_symbol}`;
                }
            }


            // تاريخ التحويل
            const historyBox =
                document.getElementById(
                    'currency-history-info'
                );

            if (
                historyBox &&
                settings.last_conversion_date
            ) {

                const formattedDate =
                    new Date(
                        settings.last_conversion_date
                    ).toLocaleString(
                        'ar-SY',
                        {
                            hour12: true
                        }
                    );

                historyBox.innerHTML =
                    `<i class="fas fa-clock"></i>
                    آخر تحويل أسعار شامل:
                    <b>${settings.last_exchange_rate}</b>
                    بتاريخ ${formattedDate}`;

            } else if (historyBox) {

                historyBox.innerHTML =
                    `<i class="fas fa-info-circle"></i>
                    لم يتم إجراء عمليات تحويل صرف تلقائية سابقة.`;
            }
        }


        // ==================================
        // جلب الأقسام
        // ==================================

        const {
            data: categories,
            error: categoriesError
        } = await supabaseClient
            .from('categories')
            .select('*')
            .order('sort_order', {
                ascending: true,
                nullsFirst: false
            })
            .order('id', {
                ascending: true
            });


        if (categoriesError) {

            console.error(
                'خطأ في جلب الأقسام:',
                categoriesError.message
            );

        } else {

            renderCategorySelect(categories || []);

            renderCategoryManagement(categories || []);
        }


        // ==================================
        // تحميل المخزون
        // ==================================

        await renderAdminStockDashboard();

    } catch (err) {

        console.error(
            'خطأ عام في تحميل لوحة الإدارة:',
            err
        );
    }
}


// ==========================================
// إنشاء قائمة الأقسام
// ==========================================

function renderCategorySelect(categories) {

    const box =
        document.getElementById(
            'meal-category-select'
        );

    if (!box) {
        return;
    }

    if (!categories.length) {

        box.innerHTML =
            `<option value="">
                لا توجد أقسام - أضف قسماً أولاً
            </option>`;

        return;
    }

    box.innerHTML =
        `<option value="">
            اختر القسم
        </option>` +
        categories.map(category => {

            return `
                <option value="${category.id}">
                    ${escapeHtml(category.name || '')}
                </option>
            `;

        }).join('');
}


// ==========================================
// إدارة الأقسام
// ==========================================

function renderCategoryManagement(categories) {

    const box =
        document.getElementById(
            'admin-categories-list'
        );

    if (!box) {
        return;
    }

    if (!categories.length) {

        box.innerHTML =
            `<p class="loading-text">
                لا توجد أقسام حالياً.
            </p>`;

        return;
    }

    let html = '';

    categories.forEach(category => {

        html += `
            <div
                class="form-inline"
                style="
                    margin-bottom:8px;
                    justify-content:space-between;
                    align-items:center;
                    background:var(--bg-deep-prime);
                    padding:8px;
                    border-radius:6px;
                    border:1px solid var(--border-luxury);
                "
            >

                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:2px;
                    "
                >

                    <span
                        style="
                            font-size:0.85rem;
                            font-weight:700;
                        "
                    >
                        العربية:
                        ${escapeHtml(category.name || '')}
                    </span>

                    <span
                        style="
                            font-size:0.75rem;
                            color:var(--text-dimmed);
                        "
                    >
                        Türkçe:
                        ${escapeHtml(category.name_tr || '—')}
                        |
                        English:
                        ${escapeHtml(category.name_en || '—')}
                    </span>

                </div>

                <button
                    class="inline-delete-btn delete-cat-btn"
                    data-id="${category.id}"
                    data-name="${escapeAttribute(category.name || '')}"
                    style="padding:4px 8px;"
                >
                    <i class="fas fa-trash"></i>
                    مسح
                </button>

            </div>
        `;
    });

    box.innerHTML = html;


    document
        .querySelectorAll('.delete-cat-btn')
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => deleteAdminCategory(
                    btn.dataset.id,
                    btn.dataset.name
                )
            );

        });
}


// ==========================================
// رفع الملفات إلى Supabase Storage
// ==========================================

async function uploadToSupabaseStorage(
    fileObject,
    bucketName
) {

    if (!fileObject) {
        return null;
    }

    try {

        const extension =
            fileObject.name
                .split('.')
                .pop()
                .toLowerCase();

        const uniqueName =
            `file_${Date.now()}_${Math.floor(
                Math.random() * 10000
            )}.${extension}`;


        const {
            error
        } = await supabaseClient
            .storage
            .from(bucketName)
            .upload(
                uniqueName,
                fileObject,
                {
                    contentType:
                        fileObject.type,
                    cacheControl:
                        '3600',
                    upsert: true
                }
            );


        if (error) {

            console.error(
                'خطأ الرفع للستوريدج:',
                error.message
            );

            alert(
                `فشل رفع الملف: ${error.message}`
            );

            return null;
        }


        const {
            data: publicUrlData
        } =
            supabaseClient
                .storage
                .from(bucketName)
                .getPublicUrl(uniqueName);


        return publicUrlData.publicUrl;

    } catch (err) {

        console.error(
            'استثناء أثناء الرفع:',
            err
        );

        return null;
    }
}


// ==========================================
// حفظ إعدادات المطعم
// ==========================================

async function saveAdminSettings() {

    try {

        const bannerInput =
            document.getElementById(
                'input-banner-file'
            );

        let bannerUrl = null;

        if (
            bannerInput &&
            bannerInput.files &&
            bannerInput.files[0]
        ) {

            bannerUrl =
                await uploadToSupabaseStorage(
                    bannerInput.files[0],
                    'banners'
                );
        }


        const logoInput =
            document.getElementById(
                'input-logo-file'
            );

        let logoUrl = null;

        if (
            logoInput &&
            logoInput.files &&
            logoInput.files[0]
        ) {

            logoUrl =
                await uploadToSupabaseStorage(
                    logoInput.files[0],
                    'restaurant-assets'
                );
        }


        const currencySelect =
            document.getElementById(
                'input-currency-select'
            );


        const [
            newCurrencyCode,
            newCurrencySymbol
        ] =
            currencySelect
                ? currencySelect.value.split('|')
                : [
                    originalCurrencyCode,
                    currentCurrencySymbol
                ];


        const updateFields = {

            restaurant_name:
                document.getElementById(
                    'input-res-name'
                )?.value || '',

            is_open:
                document.getElementById(
                    'input-res-status'
                )?.value === 'true',

            working_hours:
                document.getElementById(
                    'input-working-hours'
                )?.value || '',

            whatsapp_number:
                document.getElementById(
                    'input-whatsapp'
                )?.value || '',

            google_maps_link:
                document.getElementById(
                    'input-maps'
                )?.value || '',

            address:
                document.getElementById(
                    'input-address'
                )?.value || '',

            currency_code:
                newCurrencyCode,

            currency_symbol:
                newCurrencySymbol
        };


        if (bannerUrl) {
            updateFields.cover_url =
                bannerUrl;
        }

        if (logoUrl) {
            updateFields.logo_url =
                logoUrl;
        }


        const {
            error: updateError
        } =
            await supabaseClient
                .from('restaurant_settings')
                .update(updateFields)
                .eq('id', 1);


        if (updateError) {

            throw new Error(
                updateError.message
            );
        }


        // تحديث اللوغو مباشرة
        if (logoUrl) {

            const navLogo =
                document.getElementById(
                    'nav-res-logo'
                );

            const loginLogo =
                document.getElementById(
                    'login-res-logo'
                );

            if (navLogo) {
                navLogo.src = logoUrl;
            }

            if (loginLogo) {
                loginLogo.src = logoUrl;
            }

            if (logoInput) {
                logoInput.value = '';
            }
        }


        if (
            bannerInput &&
            bannerUrl
        ) {
            bannerInput.value = '';
        }


        // تغيير العملة
        if (
            newCurrencyCode !==
            originalCurrencyCode
        ) {

            openCurrencyConversionModal(
                originalCurrencyCode,
                newCurrencyCode
            );

        } else {

            alert(
                'تم حفظ وتحديث الإعدادات بنجاح!'
            );

            await loadAdminSystem();
        }

    } catch (err) {

        console.error(
            'خطأ حفظ الإعدادات:',
            err
        );

        alert(
            'حدث عطل أثناء حفظ الإعدادات:\n' +
            err.message
        );
    }
}


// ==========================================
// نافذة تحويل العملة
// ==========================================

function openCurrencyConversionModal(
    oldCode,
    newCode
) {

    const modal =
        document.getElementById(
            'currencyConvertModal'
        );

    const label =
        document.getElementById(
            'exchange-rate-label'
        );

    const rateInput =
        document.getElementById(
            'input-exchange-rate'
        );

    if (
        !label ||
        !rateInput ||
        !modal
    ) {
        return;
    }


    label.innerText =
        `سعر الصرف الحالي (1 ${oldCode} كم يعادل بـ ${newCode}؟):`;

    rateInput.value = '';

    modal.style.display = 'flex';


    const btnSubmit =
        document.getElementById(
            'btn-submit-auto-convert'
        );

    const btnSkip =
        document.getElementById(
            'btn-skip-convert'
        );


    if (!btnSubmit || !btnSkip) {
        return;
    }


    // منع تكرار event listeners
    const newBtnSubmit =
        btnSubmit.cloneNode(true);

    const newBtnSkip =
        btnSkip.cloneNode(true);


    btnSubmit.parentNode.replaceChild(
        newBtnSubmit,
        btnSubmit
    );

    btnSkip.parentNode.replaceChild(
        newBtnSkip,
        btnSkip
    );


    newBtnSubmit.addEventListener(
        'click',
        async () => {

            const rate =
                parseFloat(
                    rateInput.value
                );


            if (
                isNaN(rate) ||
                rate <= 0
            ) {

                return alert(
                    'الرجاء إدخال سعر صرف صحيح وقيمته أكبر من الصفر!'
                );
            }


            if (
                !confirm(
                    `⚠️ تحذير: سيتم تحويل أسعار جميع الوجبات والعروض بمعدل (${rate}). هل أنت متأكد؟`
                )
            ) {
                return;
            }


            try {

                const {
                    data: meals,
                    error: fetchErr
                } =
                    await supabaseClient
                        .from('meals')
                        .select(
                            'id, price, offer_price'
                        );


                if (fetchErr) {
                    throw fetchErr;
                }


                if (
                    meals &&
                    meals.length > 0
                ) {

                    const updatedMeals =
                        meals.map(meal => {

                            const oldPrice =
                                Number(meal.price) || 0;

                            const oldOfferPrice =
                                Number(
                                    meal.offer_price
                                ) || 0;


                            return {

                                id: meal.id,

                                price:
                                    Math.round(
                                        oldPrice *
                                        rate *
                                        100
                                    ) / 100,

                                offer_price:
                                    meal.offer_price !== null &&
                                    meal.offer_price !== undefined &&
                                    meal.offer_price !== ''
                                        ? Math.round(
                                            oldOfferPrice *
                                            rate *
                                            100
                                        ) / 100
                                        : null
                            };
                        });


                    const {
                        error: batchErr
                    } =
                        await supabaseClient
                            .from('meals')
                            .upsert(
                                updatedMeals,
                                {
                                    onConflict: 'id'
                                }
                            );


                    if (batchErr) {
                        throw batchErr;
                    }
                }


                const {
                    error: settingsError
                } =
                    await supabaseClient
                        .from('restaurant_settings')
                        .update({
                            last_exchange_rate:
                                rate,
                            last_conversion_date:
                                new Date().toISOString()
                        })
                        .eq('id', 1);


                if (settingsError) {
                    throw settingsError;
                }


                alert(
                    'تم تحويل وتحديث أسعار كافة الوجبات والعروض بنجاح!'
                );


                modal.style.display = 'none';

                await loadAdminSystem();

            } catch (err) {

                console.error(
                    'خطأ التحويل:',
                    err
                );

                alert(
                    'حدث خطأ أثناء معالجة التحويل الشامل:\n' +
                    err.message
                );
            }
        }
    );


    newBtnSkip.addEventListener(
        'click',
        async () => {

            alert(
                'تم اعتماد العملة الجديدة بدون تعديل مالي تلقائي، يرجى مراجعة أسعار الوجبات وتحديثها يدوياً.'
            );

            modal.style.display = 'none';

            await loadAdminSystem();
        }
    );
}


// ==========================================
// إضافة قسم
// ==========================================

async function addAdminCategory() {

    const nameInput =
        document.getElementById(
            'new-category-name'
        );

    const nameTrInput =
        document.getElementById(
            'new-category-name-tr'
        );

    const nameEnInput =
        document.getElementById(
            'new-category-name-en'
        );


    if (!nameInput) {
        return;
    }


    const name =
        nameInput.value.trim();

    const name_tr =
        nameTrInput
            ? nameTrInput.value.trim()
            : '';

    const name_en =
        nameEnInput
            ? nameEnInput.value.trim()
            : '';


    if (!name) {

        return alert(
            'الرجاء كتابة اسم القسم بالعربية أولاً!'
        );
    }


    try {

        const {
            data: existingCategories,
            error: fetchError
        } =
            await supabaseClient
                .from('categories')
                .select('sort_order')
                .order('sort_order', {
                    ascending: false,
                    nullsFirst: false
                })
                .limit(1);


        if (fetchError) {
            throw fetchError;
        }


        const lastSort =
            existingCategories &&
            existingCategories.length > 0
                ? Number(
                    existingCategories[0].sort_order
                ) || 0
                : 0;


        const {
            error
        } =
            await supabaseClient
                .from('categories')
                .insert([{
                    name,
                    name_tr,
                    name_en,
                    sort_order: lastSort + 1
                }]);


        if (error) {
            throw error;
        }


        alert(
            'تمت إضافة القسم الجديد بنجاح!'
        );


        nameInput.value = '';

        if (nameTrInput) {
            nameTrInput.value = '';
        }

        if (nameEnInput) {
            nameEnInput.value = '';
        }


        await loadAdminSystem();

    } catch (err) {

        console.error(
            'خطأ إضافة القسم:',
            err
        );

        alert(
            'فشل إضافة القسم:\n' +
            err.message
        );
    }
}


// ==========================================
// حذف قسم
// ==========================================

async function deleteAdminCategory(
    catId,
    catName
) {

    if (
        !confirm(
            `هل أنتِ متأكدة من حذف قسم "${catName}" بالكامل؟`
        )
    ) {
        return;
    }


    try {

        const {
            data: relatedMeals,
            error: mealsError
        } =
            await supabaseClient
                .from('meals')
                .select('id')
                .eq('category_id', catId);


        if (mealsError) {
            throw mealsError;
        }


        if (
            relatedMeals &&
            relatedMeals.length > 0
        ) {

            return alert(
                `لا يمكن حذف هذا القسم! يحتوي على (${relatedMeals.length}) وجبات حالياً. انقلي الوجبات إلى قسم آخر أو احذفيها أولاً.`
            );
        }


        const {
            error: deleteError
        } =
            await supabaseClient
                .from('categories')
                .delete()
                .eq('id', catId);


        if (deleteError) {
            throw deleteError;
        }


        alert(
            `تم حذف قسم "${catName}" بنجاح!`
        );


        await loadAdminSystem();

    } catch (err) {

        console.error(
            'خطأ حذف القسم:',
            err
        );

        alert(
            'فشل حذف القسم:\n' +
            err.message
        );
    }
}


// ==========================================
// إضافة وجبة جديدة
// ==========================================

async function addAdminMeal() {

    const titleInput =
        document.getElementById(
            'new-meal-title'
        );

    const priceInput =
        document.getElementById(
            'new-meal-price'
        );

    const offerPriceInput =
        document.getElementById(
            'new-meal-offer-price'
        );

    const isOfferInput =
        document.getElementById(
            'new-meal-is-offer'
        );

    const descInput =
        document.getElementById(
            'new-meal-desc'
        );


    if (
        !titleInput ||
        !priceInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();

    const price =
        parseFloat(
            priceInput.value
        );


    const rawOfferPrice =
        offerPriceInput
            ? offerPriceInput.value.trim()
            : '';


    const offerPrice =
        rawOfferPrice !== ''
            ? parseFloat(rawOfferPrice)
            : null;


    const isOffer =
        isOfferInput
            ? isOfferInput.value === 'true'
            : false;


    const desc =
        descInput
            ? descInput.value.trim()
            : '';


    const title_tr =
        document
            .getElementById(
                'new-meal-title-tr'
            )
            ?.value.trim() || '';


    const title_en =
        document
            .getElementById(
                'new-meal-title-en'
            )
            ?.value.trim() || '';


    const description_tr =
        document
            .getElementById(
                'new-meal-desc-tr'
            )
            ?.value.trim() || '';


    const description_en =
        document
            .getElementById(
                'new-meal-desc-en'
            )
            ?.value.trim() || '';


    // ==================================
    // التحقق
    // ==================================

    if (
        !title ||
        isNaN(price) ||
        price <= 0
    ) {

        return alert(
            'الرجاء تعبئة الاسم والسعر الأصلي بشكل صحيح!'
        );
    }


    if (
        isOffer &&
        (
            offerPrice === null ||
            isNaN(offerPrice) ||
            offerPrice <= 0
        )
    ) {

        return alert(
            '⚠️ عند تفعيل العرض يجب إدخال سعر العرض الجديد بشكل صحيح!'
        );
    }


    if (
        isOffer &&
        offerPrice >= price
    ) {

        return alert(
            '⚠️ سعر العرض يجب أن يكون أقل من السعر الأصلي.'
        );
    }


    try {

        // ==================================
        // القسم
        // ==================================

        const categoryBox =
            document.getElementById(
                'meal-category-select'
            );


        let categoryId =
            categoryBox
                ? categoryBox.value
                : '';


        if (!categoryId) {

            const {
                data: firstCategory,
                error: firstCatError
            } =
                await supabaseClient
                    .from('categories')
                    .select('id')
                    .order('sort_order', {
                        ascending: true
                    })
                    .limit(1)
                    .maybeSingle();


            if (firstCatError) {
                throw firstCatError;
            }


            if (firstCategory) {

                categoryId =
                    firstCategory.id;

            } else {

                return alert(
                    'لا يوجد أي قسم مسجل. أضيفي قسماً أولاً.'
                );
            }
        }


        // ==================================
        // صورة الوجبة
        // ==================================

        const mealInput =
            document.getElementById(
                'new-meal-file'
            );


        let finalImg =
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';


        if (
            mealInput &&
            mealInput.files &&
            mealInput.files[0]
        ) {

            const uploaded =
                await uploadToSupabaseStorage(
                    mealInput.files[0],
                    'meals'
                );


            if (uploaded) {
                finalImg = uploaded;
            }
        }


        // ==================================
        // البيانات
        // ==================================

        const mealData = {

            category_id:
                categoryId,

            title:
                title,

            title_tr:
                title_tr,

            title_en:
                title_en,

            price:
                price,

            offer_price:
                isOffer
                    ? offerPrice
                    : null,

            is_offer:
                isOffer,

            image_url:
                finalImg,

            description:
                desc,

            description_tr:
                description_tr,

            description_en:
                description_en,

            is_available:
                true
        };


        const {
            error
        } =
            await supabaseClient
                .from('meals')
                .insert([mealData]);


        if (error) {
            throw error;
        }


        alert(
            'تمت إضافة الوجبة بنجاح!'
        );


        // تنظيف الحقول
        titleInput.value = '';
        priceInput.value = '';

        if (offerPriceInput) {
            offerPriceInput.value = '';
        }

        if (descInput) {
            descInput.value = '';
        }


        [
            'new-meal-title-tr',
            'new-meal-title-en',
            'new-meal-desc-tr',
            'new-meal-desc-en'
        ].forEach(id => {

            const el =
                document.getElementById(id);

            if (el) {
                el.value = '';
            }
        });


        if (mealInput) {
            mealInput.value = '';
        }


        await loadAdminSystem();

    } catch (err) {

        console.error(
            'خطأ إضافة الوجبة:',
            err
        );

        alert(
            'فشل إضافة الوجبة:\n' +
            err.message
        );
    }
}


// ==========================================
// لوحة المخزون
// ==========================================

async function renderAdminStockDashboard() {

    const container =
        document.getElementById(
            'admin-stock-container'
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `<p class="loading-text">
            <i class="fas fa-spinner fa-spin"></i>
            جاري تحميل عناصر المخزون والعروض...
        </p>`;


    try {

        // جلب الوجبات
        const {
            data: meals,
            error: mealsError
        } =
            await supabaseClient
                .from('meals')
                .select('*')
                .order('id', {
                    ascending: false
                });


        if (mealsError) {
            throw mealsError;
        }


        if (
            !meals ||
            meals.length === 0
        ) {

            container.innerHTML =
                `<p class="loading-text">
                    لا توجد وجبات حالياً.
                </p>`;

            return;
        }


        // جلب الأقسام
        const {
            data: categories,
            error: categoriesError
        } =
            await supabaseClient
                .from('categories')
                .select('id, name')
                .order('sort_order', {
                    ascending: true,
                    nullsFirst: false
                })
                .order('id', {
                    ascending: true
                });


        if (categoriesError) {
            throw categoriesError;
        }


        const categoryList =
            categories || [];


        // ==================================
        // بناء الكروت
        // ==================================

        let html = '';


        meals.forEach(meal => {

            const isAvailable =
                meal.is_available !== false;


            const isOffer =
                meal.is_offer === true ||
                meal.is_offer === 'true' ||
                meal.is_offer === 1 ||
                meal.is_offer === '1';


            html += `

                <div
                    class="stock-item-card"
                    id="stock-card-${meal.id}"
                    style="
                        margin-bottom:15px;
                        border-right:4px solid
                        ${isOffer
                            ? '#e74c3c'
                            : 'var(--border-luxury)'};
                    "
                >

                    <img
                        src="${meal.image_url || ''}"
                        alt="${escapeAttribute(meal.title || '')}"
                        loading="lazy"
                    >


                    <div class="stock-details">

                        <!-- الاسم -->
                        <div style="margin-bottom:8px;">

                            <label
                                style="
                                    font-size:0.8rem;
                                    font-weight:bold;
                                "
                            >
                                الاسم
                                (العربية / Türkçe / English):
                            </label>


                            <input
                                type="text"
                                id="inline-title-${meal.id}"
                                value="${escapeAttribute(meal.title || '')}"
                                placeholder="الاسم بالعربي"
                                style="margin-bottom:4px;"
                            >


                            <input
                                type="text"
                                id="inline-title-tr-${meal.id}"
                                value="${escapeAttribute(meal.title_tr || '')}"
                                placeholder="İsim Türkçe"
                                style="margin-bottom:4px;"
                            >


                            <input
                                type="text"
                                id="inline-title-en-${meal.id}"
                                value="${escapeAttribute(meal.title_en || '')}"
                                placeholder="Name English"
                            >

                        </div>


                        <!-- الوصف -->
                        <div style="margin-bottom:8px;">

                            <label
                                style="
                                    font-size:0.8rem;
                                    font-weight:bold;
                                "
                            >
                                الوصف
                                (العربية / Türkçe / English):
                            </label>


                            <textarea
                                id="inline-desc-${meal.id}"
                                placeholder="الوصف بالعربي"
                                style="
                                    margin-bottom:4px;
                                    height:45px;
                                    resize:none;
                                "
                            >${escapeHtml(meal.description || '')}</textarea>


                            <textarea
                                id="inline-desc-tr-${meal.id}"
                                placeholder="Açıklama Türkçe"
                                style="
                                    margin-bottom:4px;
                                    height:45px;
                                    resize:none;
                                "
                            >${escapeHtml(meal.description_tr || '')}</textarea>


                            <textarea
                                id="inline-desc-en-${meal.id}"
                                placeholder="Description English"
                                style="
                                    height:45px;
                                    resize:none;
                                "
                            >${escapeHtml(meal.description_en || '')}</textarea>

                        </div>


                        <!-- القسم -->
                        <div
                            style="
                                margin-bottom:8px;
                            "
                        >

                            <label
                                style="
                                    font-size:0.75rem;
                                    font-weight:bold;
                                "
                            >
                                قسم الوجبة:
                            </label>


                            <select
                                id="inline-category-${meal.id}"
                                style="
                                    width:100%;
                                    margin-top:4px;
                                "
                            >

                                <option value="">
                                    اختر القسم
                                </option>

                                ${categoryList.map(category => `

                                    <option
                                        value="${category.id}"
                                        ${String(category.id) === String(meal.category_id)
                                            ? 'selected'
                                            : ''}
                                    >
                                        ${escapeHtml(category.name || '')}
                                    </option>

                                `).join('')}

                            </select>

                        </div>


                        <!-- الأسعار -->
                        <div
                            class="stock-action-inputs"
                            style="
                                display:flex;
                                gap:10px;
                            "
                        >

                            <div style="flex:1;">

                                <label
                                    style="
                                        font-size:0.75rem;
                                    "
                                >
                                    السعر الأصلي / القديم
                                    (${currentCurrencySymbol}):
                                </label>


                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    id="inline-price-${meal.id}"
                                    value="${meal.price ?? ''}"
                                >

                            </div>


                            <div style="flex:1;">

                                <label
                                    style="
                                        font-size:0.75rem;
                                        color:#e74c3c;
                                        font-weight:bold;
                                    "
                                >
                                    سعر العرض الجديد
                                    (${currentCurrencySymbol}):
                                </label>


                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    id="inline-offer-price-${meal.id}"
                                    value="${meal.offer_price ?? ''}"
                                    placeholder="مثال: 150"
                                >

                            </div>

                        </div>


                        <!-- العرض والحالة -->
                        <div
                            class="stock-action-inputs"
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:6px;
                            "
                        >

                            <div style="flex:1;">

                                <label
                                    style="
                                        font-size:0.75rem;
                                    "
                                >
                                    إضافة لقسم العروض 🏷️:
                                </label>


                                <select
                                    id="inline-is-offer-${meal.id}"
                                >

                                    <option
                                        value="false"
                                        ${!isOffer
                                            ? 'selected'
                                            : ''}
                                    >
                                        ❌ بدون عرض
                                    </option>


                                    <option
                                        value="true"
                                        ${isOffer
                                            ? 'selected'
                                            : ''}
                                    >
                                        🔥 عرض خاص
                                    </option>

                                </select>

                            </div>


                            <div style="flex:1;">

                                <label
                                    style="
                                        font-size:0.75rem;
                                    "
                                >
                                    حالة الوجبة:
                                </label>


                                <select
                                    id="inline-status-${meal.id}"
                                >

                                    <option
                                        value="true"
                                        ${isAvailable
                                            ? 'selected'
                                            : ''}
                                    >
                                        🟢 متوفرة
                                    </option>


                                    <option
                                        value="false"
                                        ${!isAvailable
                                            ? 'selected'
                                            : ''}
                                    >
                                        🔴 غير متوفرة
                                    </option>

                                </select>

                            </div>

                        </div>


                        <!-- أزرار -->
                        <div
                            class="stock-buttons-group"
                            style="margin-top:10px;"
                        >

                            <button
                                class="inline-save-btn"
                                data-id="${meal.id}"
                            >
                                <i class="fas fa-check"></i>
                                حفظ التعديل
                            </button>


                            <button
                                class="inline-delete-btn"
                                data-id="${meal.id}"
                            >
                                <i class="fas fa-trash"></i>
                                حذف
                            </button>

                        </div>

                    </div>

                </div>
            `;
        });


        container.innerHTML = html;


        // ==================================
        // زر حفظ التعديل
        // ==================================

        document
            .querySelectorAll('.inline-save-btn')
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    async () => {

                        await updateAdminMeal(
                            btn.dataset.id
                        );
                    }
                );

            });


        // ==================================
        // زر حذف
        // ==================================

        document
            .querySelectorAll('.inline-delete-btn')
            .forEach(btn => {

                // تجاهل أزرار حذف الأقسام
                if (
                    btn.classList.contains(
                        'delete-cat-btn'
                    )
                ) {
                    return;
                }


                btn.addEventListener(
                    'click',
                    async () => {

                        await deleteAdminMeal(
                            btn.dataset.id
                        );
                    }
                );

            });

    } catch (err) {

        console.error(
            'خطأ تحميل المخزون:',
            err
        );

        container.innerHTML =
            `<p class="loading-text">
                حدث خطأ أثناء تحميل المخزون:
                ${escapeHtml(err.message)}
            </p>`;
    }
}


// ==========================================
// تحديث وجبة
// ==========================================

async function updateAdminMeal(mealId) {

    try {

        const updatedTitle =
            document.getElementById(
                `inline-title-${mealId}`
            )?.value.trim() || '';


        const updatedTitleTr =
            document.getElementById(
                `inline-title-tr-${mealId}`
            )?.value.trim() || '';


        const updatedTitleEn =
            document.getElementById(
                `inline-title-en-${mealId}`
            )?.value.trim() || '';


        const updatedDesc =
            document.getElementById(
                `inline-desc-${mealId}`
            )?.value.trim() || '';


        const updatedDescTr =
            document.getElementById(
                `inline-desc-tr-${mealId}`
            )?.value.trim() || '';


        const updatedDescEn =
            document.getElementById(
                `inline-desc-en-${mealId}`
            )?.value.trim() || '';


        const newPrice =
            parseFloat(
                document.getElementById(
                    `inline-price-${mealId}`
                )?.value
            );


        const offerPriceElement =
            document.getElementById(
                `inline-offer-price-${mealId}`
            );


        const rawOfferPrice =
            offerPriceElement
                ? offerPriceElement.value.trim()
                : '';


        const newOfferPrice =
            rawOfferPrice !== ''
                ? parseFloat(rawOfferPrice)
                : null;


        const isOfferElement =
            document.getElementById(
                `inline-is-offer-${mealId}`
            );


        const isOffer =
            isOfferElement
                ? isOfferElement.value === 'true'
                : false;


        const statusElement =
            document.getElementById(
                `inline-status-${mealId}`
            );


        const newStatus =
            statusElement
                ? statusElement.value === 'true'
                : true;


        // القسم الجديد
        const categoryElement =
            document.getElementById(
                `inline-category-${mealId}`
            );


        const newCategoryId =
            categoryElement
                ? categoryElement.value
                : '';


        // ==================================
        // التحقق
        // ==================================

        if (!updatedTitle) {

            return alert(
                'الرجاء إدخال اسم الوجبة بالعربية.'
            );
        }


        if (
            isNaN(newPrice) ||
            newPrice <= 0
        ) {

            return alert(
                'الرجاء إدخال سعر أصلي صحيح.'
            );
        }


        if (!newCategoryId) {

            return alert(
                'الرجاء اختيار قسم للوجبة.'
            );
        }


        if (isOffer) {

            if (
                newOfferPrice === null ||
                isNaN(newOfferPrice) ||
                newOfferPrice <= 0
            ) {

                return alert(
                    '⚠️ عند تفعيل العرض يجب إدخال سعر العرض الجديد.'
                );
            }


            if (
                newOfferPrice >= newPrice
            ) {

                return alert(
                    '⚠️ سعر العرض يجب أن يكون أقل من السعر الأصلي.'
                );
            }
        }


        /*
         * عند إلغاء العرض:
         *
         * is_offer = false
         * offer_price = null
         *
         * حتى لا يبقى سعر قديم مخزن
         * ويسبب ظهور الوجبة كعرض لاحقاً.
         */

        const updateData = {

            title:
                updatedTitle,

            title_tr:
                updatedTitleTr,

            title_en:
                updatedTitleEn,

            description:
                updatedDesc,

            description_tr:
                updatedDescTr,

            description_en:
                updatedDescEn,

            price:
                newPrice,

            offer_price:
                isOffer
                    ? newOfferPrice
                    : null,

            is_offer:
                isOffer,

            is_available:
                newStatus,

            category_id:
                newCategoryId
        };


        console.log(
            'بيانات تحديث الوجبة:',
            updateData
        );


        // ==================================
        // تحديث Supabase
        // ==================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from('meals')
                .update(updateData)
                .eq('id', mealId)
                .select()
                .single();


        if (error) {

            console.error(
                'Supabase update error:',
                error
            );

            /*
             * إذا ظهر هنا خطأ RLS:
             * المشكلة ليست في HTML/JS،
             * بل في Policies الخاصة بجدول meals.
             */

            alert(
                'فشل التحديث في قاعدة البيانات:\n\n' +
                error.message
            );

            return;
        }


        if (!data) {

            alert(
                'لم يتم تحديث الوجبة. قد تكون صلاحيات RLS تمنع التعديل.'
            );

            return;
        }


        alert(
            'تم حفظ تعديل الوجبة بنجاح!'
        );


        await renderAdminStockDashboard();

    } catch (err) {

        console.error(
            'خطأ برمجي أثناء تعديل الوجبة:',
            err
        );

        alert(
            'حدث خطأ أثناء تعديل الوجبة:\n' +
            err.message
        );
    }
}


// ==========================================
// حذف وجبة
// ==========================================

async function deleteAdminMeal(mealId) {

    if (
        !confirm(
            'هل أنتِ متأكدة من حذف هذه الوجبة؟'
        )
    ) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from('meals')
                .delete()
                .eq('id', mealId);


        if (error) {

            console.error(
                'خطأ حذف الوجبة:',
                error
            );

            return alert(
                'فشل حذف الوجبة:\n' +
                error.message
            );
        }


        alert(
            'تم حذف الوجبة بنجاح!'
        );


        await renderAdminStockDashboard();

    } catch (err) {

        console.error(
            'خطأ برمجي أثناء الحذف:',
            err
        );

        alert(
            'حدث خطأ أثناء حذف الوجبة:\n' +
            err.message
        );
    }
}


// ==========================================
// حماية النصوص عند إدخالها في HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function escapeAttribute(value) {

    return escapeHtml(value);
}