import { getRestaurantSettings } from './dataProvider.js';
import { getCurrentLanguage, translations } from './config.js';

let cart = [];
let currentCurrencySymbol = 'TL'; 

async function refreshCurrencySymbol() {
    try {
        const settings = await getRestaurantSettings();
        if (settings && settings.currency_symbol) {
            currentCurrencySymbol = settings.currency_symbol;
        }
    } catch (e) {
        console.error("خطأ جلب العملة في السلة:", e);
    }
}

export async function addToCart(meal) {
    await refreshCurrencySymbol();
    
    const existing = cart.find(item => item.id === meal.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...meal, quantity: 1 });
    }
    updateCartDOM();
}

function updateCartDOM() {
    const lang = getCurrentLanguage();
    const t = translations[lang] || translations['ar'];
    
    document.getElementById('cart-count').innerText = cart.reduce((s, i) => s + i.quantity, 0);
    const list = document.getElementById('cart-items-list');
    let html = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <small>${item.price.toLocaleString()} ${currentCurrencySymbol} × ${item.quantity}</small>
                </div>
                <span class="cart-item-total-price">${(item.price * item.quantity).toLocaleString()} ${currentCurrencySymbol}</span>
            </div>
        `;
    });
    
    // 🌟 تم إصلاح علامة النص هنا لضمان عدم حدوث أي خطأ أحمر نهائياً
    let emptyMsg = 'السلة فارغة حالياً.';
    if (lang === 'tr') emptyMsg = 'Sepetiniz şu anda boş.';
    if (lang === 'en') emptyMsg = 'Your cart is empty.';
    
    list.innerHTML = html || `<p style="text-align:center; padding: 20px; color:var(--text-dimmed)">${emptyMsg}</p>`;
    
    document.getElementById('cart-total-price').innerText = total.toLocaleString();
    
    translateCartStaticUI(lang);
}

function translateCartStaticUI(lang) {
    const sidebarTitle = document.querySelector('.sidebar-header h3');
    const totalLabel = document.querySelector('.cart-total-section p');
    const formTitle = document.querySelector('.customer-delivery-form h4');
    const labels = document.querySelectorAll('.customer-delivery-form .form-group label');
    const inputs = document.querySelectorAll('.customer-delivery-form input, .customer-delivery-form textarea');
    const submitBtn = document.querySelector('.submit-order-btn');

    if (lang === 'tr') {
        if (sidebarTitle) sidebarTitle.innerHTML = `<i class="fas fa-shopping-bag"></i> Sipariş Sepeti`;
        if (totalLabel) totalLabel.innerHTML = `Toplam: <span id="cart-total-price">${document.getElementById('cart-total-price').innerText}</span> ${currentCurrencySymbol}`;
        if (formTitle) formTitle.innerText = `Teslimat Bilgileri`;
        if (labels[0]) labels[0].innerText = `Ad Soyad:`;
        if (inputs[0]) inputs[0].placeholder = `Adınızı ve soyadınızı giriniz`;
        if (labels[1]) labels[1].innerText = `Telefon Numarası:`;
        if (inputs[1]) inputs[1].placeholder = `05xxxxxxxx`;
        if (labels[2]) labels[2].innerText = `Detaylı Adres (Mahalle / Sokak / Bina No):`;
        if (inputs[2]) inputs[2].placeholder = `Örnek: Al-Bab - Ulu Cami Yanı...`;
        if (submitBtn) submitBtn.innerHTML = `Onayla ve WhatsApp ile Gönder <i class="fab fa-whatsapp"></i>`;
    } else if (lang === 'en') {
        if (sidebarTitle) sidebarTitle.innerHTML = `<i class="fas fa-shopping-bag"></i> Shopping Cart`;
        if (totalLabel) totalLabel.innerHTML = `Total: <span id="cart-total-price">${document.getElementById('cart-total-price').innerText}</span> ${currentCurrencySymbol}`;
        if (formTitle) formTitle.innerText = `Delivery Details`;
        if (labels[0]) labels[0].innerText = `Full Name:`;
        if (inputs[0]) inputs[0].placeholder = `Enter your full name`;
        if (labels[1]) labels[1].innerText = `Phone Number:`;
        if (inputs[1]) inputs[1].placeholder = `09xxxxxxxx`;
        if (labels[2]) labels[2].innerText = `Detailed Address (District / Street / Landmark):`;
        if (inputs[2]) inputs[2].placeholder = `Example: Al-Bab - Near Grand Mosque...`;
        if (submitBtn) submitBtn.innerHTML = `Confirm & Send via WhatsApp <i class="fab fa-whatsapp"></i>`;
    } else {
        if (sidebarTitle) sidebarTitle.innerHTML = `<i class="fas fa-shopping-bag"></i> سلة الطلبات`;
        if (totalLabel) totalLabel.innerHTML = `الإجمالي: <span id="cart-total-price">${document.getElementById('cart-total-price').innerText}</span> ${currentCurrencySymbol}`;
        if (formTitle) formTitle.innerText = `بيانات التوصيل`;
        if (labels[0]) labels[0].innerText = `الاسم الكامل:`;
        if (inputs[0]) inputs[0].placeholder = `أدخل اسمك الثنائي`;
        if (labels[1]) labels[1].innerText = `رقم الهاتف:`;
        if (inputs[1]) inputs[1].placeholder = `09xxxxxxxx`;
        if (labels[2]) labels[2].innerText = `العنوان بالتفصيل (الحي / الشارع / علامة مميزة):`;
        if (inputs[2]) inputs[2].placeholder = `مثال: الباب - بجانب جامع الكبير - بناء المتوكل ط2`;
        if (submitBtn) submitBtn.innerHTML = `تأكيد وإرسال عبر واتساب <i class="fab fa-whatsapp"></i>`;
    }
}

window.toggleCartSidebar = function() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('open');
    updateCartDOM();
}

window.sendOrderViaWhatsApp = async function() {
    const lang = getCurrentLanguage();
    if(cart.length === 0) {
        const alertMsg = lang === 'tr' ? "Lütfen önce sepetinize ürün ekleyin!" : (lang === 'en' ? "Please add items to your cart first!" : "الرجاء إضافة أطباق للسلة أولاً!");
        return alert(alertMsg);
    }
    
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();

    if(!name || !phone || !address) {
        const fillMsg = lang === 'tr' ? "Lütfen tüm teslimat bilgilerini doldurun!" : (lang === 'en' ? "Please fill in all delivery details!" : "الرجاء تعبئة بيانات التوصيل كاملة لإتمام الطلب!");
        return alert(fillMsg);
    }

    const settings = await getRestaurantSettings();
    await refreshCurrencySymbol();
    
    let msg = "";
    if (lang === 'tr') {
        msg = `*Castello Restoranından Yeni Sipariş* 🍔✨\n\n`;
        msg += `👤 *Müşteri Adı:* ${name}\n`;
        msg += `📞 *Telefon:* ${phone}\n`;
        msg += `📍 *Detaylı Adres:* ${address}\n`;
        msg += `--------------------------------\n`;
        msg += `📦 *Siparişler:*\n`;
        
        let total = 0;
        cart.forEach((item, index) => {
            msg += `${index + 1}. ${item.title} (Adet: ${item.quantity}) -> ${(item.price * item.quantity).toLocaleString()} ${currentCurrencySymbol} \n`;
            total += item.price * item.quantity;
        });
        msg += `--------------------------------\n`;
        msg += `💰 *Toplam Tutar:* ${total.toLocaleString()} ${currentCurrencySymbol}\n`;
    } else if (lang === 'en') {
        msg = `*New Order from Castello Restaurant* 🍔✨\n\n`;
        msg += `👤 *Customer Name:* ${name}\n`;
        msg += `📞 *Phone:* ${phone}\n`;
        msg += `📍 *Address:* ${address}\n`;
        msg += `--------------------------------\n`;
        msg += `📦 *Orders:*\n`;
        
        let total = 0;
        cart.forEach((item, index) => {
            msg += `${index + 1}. ${item.title} (Qty: ${item.quantity}) -> ${(item.price * item.quantity).toLocaleString()} ${currentCurrencySymbol} \n`;
            total += item.price * item.quantity;
        });
        msg += `--------------------------------\n`;
        msg += `💰 *Total Amount:* ${total.toLocaleString()} ${currentCurrencySymbol}\n`;
    } else {
        msg = `*طلب جديد من مطعم كاستيللو* 🍔✨\n\n`;
        msg += `👤 *اسم الزبون:* ${name}\n`;
        msg += `📞 *رقم الهاتف:* ${phone}\n`;
        msg += `📍 *العنوان بالتفصيل:* ${address}\n`;
        msg += `--------------------------------\n`;
        msg += `📦 *الطلبات:*\n`;
        
        let total = 0;
        cart.forEach((item, index) => {
            msg += `${index + 1}. ${item.title} (العدد: ${item.quantity}) -> ${(item.price * item.quantity).toLocaleString()} ${currentCurrencySymbol} \n`;
            total += item.price * item.quantity;
        });
        msg += `--------------------------------\n`;
        msg += `💰 *الإجمالي المستحق:* ${total.toLocaleString()} ${currentCurrencySymbol}\n`;
    }

    window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
};