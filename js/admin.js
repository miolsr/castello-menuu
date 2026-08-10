/* =========================================================
   CASTELLO RESTORAND
   Main Stylesheet
   Vanilla HTML / CSS / JavaScript
========================================================= */


/* =========================================================
   THEME VARIABLES
========================================================= */

body.dark-theme {
    --bg-deep-prime: #0c0c0c;
    --bg-card-luxury: #141414;
    --bg-nav-blur: #1a1a1a;
    --text-pure: #ffffff;
    --text-dimmed: #9f9f9f;
    --gold-premium: #f59e0b;
    --gold-hover: #d97706;
    --border-luxury: #242424;
    --danger-red: #ef4444;

    --banner-overlay:
        linear-gradient(
            to top,
            rgba(0, 0, 0, 0.85),
            rgba(0, 0, 0, 0.2)
        );
}

body.light-theme {
    --bg-deep-prime: #f4f6f8;
    --bg-card-luxury: #ffffff;
    --bg-nav-blur: #ffffff;
    --text-pure: #111111;
    --text-dimmed: #64748b;
    --gold-premium: #d97706;
    --gold-hover: #b45309;
    --border-luxury: #e2e8f0;
    --danger-red: #dc2626;

    --banner-overlay:
        linear-gradient(
            to top,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.3)
        );
}


/* =========================================================
   RESET
========================================================= */

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Cairo', sans-serif;
}

html {
    width: 100%;
    overflow-x: hidden;
}

body {
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-deep-prime);
    color: var(--text-pure);
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
    direction: rtl;
    overflow-x: hidden;
}


/* =========================================================
   GENERAL CONTAINER
========================================================= */

.container {
    width: 94%;
    max-width: 1250px;
    margin: 0 auto;
}


/* =========================================================
   FIXED HEADER
========================================================= */

.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    width: 100%;

    background-color: var(--bg-nav-blur);

    padding: 15px 30px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    border-bottom: 2px solid var(--gold-premium);

    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15);

    z-index: 999;
}

.nav-bar h1,
.nav-bar h2 {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-pure);
}

.main-header {
    margin-top: 75px;
    width: 100%;
}

.nav-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.nav-btn {
    background: transparent;
    border: 1px solid var(--border-luxury);
    color: var(--text-pure);

    padding: 8px 14px;

    border-radius: 8px;

    cursor: pointer;

    transition: all 0.2s ease;
}

.nav-btn:hover {
    border-color: var(--gold-premium);
    color: var(--gold-premium);
}


/* =========================================================
   RESTAURANT BANNER
========================================================= */

.restaurant-banner {
    width: 100%;
    height: 220px;

    background-size: cover;
    background-position: center;

    display: flex;
    align-items: flex-end;

    position: relative;
}

.banner-overlay-content {
    background: var(--banner-overlay);

    width: 100%;

    padding: 20px;

    transition: background 0.2s ease;
}

.status-tags {
    display: flex;
    gap: 10px;

    margin-bottom: 8px;

    align-items: center;
}

.status-tag {
    padding: 4px 10px;

    border-radius: 4px;

    font-size: 0.8rem;
    font-weight: 700;

    background-color: #64748b;
    color: #fff;
}

.status-tag.open {
    background-color: #10b981;
}

.status-tag.closed {
    background-color: var(--danger-red);
}

.maps-btn {
    display: inline-block;

    background-color: var(--gold-premium);
    color: #fff;

    padding: 6px 14px;

    text-decoration: none;

    border-radius: 6px;

    font-size: 0.8rem;

    margin-top: 10px;
}


/* =========================================================
   CATEGORIES NAVIGATION
========================================================= */

.categories-nav {
    width: 100%;

    background-color: var(--bg-nav-blur);

    padding: 12px 0;

    position: sticky;
    top: 73px;

    z-index: 100;

    border-bottom: 1px solid var(--border-luxury);

    overflow-x: auto;
}

.categories-nav::-webkit-scrollbar {
    display: none;
}

.categories-nav #categories-container {
    display: flex;
    gap: 10px;

    width: 100%;

    overflow-x: auto;
}

.category-tab {
    padding: 6px 18px;

    background-color: var(--bg-deep-prime);

    border: 1px solid var(--border-luxury);

    border-radius: 20px;

    cursor: pointer;

    font-size: 0.85rem;

    white-space: nowrap;

    flex-shrink: 0;

    transition: all 0.2s ease;
}

.category-tab.active,
.category-tab:hover {
    background-color: var(--gold-premium);
    color: #fff;

    border-color: var(--gold-premium);
}


/* =========================================================
   MENU SECTION
========================================================= */

.menu-container {
    width: 100%;

    padding: 30px 0;

    overflow-x: hidden;
}


/* =========================================================
   SECTION HEADER
========================================================= */

.section-header-row {
    display: flex !important;

    flex-direction: row !important;

    justify-content: flex-start !important;

    align-items: center !important;

    flex-wrap: nowrap !important;

    gap: 15px !important;

    margin-bottom: 25px !important;

    width: 100% !important;

    box-sizing: border-box;
}

.section-title {
    margin-bottom: 20px;

    border-right: 4px solid var(--gold-premium);

    padding-right: 10px;
}

.section-header-row .section-title {
    margin-bottom: 0 !important;

    white-space: nowrap !important;

    flex-shrink: 0;
}


/* =========================================================
   SEARCH
========================================================= */

.section-header-row .search-wrapper {
    position: relative !important;

    width: 100% !important;

    flex-grow: 1 !important;

    max-width: 100% !important;

    margin: 0 !important;

    min-width: 0;
}

.section-header-row .search-wrapper input {
    width: 100%;

    padding: 10px 40px 10px 15px;

    background-color: var(--bg-card-luxury);

    border: 1px solid var(--border-luxury);

    border-radius: 25px;

    color: var(--text-pure);

    font-family: 'Cairo', sans-serif;

    font-size: 0.9rem;

    outline: none;

    transition: all 0.3s ease;
}


/* =========================================================
   MAIN MEALS GRID
========================================================= */

.meals-grid {
    display: grid;

    width: 100%;

    grid-template-columns:
        repeat(auto-fill, minmax(280px, 1fr));

    gap: 20px;

    margin: 0;
    padding: 0;

    box-sizing: border-box;
}


/* =========================================================
   MEAL CARD
========================================================= */

.meal-card {
    width: 100%;
    min-width: 0;
    max-width: 100%;

    background-color: var(--bg-card-luxury);

    border: 1px solid var(--border-luxury);

    border-radius: 12px;

    overflow: hidden;

    display: flex;

    flex-direction: column;

    box-sizing: border-box;

    transition:
        transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.3s ease;

    will-change: transform;
}

.meal-card:hover {
    transform: translateY(-4px);

    box-shadow:
        0 12px 20px rgba(0, 0, 0, 0.15);
}


/* =========================================================
   MEAL IMAGE
========================================================= */

.meal-img-wrapper {
    width: 100%;
    height: 160px;

    position: relative;

    overflow: hidden;
}

.meal-img {
    width: 100%;
    height: 100%;

    object-fit: cover;

    display: block;
}


/* =========================================================
   MEAL INFO
========================================================= */

.meal-info {
    padding: 15px;

    display: flex;

    flex-direction: column;

    flex: 1;

    min-width: 0;
}

.meal-title-row {
    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    gap: 8px;

    margin-bottom: 8px;
}

.meal-title-row h3 {
    min-width: 0;

    overflow-wrap: anywhere;
}

.meal-price {
    color: var(--gold-premium);

    font-weight: 700;

    white-space: nowrap;
}

.meal-desc {
    font-size: 0.8rem;

    color: var(--text-dimmed);

    margin-bottom: 15px;

    line-height: 1.4;
}


/* =========================================================
   ADD TO CART
========================================================= */

.add-to-cart-btn {
    margin-top: auto;

    width: 100%;

    background-color: var(--gold-premium);

    border: none;

    color: white;

    padding: 10px;

    border-radius: 6px;

    cursor: pointer;

    font-weight: 700;

    font-size: 0.85rem;

    transition: background-color 0.2s ease;
}

.add-to-cart-btn:hover {
    background-color: var(--gold-hover);
}

.add-to-cart-btn:disabled {
    cursor: not-allowed;
}


/* =========================================================
   CART SIDEBAR
========================================================= */

.cart-sidebar {
    position: fixed;

    top: 0;
    bottom: 0;

    left: -350px;

    width: 340px;

    max-width: 90vw;

    background-color: var(--bg-card-luxury);

    border-right: 1px solid var(--border-luxury);

    box-shadow:
        4px 0 25px rgba(0, 0, 0, 0.4);

    z-index: 10000;

    display: flex;

    flex-direction: column;

    transition:
        left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-sidebar.open {
    left: 0;
}

.sidebar-header {
    padding: 20px;

    border-bottom: 1px solid var(--border-luxury);

    display: flex;

    justify-content: space-between;

    align-items: center;
}

.close-sidebar-btn {
    background: transparent;

    border: none;

    color: var(--text-pure);

    font-size: 1.5rem;

    cursor: pointer;
}

.sidebar-body {
    padding: 20px;

    overflow-y: auto;

    flex: 1;

    display: flex;

    flex-direction: column;
}

.cart-item {
    display: flex;

    justify-content: space-between;

    padding: 10px 0;

    border-bottom: 1px solid var(--border-luxury);
}

.cart-total-section {
    padding: 15px 0;

    font-weight: 700;

    border-bottom: 1px solid var(--border-luxury);

    margin-bottom: 15px;
}

.customer-delivery-form {
    margin-top: 10px;
}

.customer-delivery-form h4 {
    font-size: 0.95rem;

    margin-bottom: 15px;

    color: var(--gold-premium);
}

.submit-order-btn {
    width: 100%;

    background-color: #25d366;

    color: white;

    border: none;

    padding: 12px;

    border-radius: 8px;

    cursor: pointer;

    font-weight: 700;

    margin-top: 15px;
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

.admin-dashboard-layout {
    display: grid;

    grid-template-columns: 1fr 1.3fr;

    gap: 20px;

    margin-top: 90px;

    padding-bottom: 40px;
}

@media (max-width: 850px) {
    .admin-dashboard-layout {
        grid-template-columns: 1fr;
    }
}

.admin-card-section {
    background-color: var(--bg-card-luxury);

    border: 1px solid var(--border-luxury);

    padding: 20px;

    border-radius: 10px;

    margin-bottom: 20px;
}

.admin-card-section h3 {
    font-size: 1.05rem;

    margin-bottom: 15px;

    border-bottom: 1px solid var(--border-luxury);

    padding-bottom: 8px;
}


/* =========================================================
   FORMS
========================================================= */

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;

    font-size: 0.8rem;

    margin-bottom: 4px;

    color: var(--text-dimmed);
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;

    padding: 8px;

    background-color: var(--bg-deep-prime);

    border: 1px solid var(--border-luxury);

    color: inherit;

    border-radius: 6px;

    font-size: 0.85rem;

    font-family: 'Cairo', sans-serif;

    box-sizing: border-box;
}

.form-inline {
    display: flex;

    gap: 8px;
}

.form-inline input {
    flex: 1;

    padding: 8px;

    background-color: var(--bg-deep-prime);

    border: 1px solid var(--border-luxury);

    color: inherit;

    border-radius: 6px;
}

.save-btn,
.add-btn {
    background-color: var(--gold-premium);

    color: white;

    border: none;

    padding: 8px 16px;

    border-radius: 6px;

    cursor: pointer;

    font-weight: 700;

    width: 100%;
}


/* =========================================================
   ADMIN STOCK
========================================================= */

#admin-stock-container {
    overflow: visible !important;

    width: 100%;
}

.admin-stock-grid {
    display: flex !important;

    flex-direction: column !important;

    gap: 15px !important;

    margin-top: 15px;

    overflow: visible !important;

    width: 100%;
}

.stock-item-card {
    background-color: var(--bg-deep-prime) !important;

    border: 1px solid var(--border-luxury) !important;

    border-radius: 12px !important;

    overflow: visible !important;

    display: flex !important;

    flex-direction: column !important;

    gap: 15px !important;

    padding: 15px !important;

    position: relative;

    z-index: 5;

    transition:
        transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.3s ease;

    width: 100%;
}

.stock-item-card:hover {
    transform: translateY(-4px);

    box-shadow:
        0 12px 20px rgba(0, 0, 0, 0.15);
}

.stock-item-card img {
    width: 100% !important;

    height: 150px !important;

    object-fit: cover !important;

    border-radius: 8px !important;

    display: block;
}

.stock-details {
    padding: 0 !important;

    display: flex !important;

    flex-direction: column !important;

    flex: 1 !important;

    width: 100% !important;
}

.stock-details h4 {
    font-size: 0.95rem !important;

    margin-bottom: 8px !important;

    color: var(--text-pure) !important;
}

.stock-action-inputs {
    display: flex !important;

    flex-direction: column !important;

    gap: 6px !important;

    margin-bottom: 12px !important;

    width: 100% !important;
}

.stock-action-inputs input,
.stock-action-inputs select {
    width: 100% !important;

    padding: 8px 10px !important;

    background: var(--bg-card-luxury) !important;

    border: 1px solid var(--border-luxury) !important;

    color: var(--text-pure) !important;

    border-radius: 6px !important;

    font-size: 0.85rem !important;

    font-family: 'Cairo', sans-serif !important;

    box-sizing: border-box;
}

.stock-action-inputs select {
    cursor: pointer;

    position: relative;

    z-index: 99;
}

.stock-buttons-group {
    display: flex !important;

    gap: 8px !important;

    margin-top: auto !important;

    padding-top: 8px !important;

    width: 100% !important;
}

.inline-save-btn {
    flex: 1 !important;

    background-color: #10b981 !important;

    color: white !important;

    border: none !important;

    padding: 8px 12px !important;

    font-size: 0.8rem !important;

    border-radius: 6px !important;

    cursor: pointer !important;

    font-weight: 700 !important;
}

.inline-delete-btn {
    background-color: var(--danger-red) !important;

    color: white !important;

    border: none !important;

    padding: 8px 12px !important;

    font-size: 0.8rem !important;

    border-radius: 6px !important;

    cursor: pointer;
}

.loading-text {
    text-align: center;

    color: var(--text-dimmed);

    padding: 20px;

    display: block;

    width: 100%;
}


/* =========================================================
   STOCK DESKTOP
========================================================= */

@media (min-width: 768px) {

    .stock-item-card {
        flex-direction: row !important;

        align-items: flex-start !important;

        padding: 20px !important;
    }

    .stock-item-card img {
        width: 160px !important;

        height: 120px !important;

        flex-shrink: 0;
    }

    .stock-details {
        display: flex !important;

        flex-direction: column !important;

        justify-content: space-between !important;

        min-width: 0;
    }

    .stock-action-inputs {
        display: grid !important;

        grid-template-columns:
            2fr 1fr 1fr !important;

        gap: 12px !important;

        align-items: center !important;

        margin-bottom: 0 !important;
    }

    .stock-action-inputs input,
    .stock-action-inputs select {
        margin-bottom: 0 !important;
    }

    .stock-buttons-group {
        width: auto !important;

        align-self: flex-end !important;

        gap: 10px !important;
    }

    .inline-save-btn {
        width: 120px !important;

        flex: none !important;
    }
}


/* =========================================================
   DISABLED MEALS
========================================================= */

.meal-disabled {
    opacity: 0.6;

    filter: grayscale(50%);

    position: relative;
}

.meal-disabled .order-btn {
    background-color: #4b5563 !important;

    color: #9ca3af !important;

    cursor: not-allowed;
}

.unavailable-badge {
    position: absolute;

    top: 12px;

    right: 12px;

    background-color: #dc2626;

    color: white;

    padding: 3px 9px;

    border-radius: 4px;

    font-size: 0.75rem;

    font-weight: 700;

    z-index: 10;

    box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.3);
}


/* =========================================================
   SPECIAL OFFERS
========================================================= */

.offers-section {
    width: 100%;

    box-sizing: border-box;

    background:
        linear-gradient(
            135deg,
            rgba(231, 76, 60, 0.1),
            rgba(241, 196, 15, 0.05)
        );

    border: 1px solid rgba(231, 76, 60, 0.3);

    border-radius: 12px;

    padding: 15px;

    margin-bottom: 25px;
}

.offers-title {
    color: #e74c3c;

    font-size: 1.3rem;

    font-weight: bold;

    display: flex;

    align-items: center;

    gap: 8px;

    margin-bottom: 12px;
}

.offers-grid {
    width: 100%;

    display: grid;

    grid-template-columns:
        repeat(auto-fill, minmax(280px, 1fr));

    gap: 15px;
}


/* =========================================================
   OFFER BADGE
========================================================= */

.meal-img-wrapper .offer-badge {
    position: absolute;

    top: 10px;

    right: 10px;

    background-color: #e74c3c;

    color: #fff;

    font-size: 0.75rem;

    font-weight: bold;

    padding: 4px 8px;

    border-radius: 20px;

    box-shadow:
        0 2px 5px rgba(0, 0, 0, 0.2);

    z-index: 2;
}


/* =========================================================
   OFFER PRICES
========================================================= */

.price-container {
    display: flex;

    align-items: center;

    gap: 8px;

    margin-top: 5px;

    flex-wrap: wrap;
}

.old-price {
    text-decoration: line-through;

    color: #888;

    font-size: 0.85rem;
}

.new-price {
    color: #2ecc71;

    font-size: 1.1rem;

    font-weight: bold;
}


/* =========================================================
   MOBILE - MAIN FIX
========================================================= */

@media (max-width: 768px) {

    /* الشاشة كلها */
    html,
    body {
        width: 100%;
        max-width: 100%;

        overflow-x: hidden;
    }

    /* الحاوية لا تترك فراغاً كبيراً */
    .container {
        width: 100% !important;

        max-width: none !important;

        margin: 0 !important;

        padding-left: 10px !important;
        padding-right: 10px !important;

        box-sizing: border-box !important;
    }

    /* القائمة */
    .menu-container {
        width: 100% !important;

        padding: 20px 0 !important;

        overflow-x: hidden;
    }

    .menu-container > .container {
        width: 100% !important;

        max-width: none !important;
    }

    /* رأس القسم */
    .section-header-row {
        width: 100% !important;

        display: flex !important;

        flex-direction: row !important;

        justify-content: space-between !important;

        align-items: center !important;

        gap: 10px !important;

        box-sizing: border-box !important;
    }

    .section-header-row .section-title {
        flex-shrink: 0 !important;

        margin: 0 !important;

        padding-right: 8px !important;

        font-size: 1.1rem !important;
    }

    .section-header-row .search-wrapper {
        flex: 1 !important;

        width: auto !important;

        max-width: none !important;

        min-width: 0 !important;

        margin: 0 !important;
    }

    .section-header-row .search-wrapper input {
        width: 100% !important;

        box-sizing: border-box !important;
    }


    /* =========================================
       الكرتين جنب بعض وملء الشاشة
    ========================================= */

    .meals-grid {
        width: 100% !important;

        max-width: 100% !important;

        display: grid !important;

        grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

        gap: 10px !important;

        margin: 0 !important;

        padding: 0 !important;

        box-sizing: border-box !important;

        direction: rtl !important;
    }

    .meal-card {
        width: 100% !important;

        max-width: none !important;

        min-width: 0 !important;

        margin: 0 !important;

        box-sizing: border-box !important;
    }

    .meal-img-wrapper {
        width: 100% !important;

        height: 100px !important;
    }

    .meal-info {
        width: 100% !important;

        padding: 8px !important;

        box-sizing: border-box !important;
    }

    .meal-title-row {
        flex-direction: column !important;

        align-items: flex-start !important;

        gap: 3px !important;
    }

    .meal-title-row h3 {
        width: 100%;

        font-size: 0.85rem !important;

        line-height: 1.4;

        overflow-wrap: anywhere;
    }

    .meal-price {
        font-size: 0.8rem !important;
    }

    .meal-desc {
        font-size: 0.7rem !important;

        line-height: 1.4;

        margin-bottom: 8px !important;

        display: -webkit-box;

        -webkit-line-clamp: 2;

        -webkit-box-orient: vertical;

        overflow: hidden;
    }

    .add-to-cart-btn {
        width: 100% !important;

        font-size: 0.75rem !important;

        padding: 6px !important;
    }


    /* =========================================
       العروض على الجوال
    ========================================= */

    .offers-section {
        width: 100% !important;

        max-width: 100% !important;

        padding: 10px !important;

        box-sizing: border-box !important;

        overflow: hidden;
    }

    .offers-grid {
        width: 100% !important;

        max-width: 100% !important;

        display: grid !important;

        grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

        gap: 10px !important;

        box-sizing: border-box !important;
    }

    .offers-grid .meal-card {
        width: 100% !important;

        min-width: 0 !important;
    }


    /* =========================================
       الهيدر على الجوال
    ========================================= */

    .nav-bar {
        padding: 10px 12px;

        gap: 8px;
    }

    .nav-bar h1 {
        font-size: 1rem;

        white-space: nowrap;

        overflow: hidden;

        text-overflow: ellipsis;
    }

    .nav-actions {
        gap: 5px;

        flex-shrink: 0;
    }

    .nav-btn {
        padding: 7px 9px;

        font-size: 0.8rem;
    }

    .lang-selector-wrapper {
        display: none !important;
    }

    .main-header {
        margin-top: 62px;
    }


    /* =========================================
       البانر
    ========================================= */

    .restaurant-banner {
        height: 190px;
    }

    .banner-overlay-content {
        padding: 15px;
    }

    .status-tags {
        gap: 6px;
    }


    /* =========================================
       الأقسام
    ========================================= */

    .categories-nav {
        top: 61px;

        padding: 9px 0;
    }

    .categories-nav #categories-container {
        padding-left: 10px;
        padding-right: 10px;
    }

    .category-tab {
        padding: 6px 13px;

        font-size: 0.78rem;
    }


    /* =========================================
       السلة
    ========================================= */

    .cart-sidebar {
        width: 320px;

        max-width: 90vw;
    }


    /* =========================================
       عروض الأسعار
    ========================================= */

    .price-container {
        gap: 5px;
    }

    .old-price {
        font-size: 0.7rem;
    }

    .new-price {
        font-size: 0.9rem;
    }

    .offer-badge {
        top: 6px !important;

        right: 6px !important;

        font-size: 0.65rem !important;

        padding: 3px 6px !important;
    }
}


/* =========================================================
   VERY SMALL PHONES
========================================================= */

@media (max-width: 380px) {

    .container {
        padding-left: 7px !important;

        padding-right: 7px !important;
    }

    .meals-grid,
    .offers-grid {
        gap: 7px !important;
    }

    .meal-info {
        padding: 7px !important;
    }

    .meal-title-row h3 {
        font-size: 0.78rem !important;
    }

    .meal-price {
        font-size: 0.72rem !important;
    }

    .meal-desc {
        font-size: 0.65rem !important;
    }

    .add-to-cart-btn {
        font-size: 0.68rem !important;

        padding: 5px !important;
    }
}