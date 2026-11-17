/* =========================================================
   TRAZEEL
   Functional SPA + Journal + Statistics
========================================================= */

const STORAGE = {
    user: "tradion_user_v2",
    setupCompleted: "tradion_setup_completed_v2",
    journals: "tradion_journals_v2",
    profile: "tradion_profile_v1",
    theme: "tradion_theme_v1",
    language: "tradion_language_v1"
};

/* Remote authentication removed. Local auth is in local-auth.js. */

const FEEL_META = {
    calm: { label: "Calm", icon: "calm" },
    neutral: { label: "Neutral", icon: "neutral" },
    fear: { label: "Fear", icon: "fear" },
    revenge: { label: "Revenge", icon: "revenge" },
    overconfident: { label: "Overconfident", icon: "overconfident" },
    anxious: { label: "Anxious", icon: "anxious" }
};

const state = {
    currentView: "home",
    currentSetupStep: 1,
    user: null,
    journals: [],
    showAllJournals: false,
    selectedDate: "",
    selectedJournalId: null,
    addMarketType: null,
    addFutureCategory: null,
    selectedPosition: null,
    pnlSign: null,
    selectedFeel: null,
    screenshotData: null,
    introFinished: false,
    authenticated: false,
    profile: { username:"", bio:"Membangun konsistensi, satu trade setiap kali.", avatar:null },
    theme: "system",
    language: "id"
};

const $ = (id) => document.getElementById(id);

const introScreen = $("introScreen");
const welcomeScreen = $("welcomeScreen");
const setupScreen = $("setupScreen");
const authGateScreen = $("authGateScreen");
const mainApp = $("mainApp");

const startSetupBtn = $("startSetupBtn");
const authGateContainer = $("authGateContainer");
const authLoginPanel = $("authLoginPanel");
const authSignupPanel = $("authSignupPanel");
const authLoginScale = $("authLoginScale");
const authSignupScale = $("authSignupScale");
const authOverlay = $("authOverlay");
const authOverlayScale = $("authOverlayScale");
const authArrowBtn = $("authArrowBtn");
const authOverlayTitle = $("authOverlayTitle");
const authOverlayDescription = $("authOverlayDescription");
const authSwitchHint = $("authSwitchHint");
const authLoginForm = $("authLoginForm");
const authSignupForm = $("authSignupForm");
const authSignupName = $("authSignupName");
const setupStep1 = $("setupStep1");
const setupStep2 = $("setupStep2");
const step1Btn = $("step1Btn");
const backStepBtn = $("backStepBtn");
const finishSetupBtn = $("finishSetupBtn");

const userNameInput = $("userName");
const accountNameInput = $("accountName");
const startingBalanceInput = $("startingBalance");
const currencyInput = $("currency");

const homeGreeting = $("homeGreeting");
const homeBalance = $("homeBalance");
const homeTodayResult = $("homeTodayResult");
const homeTradeCount = $("homeTradeCount");
const homeWinRate = $("homeWinRate");

const profileInitial = $("profileInitial");
const profileName = $("profileName");
const profileNameValue = $("profileNameValue");
const profileAccountValue = $("profileAccountValue");
const profileBalanceValue = $("profileBalanceValue");
const profileCurrencyValue = $("profileCurrencyValue");
const profileDominantFeel = $("profileDominantFeel");
const profilePsychologyNote = $("profilePsychologyNote");
const psychologyFace = $("psychologyFace");
const profileAvatarButton = $("profileAvatarButton");
const profileAvatarInput = $("profileAvatarInput");
const profileAvatarImage = $("profileAvatarImage");
const editProfileBtn = $("editProfileBtn");
const profileEditModal = $("profileEditModal");
const profileEditName = $("profileEditName");
const profileEditUsername = $("profileEditUsername");
const profileEditBio = $("profileEditBio");
const saveProfileBtn = $("saveProfileBtn");
const profileUsername = $("profileUsername");
const profileBio = $("profileBio");
const profileTradeCount = $("profileTradeCount");
const profileWinRate = $("profileWinRate");
const profileNetResult = $("profileNetResult");
const editAccountBtn = $("editAccountBtn");
const accountEditModal = $("accountEditModal");
const accountEditName = $("accountEditName");
const accountEditAccountName = $("accountEditAccountName");
const accountEditBalance = $("accountEditBalance");
const accountEditCurrency = $("accountEditCurrency");
const saveAccountBtn = $("saveAccountBtn");
const themeSelect = $("themeSelect");
const languageSelect = $("languageSelect");

const quickJournalBtn = $("quickJournalBtn");
const addJournalBtn = $("addJournalBtn");

const journalModal = $("journalModal");
const detailModal = $("detailModal");
const infoModal = $("infoModal");

const journalForm = $("journalForm");
const journalDate = $("journalDate");
const journalPair = $("journalPair");
const positionField = $("positionField");
const spotPositionNotice = $("spotPositionNotice");
const journalPnl = $("journalPnl");
const pnlAmountWrap = $("pnlAmountWrap");
const pnlSignPreview = $("pnlSignPreview");
const journalEntry = $("journalEntry");
const journalSl = $("journalSl");
const journalTp = $("journalTp");
const journalSetup = $("journalSetup");
const journalMethod = $("journalMethod");
const journalScreenshot = $("journalScreenshot");
const uploadBox = $("uploadBox");
const imagePreviewWrap = $("imagePreviewWrap");
const imagePreview = $("imagePreview");
const removeImageBtn = $("removeImageBtn");

const journalDateFilter = $("journalDateFilter");
const clearDateFilterBtn = $("clearDateFilterBtn");
const journalList = $("journalList");
const journalCountLabel = $("journalCountLabel");
const journalCountText = $("journalCountText");
const journalMoreWrap = $("journalMoreWrap");
const journalMoreInfo = $("journalMoreInfo");
const showAllJournalsBtn = $("showAllJournalsBtn");

const toast = $("toast");
const deleteJournalBtn = $("deleteJournalBtn");

document.addEventListener("DOMContentLoaded", init);
function init() {
    loadData();
    bindEvents();
    initializePreferences();
    setTodayDefaults();
    initializeNotificationSystem();
    ensureLocalSignOutButton();
    initializeLocalAccountSystem();
    initializeIntro();
}

function bindEvents() {
    startSetupBtn.addEventListener("click", () => {
        showScreen(authGateScreen);
        initializeAuthGate();
    });

    authArrowBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        if (authDidDrag) {
            authDidDrag = false;
            return;
        }
        toggleAuthMode();
    });

    authOverlay?.addEventListener("pointerdown", handleAuthPointerDown);
    authOverlay?.addEventListener("pointermove", handleAuthPointerMove);
    authOverlay?.addEventListener("pointerup", finishAuthDrag);
    authOverlay?.addEventListener("pointercancel", cancelAuthDrag);
    authLoginForm?.addEventListener("submit", handleAuthLogin);
    authSignupForm?.addEventListener("submit", handleAuthSignup);



    step1Btn.addEventListener("click", handleSetupStepOne);
    backStepBtn.addEventListener("click", () => showSetupStep(1));
    finishSetupBtn.addEventListener("click", handleFinishSetup);

    quickJournalBtn.addEventListener("click", () => openJournalModal());
    addJournalBtn.addEventListener("click", () => openJournalModal());

    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => navigateTo(btn.dataset.view));
    });

    document.querySelectorAll("[data-navigate]").forEach((card) => {
        card.addEventListener("click", () => navigateTo(card.dataset.navigate));
    });

    document.querySelectorAll("[data-close-modal]").forEach((el) => {
        el.addEventListener("click", () => closeModal($(el.dataset.closeModal)));
    });

    document.querySelectorAll("[data-market-type]").forEach((btn) => {
        btn.addEventListener("click", () => chooseMarketType(btn.dataset.marketType));
    });

    document.querySelectorAll("[data-future-category]").forEach((btn) => {
        btn.addEventListener("click", () => chooseFutureCategory(btn.dataset.futureCategory));
    });

    $("futureBackBtn").addEventListener("click", () => showAddFlowStep("marketStep"));

    document.querySelectorAll("[data-position]").forEach((btn) => {
        btn.addEventListener("click", () => choosePosition(btn.dataset.position));
    });

    document.querySelectorAll("[data-pnl-sign]").forEach((btn) => {
        btn.addEventListener("click", () => choosePnlSign(btn.dataset.pnlSign));
    });

    document.querySelectorAll("[data-feel]").forEach((btn) => {
        btn.addEventListener("click", () => chooseFeel(btn.dataset.feel));
    });

    journalForm.addEventListener("submit", handleJournalSubmit);
    journalScreenshot.addEventListener("change", handleScreenshotUpload);
    removeImageBtn.addEventListener("click", removeScreenshot);

    profileAvatarButton.addEventListener("click", () => profileAvatarInput.click());
    profileAvatarInput.addEventListener("change", handleProfileAvatarUpload);
    editProfileBtn.addEventListener("click", openProfileEditor);
    saveProfileBtn.addEventListener("click", saveProfileEditor);
    editAccountBtn?.addEventListener("click", openAccountEditor);
    saveAccountBtn?.addEventListener("click", saveAccountEditor);
    themeSelect.addEventListener("change", (event) => applyTheme(event.target.value));
    languageSelect.addEventListener("change", (event) => applyLanguage(event.target.value));

    journalDateFilter.addEventListener("change", () => {
        state.selectedDate = journalDateFilter.value;
        state.showAllJournals = false;
        renderJournal();
    });

    clearDateFilterBtn.addEventListener("click", () => {
        journalDateFilter.value = "";
        state.selectedDate = "";
        state.showAllJournals = false;
        renderJournal();
    });

    showAllJournalsBtn.addEventListener("click", () => {
        state.showAllJournals = true;
        renderJournal();
    });

    deleteJournalBtn.addEventListener("click", deleteSelectedJournal);

    $("resetAppBtn")?.addEventListener("click", resetApplication);

    $("tradingPrefsInfoBtn")?.addEventListener("click", () => {
        openInfoModal(
            "Trading Preferences",
            "Bagian ini kita siapkan sebagai tempat risk, session, timeframe, dan preferensi trading. Field tersebut belum dipakai untuk perhitungan journal saat ini."
        );
    });

    $("notificationBtn")?.addEventListener("click", toggleNotificationCenter);

    userNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleSetupStepOne();
    });

    window.addEventListener("hashchange", handleHashRoute);
}

/* Local startup routing is in local-auth.js. */

/* =========================================================
   AUTH GATE
========================================================= */

let authSignupOpen = false;
let authDragging = false;
let authDidDrag = false;
let authPointerStartX = 0;
let authPointerStartY = 0;
let authOverlayStartX = 0;
let authOverlayStartY = 0;
let authResizeTimer = null;
let authBorderAnimationFrame = null;

const AUTH_SWIPE_THRESHOLD = 75;
const AUTH_BORDER_SPEED = 0.006;

function isAuthMobile() {
    return window.matchMedia("(max-width: 700px)").matches;
}

function updateAuthOverlayContent() {
    const mobile = isAuthMobile();
    const en = state.language === "en";

    if (!authSignupOpen) {
        authOverlayTitle.textContent = t("welcomeBackShort");
        authOverlayDescription.textContent = t("loginDescription");
        authArrowBtn.textContent = mobile ? "↑" : "←";
        authArrowBtn.setAttribute("aria-label", en ? "Open sign up" : "Buka pendaftaran");
        authSwitchHint.textContent = t("swipeToSignup");
    } else {
        authOverlayTitle.textContent = t("newAccount");
        authOverlayDescription.textContent = t("signupDescription");
        authArrowBtn.textContent = mobile ? "↓" : "→";
        authArrowBtn.setAttribute("aria-label", en ? "Back to login" : "Kembali ke masuk");
        authSwitchHint.textContent = t("swipeToLogin");
    }
}

function applyAuthState(animate = true) {
    if (!authGateContainer) return;
    if (!animate) {
        const oldTransition = authOverlay.style.transition;
        authOverlay.style.transition = "none";
        authGateContainer.classList.toggle("signup-open", authSignupOpen);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            authOverlay.style.transition = oldTransition;
        }));
    } else {
        authGateContainer.classList.toggle("signup-open", authSignupOpen);
    }
    updateAuthOverlayContent();
}

function scaleAuthContentToPanel(panel, scaleElement) {
    if (!panel || !scaleElement) return;
    scaleElement.style.transform = "scale(1)";
    void scaleElement.offsetWidth;
    const availableWidth = panel.clientWidth;
    const availableHeight = panel.clientHeight;
    const contentWidth = scaleElement.scrollWidth;
    const contentHeight = scaleElement.scrollHeight;
    if (availableWidth <= 0 || availableHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) return;
    const safeWidth = availableWidth * .88;
    const safeHeight = availableHeight * .88;
    const scale = Math.min(1, safeWidth / contentWidth, safeHeight / contentHeight);
    scaleElement.style.transform = `scale(${Math.max(.62, scale)})`;
}

function resizeAuthInnerContent() {
    requestAnimationFrame(() => {
        scaleAuthContentToPanel(authLoginPanel, authLoginScale);
        scaleAuthContentToPanel(authSignupPanel, authSignupScale);
        scaleAuthContentToPanel(authOverlay, authOverlayScale);
    });
}

function toggleAuthMode() {
    authSignupOpen = !authSignupOpen;
    applyAuthState(true);
    resizeAuthInnerContent();
}

function handleAuthPointerDown(event) {
    if (event.target.closest(".arrow-btn")) return;

    authDragging = true;
    authDidDrag = false;
    authPointerStartX = event.clientX;
    authPointerStartY = event.clientY;

    if (isAuthMobile()) {
        authOverlayStartY = authSignupOpen ? -authOverlay.offsetHeight : 0;
    } else {
        authOverlayStartX = authSignupOpen ? -authOverlay.offsetWidth : 0;
    }

    authOverlay.classList.add("dragging");
    authGateContainer.classList.add("is-dragging");

    try { authOverlay.setPointerCapture(event.pointerId); } catch (_) {}
}

function handleAuthPointerMove(event) {
    if (!authDragging) return;

    const deltaX = event.clientX - authPointerStartX;
    const deltaY = event.clientY - authPointerStartY;

    if (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7) authDidDrag = true;

    if (isAuthMobile()) {
        const distance = authOverlay.offsetHeight;
        const nextY = Math.max(-distance, Math.min(0, authOverlayStartY + deltaY));
        authOverlay.style.transform = `translate3d(0, ${nextY}px, 0)`;
        return;
    }

    const distance = authOverlay.offsetWidth;
    const nextX = Math.max(-distance, Math.min(0, authOverlayStartX + deltaX));
    authOverlay.style.transform = `translate3d(${nextX}px, 0, 0)`;
}

function finishAuthDrag(event) {
    if (!authDragging) return;

    authDragging = false;
    authOverlay.classList.remove("dragging");
    authGateContainer.classList.remove("is-dragging");

    const deltaX = event.clientX - authPointerStartX;
    const deltaY = event.clientY - authPointerStartY;

    if (isAuthMobile()) {
        if (!authSignupOpen && deltaY < -AUTH_SWIPE_THRESHOLD) authSignupOpen = true;
        else if (authSignupOpen && deltaY > AUTH_SWIPE_THRESHOLD) authSignupOpen = false;
    } else {
        if (!authSignupOpen && deltaX < -AUTH_SWIPE_THRESHOLD) authSignupOpen = true;
        else if (authSignupOpen && deltaX > AUTH_SWIPE_THRESHOLD) authSignupOpen = false;
    }

    authOverlay.style.transform = "";
    applyAuthState(true);
    resizeAuthInnerContent();

    try { authOverlay.releasePointerCapture(event.pointerId); } catch (_) {}
}

function cancelAuthDrag(event) {
    authDragging = false;
    authOverlay.classList.remove("dragging");
    authGateContainer.classList.remove("is-dragging");
    authOverlay.style.transform = "";
    applyAuthState(false);
    resizeAuthInnerContent();
    try { authOverlay.releasePointerCapture(event.pointerId); } catch (_) {}
}

function getAuthBorderPoint(distance, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    const topLength = Math.max(0, width - 2 * r);
    const sideLength = Math.max(0, height - 2 * r);
    const cornerLength = Math.PI * r / 2;
    const perimeter = topLength * 2 + sideLength * 2 + cornerLength * 4;
    let d = distance % perimeter;
    if (d < 0) d += perimeter;

    if (d <= topLength) return { x: r + d, y: 0 };
    d -= topLength;

    if (d <= cornerLength) {
        const angle = -Math.PI / 2 + d / r;
        return { x: width-r+Math.cos(angle)*r, y:r+Math.sin(angle)*r };
    }
    d -= cornerLength;

    if (d <= sideLength) return { x: width, y:r+d };
    d -= sideLength;

    if (d <= cornerLength) {
        const angle = d / r;
        return { x: width-r+Math.cos(angle)*r, y:height-r+Math.sin(angle)*r };
    }
    d -= cornerLength;

    if (d <= topLength) return { x: width-r-d, y:height };
    d -= topLength;

    if (d <= cornerLength) {
        const angle = Math.PI / 2 + d / r;
        return { x:r+Math.cos(angle)*r, y:height-r+Math.sin(angle)*r };
    }
    d -= cornerLength;

    if (d <= sideLength) return { x:0, y:height-r-d };
    d -= sideLength;

    const angle = Math.PI + d / r;
    return { x:r+Math.cos(angle)*r, y:r+Math.sin(angle)*r };
}

function initializeAuthBorderStars() {
    if (!authGateContainer) return;
    const stars = authGateContainer.querySelectorAll(".border-star");
    if (!stars.length) return;

    const rect = authGateContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const style = getComputedStyle(authGateContainer);
    let radius = parseFloat(style.borderTopLeftRadius);
    if (!Number.isFinite(radius)) radius = 24;

    const r = Math.min(radius, width / 2, height / 2);
    const topLength = Math.max(0, width - 2*r);
    const sideLength = Math.max(0, height - 2*r);
    const cornerLength = Math.PI * r / 2;
    const perimeter = topLength * 2 + sideLength * 2 + cornerLength * 4;
    const positions = [.015,.135,.255,.385,.515,.645,.775,.905];

    stars.forEach((star,index) => {
        star.dataset.distance = String(perimeter * positions[index]);
        const duration = 2.7 + (index % 4) * .45;
        star.style.setProperty("--twinkle-duration", `${duration}s`);
        star.style.animationDelay = `${-(index * .37)}s`;
        star.classList.add("active");
    });
}

function animateAuthBorderStars() {
    if (!authGateContainer) return;
    const stars = authGateContainer.querySelectorAll(".border-star");
    const rect = authGateContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const style = getComputedStyle(authGateContainer);
    let radius = parseFloat(style.borderTopLeftRadius);
    if (!Number.isFinite(radius)) radius = 24;

    const r = Math.min(radius, width / 2, height / 2);
    const topLength = Math.max(0, width - 2*r);
    const sideLength = Math.max(0, height - 2*r);
    const cornerLength = Math.PI * r / 2;
    const perimeter = topLength * 2 + sideLength * 2 + cornerLength * 4;

    stars.forEach((star) => {
        let distance = parseFloat(star.dataset.distance);
        if (!Number.isFinite(distance)) distance = 0;
        distance += 16.67 * AUTH_BORDER_SPEED;
        if (distance >= perimeter) distance -= perimeter;
        star.dataset.distance = String(distance);
        const point = getAuthBorderPoint(distance, width, height, r);
        star.style.left = `${point.x}px`;
        star.style.top = `${point.y}px`;
    });

    authBorderAnimationFrame = requestAnimationFrame(animateAuthBorderStars);
}

function startAuthBorderAnimation() {
    if (authBorderAnimationFrame) cancelAnimationFrame(authBorderAnimationFrame);
    initializeAuthBorderStars();
    authBorderAnimationFrame = requestAnimationFrame(animateAuthBorderStars);
}

function initializeAuthGate() {
    authSignupOpen = false;
    if (authOverlay) authOverlay.style.transform = "";
    applyAuthState(false);
    resizeAuthInnerContent();
    startAuthBorderAnimation();
}

function handleAuthResize() {
    clearTimeout(authResizeTimer);
    authResizeTimer = setTimeout(() => {
        if (!authGateScreen || authGateScreen.classList.contains("hidden")) return;
        authOverlay.style.transform = "";
        updateAuthOverlayContent();
        resizeAuthInnerContent();
        initializeAuthBorderStars();
        applyAuthState(false);
    }, 80);
}

window.addEventListener("resize", handleAuthResize);
window.addEventListener("orientationchange", handleAuthResize);

/* Local login/signup handlers are in local-auth.js. */

/* =========================================================
   STORAGE
========================================================= */

/* Account-scoped persistence is in local-auth.js. */

function initializePreferences() {
    applyTheme(state.theme, false);
    applyLanguage(state.language, false);
}

function safeJSONParse(raw, fallback) {
    if (!raw) return fallback;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error(
            "Storage parse error:",
            error
        );

        return fallback;
    }
}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(screenElement) {
    [
        welcomeScreen,
        authGateScreen,
        setupScreen,
        mainApp
    ].forEach((screen) => {
        screen.classList.add("hidden");
    });

    screenElement.classList.remove("hidden");
}

function showSetupStep(step) {
    state.currentSetupStep = step;

    setupStep1.classList.toggle(
        "active",
        step === 1
    );

    setupStep2.classList.toggle(
        "active",
        step === 2
    );

    const indicators =
        setupScreen.querySelectorAll(
            ".setup-top .setup-step span"
        );

    indicators.forEach(
        (indicator, index) => {
            indicator.classList.toggle(
                "active",
                index < step
            );
        }
    );

    if (step === 1) {
        setTimeout(
            () => userNameInput.focus(),
            100
        );
    } else {
        setTimeout(
            () => accountNameInput.focus(),
            100
        );
    }
}

function openMainApp() {
    showScreen(mainApp);

    updateUserInterface();
    updateAllAnalytics();

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();

    state.currentView =
        [
            "home",
            "journal",
            "statistics",
            "profile"
        ].includes(hash)
            ? hash
            : "home";

    navigateTo(
        state.currentView,
        false
    );
}


/* =========================================================
   SETUP
========================================================= */

function handleSetupStepOne() {
    const name =
        userNameInput.value.trim();

    if (!name) {
        setFieldError(
            userNameInput,
            $("userNameError"),
            t("setupNameError")
        );

        return;
    }

    clearFieldError(
        userNameInput,
        $("userNameError")
    );

    showSetupStep(2);
}

/* Local setup completion is in local-auth.js. */

function setTodayDefaults() {
    const today =
        toLocalDateInputValue(
            new Date()
        );

    journalDate.value = today;
    journalDateFilter.max = today;
}

function toLocalDateInputValue(date) {
    const y =
        date.getFullYear();

    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const d =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(
    viewName,
    updateHash = true
) {
    const available = [
        "home",
        "journal",
        "statistics",
        "profile"
    ];

    if (!available.includes(viewName)) {
        viewName = "home";
    }

    state.currentView = viewName;

    document
        .querySelectorAll(".page-view")
        .forEach((view) => {
            view.classList.remove(
                "active"
            );
        });

    const target =
        $(`${viewName}View`);

    if (target) {
        void target.offsetWidth;

        target.classList.add(
            "active"
        );
    }

    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.view === viewName
            );
        });

    if (updateHash) {
        const nextHash =
            `#${viewName}`;

        if (
            window.location.hash !==
            nextHash
        ) {
            history.replaceState(
                null,
                "",
                nextHash
            );
        }
    }

    if (viewName === "journal") {
        renderJournal();
    }

    if (viewName === "statistics") {
        renderStatistics();
    }

    if (viewName === "profile") {
        renderPsychologyProfile();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function handleHashRoute() {
    if (
        !state.introFinished ||
        mainApp.classList.contains(
            "hidden"
        )
    ) {
        return;
    }

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();

    if (
        [
            "home",
            "journal",
            "statistics",
            "profile"
        ].includes(hash)
    ) {
        navigateTo(
            hash,
            false
        );
    }
}


/* =========================================================
   JOURNAL MODAL FLOW
========================================================= */

function openJournalModal() {
    resetJournalForm();
    openModal(journalModal);
    showAddFlowStep("marketStep");
}

function showAddFlowStep(stepId) {
    document
        .querySelectorAll(
            "#journalModal .add-flow-step"
        )
        .forEach((step) => {
            step.classList.remove(
                "active"
            );
        });

    const target =
        $(stepId);

    if (target) {
        target.classList.add(
            "active"
        );

        journalModal
            .querySelector(".modal-sheet")
            .scrollTop = 0;
    }
}

function chooseMarketType(type) {
    state.addMarketType = type;

    if (type === "future") {
        showAddFlowStep(
            "futureCategoryStep"
        );

        return;
    }

    state.addFutureCategory = null;

    prepareJournalForm();
}

function chooseFutureCategory(category) {
    state.addFutureCategory =
        category;

    prepareJournalForm();
}

function prepareJournalForm() {
    showAddFlowStep(
        "journalFormStep"
    );

    const market =
        state.addMarketType === "future"
            ? `Future • ${capitalize(
                  state.addFutureCategory
              )}`
            : "Spot";

    $("selectedTradeBadges").innerHTML = `
        <span class="trade-badge">
            ${escapeHTML(market)}
        </span>

        <span class="trade-badge">
            ${
                state.addMarketType === "spot"
                    ? "BUY ONLY"
                    : "POSITION REQUIRED"
            }
        </span>
    `;

    if (
        state.addMarketType ===
        "spot"
    ) {
        positionField.classList.add(
            "hidden"
        );

        spotPositionNotice.classList.remove(
            "hidden"
        );
    } else {
        positionField.classList.remove(
            "hidden"
        );

        spotPositionNotice.classList.add(
            "hidden"
        );
    }

    journalPair.focus();
}

function resetJournalForm() {
    journalForm.reset();

    state.addMarketType = null;
    state.addFutureCategory = null;
    state.selectedPosition = null;
    state.pnlSign = null;
    state.selectedFeel = null;
    state.screenshotData = null;

    document
        .querySelectorAll(
            ".inline-choice"
        )
        .forEach((btn) => {
            btn.classList.remove(
                "selected"
            );
        });

    document
        .querySelectorAll(
            ".pnl-choice"
        )
        .forEach((btn) => {
            btn.classList.remove(
                "selected"
            );
        });

    document
        .querySelectorAll(
            ".feel-choice"
        )
        .forEach((btn) => {
            btn.classList.remove(
                "selected"
            );
        });

    pnlAmountWrap.classList.add(
        "hidden"
    );

    imagePreviewWrap.classList.add(
        "hidden"
    );

    imagePreview.removeAttribute(
        "src"
    );

    journalDate.value =
        toLocalDateInputValue(
            new Date()
        );

    clearAllJournalErrors();
}

function choosePosition(position) {
    state.selectedPosition =
        position;

    document
        .querySelectorAll(
            "[data-position]"
        )
        .forEach((btn) => {
            btn.classList.toggle(
                "selected",
                btn.dataset.position ===
                    position
            );
        });

    clearCustomFieldError(
        "journalPosition"
    );
}

function choosePnlSign(sign) {
    state.pnlSign = sign;

    document
        .querySelectorAll(
            "[data-pnl-sign]"
        )
        .forEach((btn) => {
            btn.classList.toggle(
                "selected",
                btn.dataset.pnlSign ===
                    sign
            );
        });

    pnlAmountWrap.classList.remove(
        "hidden"
    );

    pnlSignPreview.textContent =
        sign === "positive"
            ? "+"
            : "-";

    pnlSignPreview.classList.toggle(
        "positive-text",
        sign === "positive"
    );

    pnlSignPreview.classList.toggle(
        "negative-text",
        sign === "negative"
    );

    clearCustomFieldError(
        "journalPnl"
    );

    setTimeout(
        () => journalPnl.focus(),
        80
    );
}

function chooseFeel(feel) {
    state.selectedFeel =
        feel;

    document
        .querySelectorAll(
            "[data-feel]"
        )
        .forEach((btn) => {
            btn.classList.toggle(
                "selected",
                btn.dataset.feel ===
                    feel
            );
        });

    clearCustomFieldError(
        "journalFeel"
    );
}

async function handleScreenshotUpload(
    event
) {
    const file =
        event.target.files?.[0];

    if (!file) return;

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        showToast(
            "File harus berupa gambar."
        );

        event.target.value = "";

        return;
    }

    try {
        state.screenshotData =
            await compressImage(
                file,
                1280,
                0.78
            );

        imagePreview.src =
            state.screenshotData;

        imagePreviewWrap.classList.remove(
            "hidden"
        );

        showToast(
            "Screenshot siap disimpan."
        );
    } catch (error) {
        console.error(error);

        showToast(
            "Gagal memproses screenshot."
        );

        event.target.value = "";
    }
}

function removeScreenshot() {
    state.screenshotData = null;

    journalScreenshot.value = "";

    imagePreview.removeAttribute(
        "src"
    );

    imagePreviewWrap.classList.add(
        "hidden"
    );
}

function compressImage(
    file,
    maxWidth = 1280,
    quality = 0.78
) {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload = () => {
                const img =
                    new Image();

                img.onload = () => {
                    const scale =
                        Math.min(
                            1,
                            maxWidth /
                                img.width
                        );
                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        Math.round(
                            img.width *
                                scale
                        );

                    canvas.height =
                        Math.round(
                            img.height *
                                scale
                        );

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    if (!ctx) {
                        reject(
                            new Error(
                                "Canvas unavailable"
                            )
                        );

                        return;
                    }

                    ctx.drawImage(
                        img,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            quality
                        )
                    );
                };

                img.onerror = () =>
                    reject(
                        new Error(
                            "Invalid image"
                        )
                    );

                img.src =
                    reader.result;
            };

            reader.onerror = () =>
                reject(
                    reader.error ||
                        new Error(
                            "Read error"
                        )
                );

            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   SAVE JOURNAL
========================================================= */

function handleJournalSubmit(
    event
) {
    event.preventDefault();

    const data =
        collectJournalFormData();

    const validation =
        validateJournal(data);

    if (!validation.valid) {
        focusFirstInvalid(
            validation.firstInvalid
        );

        showToast(
            "Lengkapi semua field wajib terlebih dahulu."
        );

        return;
    }

    const journal = {
        id: generateId(),
        createdAt:
            new Date().toISOString(),
        ...data
    };

    state.journals.push(
        journal
    );

    sortJournalsNewestFirst();

    try {
        saveJournals();
        recordTradeNotification(journal);
        syncNotificationInsights();
    } catch (error) {
        console.error(error);

        state.journals =
            state.journals.filter(
                (item) =>
                    item.id !==
                    journal.id
            );

        showToast(
            "Data terlalu besar untuk disimpan di browser. Coba gunakan screenshot yang lebih kecil."
        );

        return;
    }

    updateAllAnalytics();

    closeModal(
        journalModal
    );

    state.selectedDate = "";
    state.showAllJournals = false;

    journalDateFilter.value = "";

    renderJournal();

    navigateTo(
        "journal"
    );

    showToast(
        "Journal berhasil ditambahkan dan dikunci."
    );
}

function collectJournalFormData() {
    const pnlNumber =
        Number(journalPnl.value);

    return {
        date:
            journalDate.value,

        marketType:
            state.addMarketType,

        category:
            state.addMarketType ===
            "future"
                ? state.addFutureCategory
                : null,

        pair:
            journalPair.value.trim(),

        position:
            state.addMarketType ===
            "future"
                ? state.selectedPosition
                : null,

        pnl:
            state.pnlSign ===
            "positive"
                ? Math.abs(
                      pnlNumber
                  )
                : state.pnlSign ===
                      "negative"
                    ? -Math.abs(
                          pnlNumber
                      )
                    : null,

        entryPrice:
            Number(
                journalEntry.value
            ),

        sl:
            Number(
                journalSl.value
            ),

        tp:
            Number(
                journalTp.value
            ),

        setup:
            journalSetup.value.trim(),

        method:
            journalMethod.value.trim(),

        feel:
            state.selectedFeel,

        screenshot:
            state.screenshotData ||
            null
    };
}

function validateJournal(
    data
) {
    clearAllJournalErrors();

    let firstInvalid = null;
    let valid = true;

    const needText = (
        value,
        inputId,
        message
    ) => {
        if (!value) {
            setCustomFieldError(
                inputId,
                message
            );

            valid = false;

            if (!firstInvalid) {
                firstInvalid =
                    inputId;
            }
        }
    };

    const needNumber = (
        value,
        inputId,
        message
    ) => {
        if (!Number.isFinite(value)) {
            setCustomFieldError(
                inputId,
                message
            );

            valid = false;

            if (!firstInvalid) {
                firstInvalid =
                    inputId;
            }
        }
    };

    needText(
        data.date,
        "journalDate",
        t("validationSelectDate")
    );

    needText(
        data.pair,
        "journalPair",
        t("validationPair")
    );

    if (
        data.marketType ===
        "future"
    ) {
        if (!data.category) {
            showToast(
                t("validationFutureCategory")
            );

            valid = false;
        }

        if (!data.position) {
            setCustomFieldError(
                "journalPosition",
                t("validationPosition")
            );

            valid = false;

            if (!firstInvalid) {
                firstInvalid =
                    "journalPosition";
            }
        }
    }

    if (
        data.marketType ===
        "spot"
    ) {
        if (!data.marketType) {
            showToast(
                t("validationMarketType")
            );

            valid = false;
        }
    }

    if (
        data.pnl === null ||
        !Number.isFinite(data.pnl)
    ) {
        setCustomFieldError(
            "journalPnl",
            t("validationPnl")
        );

        valid = false;

        if (!firstInvalid) {
            firstInvalid =
                "journalPnl";
        }
    }

    needNumber(
        data.entryPrice,
        "journalEntry",
        t("validationEntry")
    );

    needNumber(
        data.sl,
        "journalSl",
        t("validationStopLoss")
    );

    needNumber(
        data.tp,
        "journalTp",
        t("validationTakeProfit")
    );

    needText(
        data.setup,
        "journalSetup",
        t("validationSetup")
    );

    needText(
        data.method,
        "journalMethod",
        t("validationMethod")
    );

    if (!data.feel) {
        setCustomFieldError(
            "journalFeel",
            t("validationFeel")
        );

        valid = false;

        if (!firstInvalid) {
            firstInvalid =
                "journalFeel";
        }
    }

    return {
        valid,
        firstInvalid
    };
}

function focusFirstInvalid(id) {
    if (!id) return;

    if (
        id ===
        "journalPosition"
    ) {
        positionField.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    if (
        id ===
        "journalPnl"
    ) {
        document
            .querySelector(
                ".pnl-choice-grid"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        return;
    }

    if (
        id ===
        "journalFeel"
    ) {
        document
            .querySelector(
                ".feel-grid"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        return;
    }

    const input = $(id);

    if (input) {
        input.focus();

        input.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* =========================================================
   JOURNAL RENDER
========================================================= */

function sortJournalsNewestFirst() {
    state.journals.sort(
        (a, b) => {
            return (
                new Date(
                    b.createdAt
                ).getTime() -
                new Date(
                    a.createdAt
                ).getTime()
            );
        }
    );
}

function renderJournal() {
    sortJournalsNewestFirst();

    const filtered =
        getFilteredJournals();

    const total =
        state.journals.length;

    journalCountLabel.textContent =
        filtered.length;

    journalCountText.textContent = state.selectedDate
        ? t("onSelectedDate")
        : filtered.length === 1 ? t("journalSingular") : t("journals");

    clearDateFilterBtn.classList.toggle(
        "visible",
        Boolean(
            state.selectedDate
        )
    );

    if (!filtered.length) {
        journalList.innerHTML =
            renderEmptyJournalState(
                Boolean(
                    state.selectedDate
                )
            );

        journalMoreWrap.classList.add(
            "hidden"
        );

        return;
    }

    const shouldLimit =
        !state.showAllJournals &&
        !state.selectedDate;

    const visible =
        shouldLimit
            ? filtered.slice(0, 7)
            : filtered;

    journalList.innerHTML =
        visible
            .map((journal) =>
                renderJournalCard(
                    journal,
                    filtered
                )
            )
            .join("");

    journalList
        .querySelectorAll(
            "[data-journal-id]"
        )
        .forEach((card) => {
            card.addEventListener(
                "click",
                () =>
                    openJournalDetail(
                        card.dataset
                            .journalId
                    )
            );
        });

    if (
        shouldLimit &&
        filtered.length > 7
    ) {
        journalMoreWrap.classList.remove(
            "hidden"
        );

        journalMoreInfo.textContent =
            `${t("showing7Of", "Showing 7 of")} ${filtered.length} ${t("journals", "journals")}. ${t("sortedNewest", "All journals are ordered from the most recently added.")}`;
    } else if (
        !state.selectedDate &&
        state.showAllJournals &&
        total > 7
    ) {
        journalMoreWrap.classList.remove(
            "hidden"
        );

        journalMoreInfo.textContent =
            `${t("showingAll", "Showing all")} ${filtered.length} ${t("journals", "journals")}.`;

        showAllJournalsBtn.textContent = t("allDisplayed", "Semua journal sudah ditampilkan");

        showAllJournalsBtn.disabled =
            true;

        showAllJournalsBtn.style.opacity =
            ".55";
    } else {
        journalMoreWrap.classList.add(
            "hidden"
        );

        showAllJournalsBtn.disabled =
            false;

        showAllJournalsBtn.style.opacity =
            "";

        showAllJournalsBtn.innerHTML = `${t("seeMore", "Lihat lainnya")} <span>→</span>`;
    }
}

function getFilteredJournals() {
    if (!state.selectedDate) {
        return [
            ...state.journals
        ];
    }

    return state.journals.filter(
        (journal) =>
            journal.date ===
            state.selectedDate
    );
}

function renderJournalCard(
    journal,
    filteredList
) {
    const sameDateEntries =
        state.journals.filter(
            (item) =>
                item.date ===
                journal.date
        );

    let dateIndexLabel = "";

    if (
        sameDateEntries.length >
        1
    ) {
        const chronological =
            [
                ...sameDateEntries
            ].sort(
                (a, b) =>
                    new Date(
                        a.createdAt
                    ) -
                    new Date(
                        b.createdAt
                    )
            );

        const index =
            chronological.findIndex(
                (item) =>
                    item.id ===
                    journal.id
            ) + 1;

        dateIndexLabel =
            `#${index}`;
    }

    const marketLabel =
        journal.marketType ===
        "spot"
            ? "Spot"
            : `Future • ${capitalize(
                  journal.category || ""
              )}`;

    const positionLabel =
        journal.marketType ===
        "spot"
            ? "BUY ONLY"
            : capitalize(
                  journal.position || ""
              );

    const pnl =
        formatSignedNumber(
            journal.pnl
        );

    const pnlClass =
        journal.pnl >= 0
            ? "positive"
            : "negative";

    return `
        <button
            class="journal-card"
            data-journal-id="${escapeHTML(
                journal.id
            )}"
            type="button"
        >
            <div class="journal-card-top">
                <span class="journal-date">
                    ${escapeHTML(
                        formatDateUpper(
                            journal.date
                        )
                    )}
                </span>

                <span class="journal-index">
                    ${dateIndexLabel}
                </span>
            </div>

            <div class="journal-card-middle">
                <div class="journal-pair">
                    <strong>
                        ${escapeHTML(
                            journal.pair
                        )}
                    </strong>

                    <span class="journal-meta">
                        ${escapeHTML(
                            marketLabel
                        )}
                        •
                        ${escapeHTML(
                            positionLabel
                        )}
                    </span>
                </div>

                <strong
                    class="journal-pnl ${pnlClass}"
                >
                    ${escapeHTML(
                        pnl
                    )}
                </strong>
            </div>

            <div class="journal-card-bottom">
                <span>
                    ${escapeHTML(
                        formatFeelLabel(
                            journal.feel
                        )
                    )}
                </span>

                <strong>
                    ${escapeHTML(t("tapToView"))} • <span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"></path></svg></span>
                </strong>
            </div>
        </button>
    `;
}

function renderEmptyJournalState(
    dateFiltered
) {
    if (dateFiltered) {
        return `
            <div class="empty-list-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
                </div>

                <h2>${escapeHTML(t("noJournalDate"))}</h2>

                <p>${escapeHTML(t("noJournalDateDescription"))}
                    <strong>
                        ${escapeHTML(
                            formatDateLong(
                                state.selectedDate
                            )
                        )}
                    </strong>.
                </p>

                <button
                    class="secondary-btn"
                    type="button"
                    id="clearEmptyDateBtn"
                >
                    ${escapeHTML(t("clearFilter"))}
                </button>
            </div>
        `;
    }

    return `
        <div class="empty-list-state">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17M8 6h8M8 10h8"/></svg>
            </div>

            <h2>${escapeHTML(t("noJournalEntries"))}</h2>
            <p>${escapeHTML(t("firstTradeDescription"))}</p>

            <button
                class="primary-btn"
                type="button"
                id="emptyAddJournalBtn"
            >
                ${escapeHTML(t("addFirstTrade"))}
                <span>→</span>
            </button>
        </div>
    `;
}


/* =========================================================
   DETAIL
========================================================= */

function openJournalDetail(id) {
    const journal =
        state.journals.find(
            (item) =>
                item.id === id
        );

    if (!journal) return;

    state.selectedJournalId =
        id;

    $("detailTitle").textContent =
        `${formatDateUpper(
            journal.date
        )}`;

    const marketLabel =
        journal.marketType ===
        "spot"
            ? "Spot"
            : `Future • ${capitalize(
                  journal.category || ""
              )}`;

    const pnlClass =
        journal.pnl >= 0
            ? "pnl-positive"
            : "pnl-negative";

    let html = `
        <div class="detail-grid two">
            ${detailGroup(
                t("market"),
                marketLabel
            )}

            ${detailGroup(
                t("pair"),
                journal.pair
            )}
        </div>

        ${
            journal.marketType ===
            "future"
                ? detailGroup(
                      t("position"),
                      capitalize(
                          journal.position
                      )
                  )
                : ""
        }

        ${detailGroup(
            t("date"),
            formatDateLong(
                journal.date
            )
        )}

        ${detailGroup(
            t("finalPNL"),
            formatSignedNumber(
                journal.pnl
            ),
            pnlClass
        )}

        <div class="detail-grid two">
            ${detailGroup(
                t("entryPrice"),
                formatRawNumber(
                    journal.entryPrice
                )
            )}

            ${detailGroup(
                t("setup"),
                journal.setup
            )}
        </div>
            ${detailGroup(
                t("takeProfit"),
                formatRawNumber(
                    journal.tp
                )
            )}
        </div>

        <div class="detail-grid two">
            ${detailGroup(
                t("method"),
                journal.method
            )}

            ${detailGroupWithIcon(
                t("feel"),
                getFeelEmoji(journal.feel),
                formatFeelLabel(journal.feel)
            )}
        </div>
    `;

    if (journal.screenshot) {
        html += `
            <div class="detail-image-wrap">
                <div class="detail-image-label">
                    SCREENSHOT
                </div>

                <img
                    src="${journal.screenshot}"
                    alt="Trading screenshot"
                >
            </div>
        `;
    } else {
        html += detailGroup(
            t("screenshot"),
            t("notProvidedOptional")
        );
    }

    html += detailGroup(
        t("created"),
        formatCreatedAt(
            journal.createdAt
        )
    );

    $("journalDetailContent")
        .innerHTML = html;

    openModal(detailModal);
}

function detailGroupWithIcon(
    label,
    iconHtml,
    value,
    extraClass = ""
) {
    return `
        <div
            class="detail-group ${extraClass}"
        >
            <span>
                ${escapeHTML(label)}
            </span>

            <strong class="detail-value-with-icon">
                <span class="ui-icon detail-feel-icon" aria-hidden="true">${iconHtml}</span>
                ${escapeHTML(String(value ?? "-"))}
            </strong>
        </div>
    `;
}

function detailGroup(
    label,
    value,
    extraClass = ""
) {
    return `
        <div
            class="detail-group ${extraClass}"
        >
            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    String(
                        value ?? "-"
                    )
                )}
            </strong>
        </div>
    `;
}

function deleteSelectedJournal() {
    const journal = state.journals.find((item) => item.id === state.selectedJournalId);
    if (!journal) return;

    const confirmed = window.confirm(interpolate(t("deleteJournalConfirm"), {
        date: formatDateUpper(journal.date),
        pair: journal.pair
    }));
    if (!confirmed) return;

    state.journals = state.journals.filter((item) => item.id !== state.selectedJournalId);
    saveJournals();
    syncNotificationInsights();
    state.selectedJournalId = null;
    closeModal(detailModal);
    updateAllAnalytics();
    renderJournal();
    showToast(t("journalDeleted"));
}

/* =========================================================
   STATISTICS
========================================================= */

function updateAllAnalytics() {
    updateUserInterface();
    renderJournal();
    renderStatistics();
    renderPsychologyProfile();
}

function calculateStatistics() {
    const journals =
        state.journals;

    const total =
        journals.length;

    const wins =
        journals.filter(
            (item) =>
                Number(item.pnl) > 0
        ).length;

    const losses =
        journals.filter(
            (item) =>
                Number(item.pnl) < 0
        ).length;

    const net =
        journals.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.pnl || 0
                ),
            0
        );

    const rrValues =
        journals
            .map(calculateRR)
            .filter(
                (value) =>
                    Number.isFinite(
                        value
                    ) &&
                    value > 0
            );

    const avgRR =
        rrValues.length
            ? rrValues.reduce(
                  (sum, value) =>
                      sum + value,
                  0
              ) /
              rrValues.length
            : 0;

    const winRate =
        total
            ? (wins / total) *
              100
            : 0;

    const grossProfit =
        journals
            .filter(
                (item) =>
                    Number(
                        item.pnl
                    ) > 0
            )
            .reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.pnl
                    ),
                0
            );

    const grossLossAbs =
        Math.abs(
            journals
                .filter(
                    (item) =>
                        Number(
                            item.pnl
                        ) < 0
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.pnl
                        ),
                    0
                )
        );

    const profitFactor =
        grossLossAbs > 0
            ? grossProfit /
              grossLossAbs
            : grossProfit > 0
              ? Infinity
              : 0;

    return {
        total,
        wins,
        losses,
        net,
        avgRR,
        winRate,
        profitFactor
    };
}

function calculateRR(journal) {
    const entry =
        Number(
            journal.entryPrice
        );

    const sl =
        Number(journal.sl);

    const tp =
        Number(journal.tp);

    if (
        ![
            entry,
            sl,
            tp
        ].every(
            Number.isFinite
        )
    ) {
        return null;
    }

    const risk =
        Math.abs(
            entry - sl
        );

    const reward =
        Math.abs(
            tp - entry
        );

    if (risk <= 0) {
        return null;
    }

    return reward / risk;
}

function renderStatistics() {
    const stats =
        calculateStatistics();

    $("statWinRate")
        .textContent =
        `${formatNumber(
            stats.winRate,
            1
        )}%`;

    $("statWinRateMeta")
        .textContent =
        `${stats.wins} ${t("winsCount")} / ${stats.total} ${t("tradeCountPlural")}`;

    $("statAvgRR")
        .textContent =
        `${formatNumber(
            stats.avgRR,
            2
        )}R`;

    $("statTotalTrades")
        .textContent =
        String(stats.total);

    $("statNetResult")
        .textContent =
        stats.total
            ? formatSignedNumber(
                  stats.net
              )
            : "0";

    $("statNetResult").className =
        stats.net >= 0
            ? "positive"
            : "negative";

    $("statNetResultMeta")
        .textContent =
        stats.total
            ? `PF ${
                  stats.profitFactor ===
                  Infinity
                      ? "∞"
                      : formatNumber(
                            stats.profitFactor,
                            2
                        )
              }`
            : t("statisticsNoJournalMeta");

    renderPerformanceBars();
    renderPsychologyStatistics();
    renderPsychologyInsight();
}

function renderPerformanceBars() {
    const container =
        $("performanceBars");

    if (!state.journals.length) {
        container.innerHTML = `
            <div class="stats-empty-message">${escapeHTML(t("chartEmpty"))}</div>
        `;

        return;
    }

    const chronological =
        [
            ...state.journals
        ]
            .sort(
                (a, b) =>
                    new Date(
                        a.createdAt
                    ) -
                    new Date(
                        b.createdAt
                    )
            )
            .slice(-10);

    const maxAbs =
        Math.max(
            ...chronological.map(
                (item) =>
                    Math.abs(
                        Number(
                            item.pnl ||
                                0
                        )
                    )
            ),
            1
        );

    container.innerHTML =
        chronological
            .map((journal) => {
                const pnl =
                    Number(
                        journal.pnl ||
                            0
                    );

                const height =
                    Math.max(
                        8,
                        Math.round(
                            (Math.abs(
                                pnl
                            ) /
                                maxAbs) *
                                125
                        )
                    );

                const negativeClass =
                    pnl < 0
                        ? "negative"
                        : "";

                return `
                    <div
                        class="performance-bar-col"
                        title="${escapeHTML(
                            journal.pair
                        )} ${escapeHTML(
                            formatSignedNumber(
                                pnl
                            )
                        )}"
                    >
                        <span
                            class="performance-bar-value"
                        >
                            ${escapeHTML(
                                formatShortSigned(
                                    pnl
                                )
                            )}
                        </span>

                        <div
                            class="performance-bar ${negativeClass}"
                            style="height:${height}px;"
                        ></div>

                        <span
                            class="performance-bar-label"
                        >
                            ${escapeHTML(
                                journal.pair
                            )}
                        </span>
                    </div>
                `;
            })
            .join("");
}

function renderPsychologyStatistics() {
    const container =
        $("psychologyStatsList");

    const groups =
        groupByFeel();

    const entries =
        Object.entries(groups);

    if (!entries.length) {
        container.innerHTML = `<div class="stats-empty-message">${escapeHTML(t("noPsychData"))}</div>`;

        return;
    }

    entries.sort(
        (a, b) =>
            b[1].count -
            a[1].count
    );

    container.innerHTML =
        entries
            .map(
                ([
                    feel,
                    data
                ]) => {
                    const winRate =
                        data.count
                            ? (data.wins /
                                  data.count) *
                              100
                            : 0;

                    const avgPnl =
                        data.count
                            ? data.pnl /
                              data.count
                            : 0;

                    return `
                        <div class="psych-row">
                            <div class="psych-row-main">
                                <span class="psych-emoji">
                                    ${getFeelEmoji(
                                        feel
                                    )}
                                </span>

                                <div class="psych-name">
                                    <strong>
                                        ${escapeHTML(
                                            formatFeelLabel(
                                                feel
                                            )
                                        )}
                                    </strong>

                                    <span>${data.count} ${data.count === 1 ? t("tradeCountSingular") : t("tradeCountPlural")}</span>
                                </div>
                            </div>

                            <div class="psych-metric">
                                <span>${escapeHTML(t("winRateMetric"))}</span>

                                <strong>
                                    ${formatNumber(
                                        winRate,
                                        0
                                    )}%
                                </strong>
                            </div>

                            <div class="psych-metric">
                                <span>${escapeHTML(t("avgPNL"))}</span>

                                <strong
                                    class="${
                                        avgPnl >= 0
                                            ? "positive"
                                            : "negative"
                                    }"
                                >
                                    ${escapeHTML(
                                        formatSignedNumber(
                                            avgPnl
                                        )
                                    )}
                                </strong>
                            </div>
                        </div>
                    `;
                }
            )
            .join("");
}

function renderPsychologyInsight() {
    const title =
        $("psychInsightTitle");

    const text =
        $("psychInsightText");

    const groups =
        groupByFeel();

    const entries =
        Object.entries(groups);

    if (!entries.length) {
        title.textContent = t("insightNoDataTitle");
        text.textContent = t("insightNoDataBody");

        return;
    }

    if (
        state.journals.length <
        3
    ) {
        title.textContent = t("insightNeedMoreTitle");
        text.textContent = t("insightNeedMoreBody");

        return;
    }

    const ranked =
        entries
            .map(
                ([
                    feel,
                    data
                ]) => {
                    const winRate =
                        data.count
                            ? (data.wins /
                                  data.count) *
                              100
                            : 0;

                    const avgPnl =
                        data.pnl /
                        data.count;

                    return {
                        feel,
                        count:
                            data.count,
                        winRate,
                        avgPnl
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.avgPnl -
                    a.avgPnl
            );

    const best =
        ranked[0];

    const worst =
        ranked[
            ranked.length - 1
        ];

    if (
        best &&
        worst &&
        best.feel !==
            worst.feel &&
        best.count >= 2 &&
        worst.count >= 2
    ) {
        title.textContent = interpolate(t("insightBestTitle"), { feel: formatFeelLabel(best.feel) });

        const bestName =
            formatFeelLabel(
                best.feel
            );

        const worstName =
            formatFeelLabel(
                worst.feel
            );

        text.textContent = interpolate(t("insightBestBody"), {
            count: best.count,
            best: bestName,
            bestPnl: formatSignedNumber(best.avgPnl),
            worst: worstName,
            worstPnl: formatSignedNumber(worst.avgPnl)
        });

        return;
    }

    const mostFrequent =
        entries.sort(
            (a, b) =>
                b[1].count -
                a[1].count
        )[0];

    const frequentFeel = formatFeelLabel(mostFrequent[0]);
    title.textContent = interpolate(t("insightMostTitle"), { feel: frequentFeel });
    text.textContent = interpolate(t("insightMostBody"), { feel: frequentFeel, count: mostFrequent[1].count });
}

function groupByFeel() {
    const groups = {};

    state.journals.forEach(
        (journal) => {
            if (!journal.feel) {
                return;
            }

            if (
                !groups[
                    journal.feel
                ]
            ) {
                groups[
                    journal.feel
                ] = {
                    count: 0,
                    wins: 0,
                    losses: 0,
                    pnl: 0
                };
            }

            const group =
                groups[
                    journal.feel
                ];

            const pnl =
                Number(
                    journal.pnl ||
                        0
                );

            group.count += 1;
            group.pnl += pnl;

            if (pnl > 0) {
                group.wins += 1;
            }

            if (pnl < 0) {
                group.losses += 1;
            }
        }
    );

    return groups;
}


/* =========================================================
   PROFILE PSYCHOLOGY
========================================================= */

function renderPsychologyProfile() {
    const groups =
        groupByFeel();

    const entries =
        Object.entries(groups);

    if (!entries.length) {
        profileDominantFeel.textContent =
            t("noData", "No data yet");

        psychologyFace.innerHTML =
            `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5A3.5 3.5 0 0 0 5.5 8c0 .8.27 1.54.72 2.13A3.5 3.5 0 0 0 8 16.5c0 1.93 1.57 3.5 3.5 3.5H12V4.5z"/><path d="M15 4.5A3.5 3.5 0 0 1 18.5 8c0 .8-.27 1.54-.72 2.13A3.5 3.5 0 0 1 16 16.5c0 1.93-1.57 3.5-3.5 3.5H12V4.5z"/><path d="M8.5 7.5h1M7.5 12h2M15.5 7.5h-1M16.5 12h-2"/></svg>`;

        profilePsychologyNote.textContent = t("profilePsychologyNoData");

        return;
    }

    entries.sort(
        (a, b) =>
            b[1].count -
            a[1].count
    );

    const [
        feel,
        data
    ] = entries[0];

    const winRate =
        data.count
            ? (data.wins /
                  data.count) *
              100
            : 0;

    const avgPnl =
        data.pnl /
        data.count;

    profileDominantFeel.textContent =
        formatFeelLabel(
            feel
        );

    psychologyFace.innerHTML =
        getFeelEmoji(feel);

    profilePsychologyNote.textContent = interpolate(t("profilePsychologySummary"), {
        feel: formatFeelLabel(feel),
        count: data.count,
        winRate: formatNumber(winRate, 0),
        avgPnl: formatSignedNumber(avgPnl)
    });
}


/* =========================================================
   HOME / PROFILE
========================================================= */

function updateUserInterface() {
    if (!state.user) {
        return;
    }

    const {
        name,
        accountName,
        startingBalance,
        currency
    } = state.user;

    homeGreeting.textContent =
        `${getGreetingByTime()}, ${name}.`;

    homeBalance.textContent =
        formatMoney(
            startingBalance,
            currency
        );

    const today =
        toLocalDateInputValue(
            new Date()
        );

    const todayJournals =
        state.journals.filter(
            (item) =>
                item.date ===
                today
        );

    const todayPnl =
        todayJournals.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.pnl || 0
                ),
            0
        );

    const stats =
        calculateStatistics();

    homeTodayResult.textContent =
        formatMoney(
            todayPnl,
            currency
        );
    homeTodayResult.className =
        todayPnl >= 0
            ? "positive"
            : "negative";

    homeTradeCount.textContent =
        String(stats.total);

    homeWinRate.textContent =
        `${formatNumber(
            stats.winRate,
            0
        )}%`;

    profileName.textContent =
        name;

    profileNameValue.textContent =
        name;

    profileAccountValue.textContent =
        accountName;

    profileBalanceValue.textContent =
        formatMoney(
            startingBalance,
            currency
        );

    profileCurrencyValue.textContent =
        currency;

    profileInitial.textContent = name.charAt(0).toUpperCase();
    profileUsername.textContent = state.profile.username ? `@${state.profile.username.replace(/^@+/, "")}` : "@trader";
    profileBio.textContent = state.profile.bio || I18N[state.language].defaultBio;
    profileTradeCount.textContent = String(stats.total);
    profileWinRate.textContent = `${formatNumber(stats.winRate, 0)}%`;
    profileNetResult.textContent = formatMoney(stats.net, currency);
    renderProfileAvatar();
}


/* =========================================================
   MODALS
========================================================= */

function openModal(
    modalElement
) {
    modalElement.classList.remove(
        "hidden"
    );

    modalElement.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function closeModal(
    modalElement
) {
    if (!modalElement) {
        return;
    }

    modalElement.classList.add(
        "hidden"
    );

    modalElement.setAttribute(
        "aria-hidden",
        "true"
    );

    const anyOpen =
        document.querySelector(
            ".modal:not(.hidden)"
        );

    if (!anyOpen) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

function openInfoModal(
    title,
    text
) {
    $("infoModalTitle")
        .textContent = title;

    $("infoModalText")
        .textContent = text;

    openModal(infoModal);
}

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        document
            .querySelectorAll(
                ".modal:not(.hidden)"
            )
            .forEach(
                (modal) => {
                    closeModal(
                        modal
                    );
                }
            );
    }
);


/* =========================================================
   PROFILE / PREFERENCES
========================================================= */

function openAccountEditor() {
    if (!state.user) return;

    accountEditName.value = state.user.name || "";
    accountEditAccountName.value = state.user.accountName || "";
    accountEditBalance.value = Number.isFinite(Number(state.user.startingBalance))
        ? state.user.startingBalance
        : "";
    accountEditCurrency.value = state.user.currency || "USD";

    openModal(accountEditModal);
    setTimeout(() => accountEditName.focus(), 80);
}

function saveAccountEditor() {
    if (!state.user) return;

    const name = accountEditName.value.trim();
    const accountName = accountEditAccountName.value.trim();
    const balance = Number(accountEditBalance.value);
    const currency = accountEditCurrency.value;

    if (!name) {
        showToast(t("editNameRequired"));
        accountEditName.focus();
        return;
    }

    if (!accountName) {
        showToast(t("editAccountNameRequired"));
        accountEditAccountName.focus();
        return;
    }

    if (!Number.isFinite(balance) || balance < 0) {
        showToast(t("editBalanceInvalid"));
        accountEditBalance.focus();
        return;
    }

    state.user.name = name;
    state.user.accountName = accountName;
    state.user.startingBalance = balance;
    state.user.currency = ["USD", "IDR", "EUR", "GBP"].includes(currency) ? currency : "USD";

    saveUser();
    updateAllAnalytics();
    closeModal(accountEditModal);

    showToast(t("accountInfoUpdated"));
}

function openProfileEditor() {
    if (!state.user) return;
    profileEditName.value = state.user.name || "";
    profileEditUsername.value = state.profile.username ? `@${state.profile.username.replace(/^@+/, "")}` : "";
    profileEditBio.value = state.profile.bio || "";
    openModal(profileEditModal);
    setTimeout(() => profileEditName.focus(), 80);
}

function saveProfileEditor() {
    if (!state.user) return;
    const name = profileEditName.value.trim();
    const username = profileEditUsername.value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
    if (!name) { showToast(t("displayNameRequired")); profileEditName.focus(); return; }
    state.user.name = name;
    state.profile.username = username;
    state.profile.bio = profileEditBio.value.trim() || I18N[state.language].defaultBio;
    saveUser(); saveProfile(); updateUserInterface(); closeModal(profileEditModal);
    showToast(t("profileUpdated"));
}

async function handleProfileAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast(t("chooseImageFile")); event.target.value = ""; return; }
    try { state.profile.avatar = await compressImage(file, 720, 0.82); saveProfile(); renderProfileAvatar(); showToast(t("profilePhotoUpdated")); }
    catch (error) { console.error(error); showToast(t("profilePhotoFailed")); }
    finally { event.target.value = ""; }
}

function renderProfileAvatar() {
    if (!profileAvatarImage || !profileInitial) return;
    if (state.profile.avatar) { profileAvatarImage.src = state.profile.avatar; profileAvatarImage.classList.remove("hidden"); profileInitial.classList.add("hidden"); }
    else { profileAvatarImage.removeAttribute("src"); profileAvatarImage.classList.add("hidden"); profileInitial.classList.remove("hidden"); }
}

const I18N = {
    id: {
        getStarted:"Mulai", continue:"Lanjutkan", back:"← Kembali", enterDashboard:"Masuk ke Dashboard",
        introTagline:"Ruang trading pribadi lo.", welcomeTo:"Selamat datang di", welcomeBody:"Tempat pribadi untuk mencatat, memahami, dan mengevaluasi perjalanan trading lo.", restoreAccountBackup:"Pulihkan akun dari backup",
        welcomeBackShort:"Selamat datang kembali", login:"Masuk", loginDescription:"Masuk ke akun dan lanjutkan perjalanan trading lo.", newAccount:"Akun Baru", signUp:"Daftar", signupDescription:"Buat akun baru dan mulai perjalanan trading lo.", accountId:"ID Akun", password:"Password", name:"Nama", trazeelAuth:"Autentikasi Trazeel", authGestureHint:"Geser panel atau tekan tombol panah untuk berpindah.", swipeToSignup:"Geser untuk Daftar", swipeToLogin:"Geser untuk Masuk",
        accountSetup:"PENGATURAN AKUN", setupNameTitle:"Yuk kenalan dengan", setupNameDescription:"Nama ini akan digunakan untuk menyambut lo di dashboard.", yourNameRequired:"Nama lo *", setupAccountTitle:"Atur", setupAccountDescription:"Data ini menjadi dasar informasi awal dashboard.", accountNameRequired:"Nama akun *", startingBalanceRequired:"Saldo awal *", currencyRequired:"Mata uang *",
        personalDashboard:"DASHBOARD PRIBADI", welcomeBack:"Selamat datang kembali di ruang trading lo.", accountBalance:"SALDO AKUN", todaysResult:"HASIL HARI INI", tradesLabel:"TRADE", winRateLabel:"WIN RATE", yourWorkspace:"RUANG KERJA LO", everythingInOnePlace:"Semua dalam satu tempat.", tradingJournal:"Trading Journal", statistics:"Statistik", psychologyTitle:"Psikologi", profileSettings:"Profil & Pengaturan", readyToLog:"SIAP MENCATAT?", recordNextTrade:"Catat trade berikutnya.",
        journal:"JOURNAL", yourTrades:"Trade lo.", filterDate:"FILTER TANGGAL", journals:"journal", journalSingular:"journal", readTheData:"Baca datanya.", totalTrades:"TOTAL TRADE", journalEntries:"Catatan journal", basedOnSltp:"Berdasarkan SL / TP", netResultLabel:"HASIL BERSIH", performance:"PERFORMA", journalResultOverview:"Ringkasan hasil journal", psychologyInsight:"INSIGHT PSIKOLOGI", seeThePattern:"Lihat polanya.",
        profileLabel:"PROFIL TRADER", editProfile:"Edit", defaultBio:"Membangun konsistensi, satu trade setiap kali.", trades:"Trade", winRate:"Win Rate", netResult:"PNL Bersih", account:"AKUN", accountInformation:"Informasi akun", editAccount:"Edit", editAccountTitle:"Edit Akun", saveAccount:"Simpan Akun", startingBalance:"Saldo Awal", currency:"Mata Uang", psychology:"PSIKOLOGI", yourCurrentProfile:"Profil psikologi lo saat ini.", dominantState:"KONDISI DOMINAN", settings:"PENGATURAN", preferences:"Preferensi", appearance:"Tampilan", appearanceDesc:"Pilih tampilan Trazeel.", language:"Bahasa", languageDesc:"Pilih bahasa antarmuka.", tradingPreferences:"Preferensi Trading", tradingPreferencesDesc:"Risk, sesi, dan timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Hapus seluruh data lokal", signOut:"Keluar", signOutDesc:"Keluar dari akun Trazeel",
        editProfileTitle:"Edit Profil", saveProfile:"Simpan Profil", displayName:"Nama Tampilan", username:"Username", bio:"Bio", whatDidYouTrade:"Apa yang lo tradingkan?", chooseMarket:"Pilih market.", futureMarkets:"Future terbagi menjadi Forex atau Crypto.", chooseTradeType:"Pilih jenis transaksi terlebih dahulu.", spotNotice:"Position tidak diperlukan untuk transaksi Spot.", profit:"Profit", loss:"Loss", tradePositive:"Trade berakhir profit", tradeNegative:"Trade berakhir loss", screenshot:"Screenshot", close:"Tutup", deleteJournal:"Hapus Journal",
        home:"Home", journalNav:"Journal", statsNav:"Statistik", profileNav:"Profil", changeProfilePhoto:"Ganti foto profil", notifications:"Notifikasi", clearDateFilter:"Hapus filter tanggal", namePlaceholder:"Contoh: Zril", accountPlaceholder:"Akun Utama", balancePlaceholder:"1000", pairPlaceholder:"Contoh: XAUUSD", entryPlaceholder:"3342.50", setupPlaceholder:"Liquidity Sweep", methodPlaceholder:"SMC / Price Action / dll.", yourNamePlaceholder:"Nama lo", usernamePlaceholder:"@trader", bioPlaceholder:"Ceritakan perjalanan trading lo...", uploadPrompt:"Upload screenshot trading", showing7Of:"Menampilkan 7 dari", sortedNewest:"Semua journal diurutkan dari yang paling baru ditambahkan.", showingAll:"Menampilkan semua", allDisplayed:"Semua journal sudah ditampilkan", seeMore:"Lihat lainnya", add:"+ Tambah", noData:"Belum ada data.", noPsychData:"Belum ada data psikologi.", statsEmpty:"Grafik akan muncul setelah journal memiliki data.",
        introTagline:"Ruang trading pribadi lo.", tradingSpace:"Ruang Trading", active:"AKTIF", journalFeatureDescription:"Catat entry, setup, hasil trade, kondisi psikologi, dan alasan di balik setiap keputusan.", statisticsFeatureDescription:"Ubah data journal menjadi insight tentang performa trading lo.", psychologyFeatureDescription:"Lihat ringkasan kondisi psikologi berdasarkan trade yang sudah dicatat.", profileFeatureDescription:"Kelola informasi akun, preferensi, dan pengaturan dashboard.", quickActionDescription:"Jangan cuma mengingat trade. Catat.", journalPageDescription:"Catat keputusan trading, bukan cuma hasil akhirnya.", statisticsPageDescription:"Data journal dirangkum menjadi gambaran performa dan pola trading lo.", averageRR:"RATA-RATA RR", chartEmpty:"Grafik akan muncul setelah journal memiliki data.", psychologyByFeel:"PSIKOLOGI BERDASARKAN FEEL", profilePhoto:"Foto profil", noLocalAccounts:"Belum ada akun lokal.", deviceAccounts:"AKUN DI PERANGKAT", accountSwitcher:"Pergantian Akun", addAccount:"+ Tambahkan akun", localAccountsDescription:"Maksimal 3 akun dalam satu perangkat. Setiap akun harus menyetujui Quick Switch sebelum bisa dibuka melalui pintasan.", localData:"DATA LOKAL", backupVault:"Backup Vault", offline:"Offline", deviceBackup:"Cadangan perangkat", backupLocationNotSelected:"Lokasi backup belum dipilih.", chooseBackupLocation:"Pilih lokasi backup", backupNow:"Backup sekarang", restoreBackup:"Pulihkan backup", backupDescription:"Backup mencakup maksimal 3 akun, journal, foto, profil, dan preferensi. File tersimpan di lokasi perangkat yang lo pilih, bukan dikirim ke server.", newRecord:"CATATAN BARU", addJournal:"Tambah Journal", viewOnly:"Hanya Dilihat", journalReadOnlyDescription:"Journal yang sudah disimpan tidak dapat diedit. Data hanya bisa dilihat atau dihapus.", accountPermission:"IZIN AKUN", allowQuickSwitchTitle:"Izinkan Quick Switch?", allowQuickSwitchDescription:"Izinkan akun ini muncul di pintasan pergantian akun?", allow:"Izinkan", notNow:"Jangan sekarang",
        feelCalm:"Tenang", feelNeutral:"Netral", feelFear:"Takut", feelRevenge:"Balas Dendam", feelOverconfident:"Terlalu Percaya Diri", feelAnxious:"Cemas",
        market:"Market", pair:"Pair", position:"Position", date:"Tanggal", finalPNL:"PNL Akhir", entryPrice:"Harga Entry", setup:"Setup", stopLoss:"Stop Loss", takeProfit:"Take Profit", method:"Metode", feel:"Feel", created:"Dibuat", notProvidedOptional:"Tidak diisi (opsional)", screenshotLabel:"SCREENSHOT", tapToView:"Ketuk untuk melihat", noJournalDate:"Tidak ada journal pada tanggal ini.", noJournalDateDescription:"Tidak ada catatan untuk tanggal", clearFilter:"Hapus filter tanggal", noJournalEntries:"Belum ada catatan journal.", firstTradeDescription:"Trade pertama bisa menjadi awal data yang membentuk statistik dan insight psikologi lo.", addFirstTrade:"Catat Trade Pertama", tradeCountSingular:"trade", tradeCountPlural:"trade", winRateMetric:"Win rate", avgPNL:"Rata-rata PNL",
        insightNoDataTitle:"Belum ada cukup data.", insightNoDataBody:"Setelah beberapa trade dicatat, bagian ini akan membaca hubungan antara feel dan hasil trading lo.", insightNeedMoreTitle:"Tambahkan beberapa trade lagi.", insightNeedMoreBody:"Insight psikologi akan lebih bermakna setelah ada beberapa journal, supaya perbandingan antar kondisi tidak terlalu tipis.", insightBestTitle:"{feel} terlihat paling sehat.", insightBestBody:"Dari {count} trade saat {best}, rata-rata PNL tercatat {bestPnl}. {worst} berada di {worstPnl} rata-rata. Gunakan pola ini sebagai bahan evaluasi, bukan alasan untuk memaksakan setup.", insightMostTitle:"{feel} paling sering muncul.", insightMostBody:"Kondisi {feel} muncul pada {count} trade. Belum ada perbedaan yang cukup kuat untuk membuat kesimpulan besar, jadi kumpulkan data tanpa mengubah catatan masa lalu.", profilePsychologyNoData:"Bagian ini membaca kondisi psikologi dari journal trading lo.", profilePsychologySummary:"{feel} adalah kondisi yang paling sering tercatat ({count} trade). Win rate {winRate}% dengan rata-rata PNL {avgPnl}. Insight lebih dalam tersedia di Statistik.",
        notificationTitle:"Notifikasi", notificationSubtitle:"Pantau aktivitas trading lo.", notificationAll:"Semua", notificationTrading:"Trading", notificationRisk:"Risk", notificationPsychology:"Psikologi", notificationMarkAllRead:"Tandai semua dibaca", notificationAllRead:"Semua sudah dibaca", notificationClearAll:"Hapus semua", notificationDelete:"Hapus notifikasi", notificationEmptyTitle:"Belum ada notifikasi.", notificationEmptyFiltered:"Coba pilih kategori lain.", notificationEmptyBody:"Aktivitas penting akan muncul di sini saat Trazeel digunakan.", notificationUnread:"Belum dibaca", notificationConfirmClearAll:"Hapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.", notificationDeleted:"Notifikasi dihapus.", notificationAllDeleted:"Semua notifikasi dihapus.", tradeRecorded:"Trade dicatat", tradeAddedBody:"{pair} berhasil ditambahkan ke journal.", activityReminder:"Pengingat aktivitas", riskReminderBody:"Lo sudah mencatat {count} trade hari ini. Tinjau rencana sebelum membuka posisi berikutnya.", psychologyPattern:"Pola psikologi", psychologyPatternBody:"Kondisi {feel} muncul berulang dalam data journal terbaru lo.",
        deleteJournalConfirm:"Hapus journal {date} • {pair}?\n\nCatatan ini tidak dapat dipulihkan setelah dihapus.", journalDeleted:"Journal berhasil dihapus.", closeLabel:"Tutup", logout:"Keluar", logoutDescription:"Keluar dari akun aktif", logoutSuccess:"Berhasil keluar. Silakan masuk kembali.", switchAllowed:"Izin Quick Switch diaktifkan.", switchDenied:"Izin Quick Switch tidak diaktifkan.", wait:"Tunggu sebentar...", enterIdPassword:"Masukkan ID dan password.", accountNotFound:"ID tidak ditemukan di perangkat ini. Pulihkan backup jika akun berasal dari perangkat lain.", invalidCredentials:"ID atau password salah.", accountAlreadyActive:"Akun tersebut sedang aktif.", switchAlreadyAllowed:"Akun sudah memiliki izin Quick Switch.", loginSuccess:"Berhasil masuk.", loginFailed:"Gagal masuk.", fillSignup:"Lengkapi nama, ID, dan password.", invalidAccountId:"ID harus 3–24 karakter. Gunakan huruf kecil, angka, titik, garis bawah, atau tanda hubung.", passwordMinLength:"Password minimal 8 karakter.", maxAccounts:"Maksimal 3 akun per perangkat.", idAlreadyUsed:"ID sudah digunakan di perangkat ini.", localAccountCreated:"Akun lokal berhasil dibuat.", accountCreateFailed:"Akun gagal dibuat.", accountPrepared:"Akun berhasil disiapkan.", maxAccountsReached:"Batas maksimal 3 akun sudah tercapai.", noLocalAccount:"Belum ada akun lokal.", switchAccount:"Beralih", allowSwitch:"Izinkan switch", revokePermission:"Cabut izin", switchPermissionTitle:"Izinkan Quick Switch?", switchPermissionDescription:"Izinkan akun ini muncul di pintasan pergantian akun? Jika diizinkan, akun dapat dibuka langsung dari menu Profil tanpa memasukkan ID dan password lagi.", switchSuccess:"Berhasil berpindah akun.", switchRevoked:"Izin Quick Switch dicabut.", backupFolderPermission:"Izin folder perlu diaktifkan kembali.", backupUnsupported:"Browser ini belum mendukung folder backup otomatis. Gunakan Backup sekarang.", backupPermissionDenied:"Izin folder backup tidak diberikan.", backupEnabled:"Backup otomatis berhasil diaktifkan.", backupFolderUnavailable:"Folder backup tidak dapat diakses.", backupCreated:"File backup berhasil dibuat.", backupUpdated:"Backup perangkat berhasil diperbarui.", invalidBackup:"File backup tidak valid atau bukan backup Trazeel.", restoreConfirm:"Pulihkan backup ini? Data akun lokal saat ini akan digantikan. Setelah pemulihan, login menggunakan ID dan password dari backup.", restoreFailed:"Backup gagal dipulihkan. Periksa file JSON.", resetConfirm:"Hapus seluruh akun dan data Trazeel dari perangkat ini? File backup di folder tidak ikut terhapus.", resetSuccess:"Seluruh akun lokal berhasil dihapus.",
                lockedRecord:"CATATAN TERKUNCI", journalDetail:"Detail Journal", information:"Informasi", stepOne:"LANGKAH 01", stepTwo:"LANGKAH 02", spot:"Spot", buyOnly:"Buy only", future:"Future", forexCrypto:"Forex / Crypto", forex:"Forex", currencyPairs:"Pasangan mata uang", crypto:"Crypto", cryptoFutures:"Crypto futures", dateFieldLabel:"01. Tanggal", pairFieldLabel:"02. Pair", positionFieldLabel:"03. Position", manual:"Manual", select:"Pilih", buy:"BUY", sell:"SELL", finalPNLFieldLabel:"04. PNL Akhir", chooseResult:"Pilih hasil", entryPriceFieldLabel:"05. Harga Entry", sltpFieldLabel:"06. SL / TP", stopLoss:"STOP LOSS", takeProfit:"TAKE PROFIT", setupFieldLabel:"07. Setup", methodFieldLabel:"08. Metode", feelFieldLabel:"09. Feel", psychologyData:"Data psikologi", screenshotFieldLabel:"10. Screenshot", optional:"Opsional", addImage:"Tambah gambar", optionalImageDescription:"Opsional. Gambar akan dikompres untuk penyimpanan lokal.", remove:"Hapus", requiredFieldsNote:"Semua kolom wajib diisi kecuali screenshot.",
        onSelectedDate:"pada tanggal terpilih", noJournalData:"Belum ada data journal", systemDefault:"Default Sistem", dark:"Gelap", light:"Terang", english:"English", indonesian:"Bahasa Indonesia",
        accountName:'Nama Akun', welcomeBadge:'RUANG TRADING', setupYouSuffix:'kamu.', setupAccountSuffix:'akun.', saveJournalButton:'Tambah Journal', greetingNight:'Selamat malam', greetingMorning:'Selamat pagi', greetingAfternoon:'Selamat siang', greetingEvening:'Selamat sore', winsCount:'menang', statisticsNoJournalMeta:'Belum ada data journal', justNow:'baru saja', minutesAgo:'{count} menit lalu', hoursAgo:'{count} jam lalu', daysAgo:'{count} hari lalu', accountCurrentlyUsed:'Sedang digunakan', quickSwitchActive:'Quick Switch aktif', switchPermissionMissing:'Izin Quick Switch belum diberikan', backupFolderHint:'Pilih folder satu kali untuk mengaktifkan backup otomatis.', backupManualOnly:'Browser ini menggunakan backup file manual.', backupAutoActive:'Backup otomatis aktif. {filename} akan diperbarui saat data berubah.', backupPermissionAgain:'Izin folder perlu diaktifkan kembali.', setupNameError:'Nama wajib diisi.', setupAccountNameError:'Nama akun wajib diisi.', setupBalanceError:'Masukkan saldo awal yang valid.', validationSelectDate:'Pilih tanggal.', validationPair:'Isi pair.', validationFutureCategory:'Pilih kategori Future: Forex atau Crypto.', validationPosition:'Pilih BUY atau SELL.', validationMarketType:'Pilih jenis trade.', validationPnl:'Pilih Profit/Loss dan isi nominalnya.', validationEntry:'Isi harga entry.', validationStopLoss:'Isi Stop Loss.', validationTakeProfit:'Isi Take Profit.', validationSetup:'Isi setup.', validationMethod:'Isi metode.', validationFeel:'Pilih kondisi psikologi.', editNameRequired:'Nama wajib diisi.', editAccountNameRequired:'Nama akun wajib diisi.', editBalanceInvalid:'Saldo awal tidak valid.', accountInfoUpdated:'Informasi akun berhasil diperbarui.', displayNameRequired:'Nama tampilan wajib diisi.', profileUpdated:'Profil berhasil diperbarui.', chooseImageFile:'Pilih file gambar.', profilePhotoUpdated:'Foto profil berhasil diperbarui.', profilePhotoFailed:'Foto profil tidak dapat diproses.'
    },
    en: {
        getStarted:"Get Started", continue:"Continue", back:"← Back", enterDashboard:"Enter Dashboard",
        introTagline:"Your personal trading space.", welcomeTo:"Welcome to", welcomeBody:"A personal space to record, understand, and review your trading journey.", restoreAccountBackup:"Restore account from backup",
        welcomeBackShort:"Welcome Back", login:"Log In", loginDescription:"Log in to your account and continue your trading journey.", newAccount:"New Account", signUp:"Sign Up", signupDescription:"Create an account and start your trading journey.", accountId:"Account ID", password:"Password", name:"Name", trazeelAuth:"TRAZEEL AUTH", authGestureHint:"Swipe the panel or tap the arrow to switch.", swipeToSignup:"Swipe to Sign Up", swipeToLogin:"Swipe to Log In",
        accountSetup:"ACCOUNT SETUP", setupNameTitle:"Let’s get to know", setupNameDescription:"This name will be used to welcome you to the dashboard.", yourNameRequired:"Your name *", setupAccountTitle:"Set your", setupAccountDescription:"These details will be used as the dashboard’s starting information.", accountNameRequired:"Account name *", startingBalanceRequired:"Starting balance *", currencyRequired:"Currency *",
        personalDashboard:"PERSONAL DASHBOARD", welcomeBack:"Welcome back to your trading space.", accountBalance:"ACCOUNT BALANCE", todaysResult:"TODAY’S RESULT", tradesLabel:"TRADES", winRateLabel:"WIN RATE", yourWorkspace:"YOUR WORKSPACE", everythingInOnePlace:"Everything in one place.", tradingJournal:"Trading Journal", statistics:"Statistics", psychologyTitle:"Psychology", profileSettings:"Profile & Settings", readyToLog:"READY TO LOG?", recordNextTrade:"Record your next trade.",
        journal:"JOURNAL", yourTrades:"Your trades.", filterDate:"FILTER DATE", journals:"journals", journalSingular:"journal", readTheData:"Read the data.", totalTrades:"TOTAL TRADES", journalEntries:"Journal entries", basedOnSltp:"Based on SL / TP", netResultLabel:"NET RESULT", performance:"PERFORMANCE", journalResultOverview:"Journal result overview", psychologyInsight:"PSYCHOLOGY INSIGHT", seeThePattern:"See the pattern.",
        profileLabel:"TRADER PROFILE", editProfile:"Edit", defaultBio:"Building consistency, one trade at a time.", trades:"Trades", winRate:"Win Rate", netResult:"Net PNL", account:"ACCOUNT", accountInformation:"Account information", editAccount:"Edit", editAccountTitle:"Edit Account", saveAccount:"Save Account", startingBalance:"Starting Balance", currency:"Currency", psychology:"PSYCHOLOGY", yourCurrentProfile:"Your current psychology profile.", dominantState:"DOMINANT STATE", settings:"SETTINGS", preferences:"Preferences", appearance:"Appearance", appearanceDesc:"Choose how Trazeel looks.", language:"Language", languageDesc:"Choose your interface language.", tradingPreferences:"Trading Preferences", tradingPreferencesDesc:"Risk, session, and timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Delete all local data", signOut:"Sign out", signOutDesc:"Sign out of Trazeel",
        editProfileTitle:"Edit Profile", saveProfile:"Save Profile", displayName:"Display Name", username:"Username", bio:"Bio", whatDidYouTrade:"What did you trade?", chooseMarket:"Choose the market.", futureMarkets:"Future is divided into Forex or Crypto.", chooseTradeType:"Choose the transaction type first.", spotNotice:"Position is not required for Spot transactions.", profit:"Profit", loss:"Loss", tradePositive:"Trade ended in profit", tradeNegative:"Trade ended in loss", screenshot:"Screenshot", close:"Close", deleteJournal:"Delete Journal",
        home:"Home", journalNav:"Journal", statsNav:"Stats", profileNav:"Profile", changeProfilePhoto:"Change profile photo", notifications:"Notifications", clearDateFilter:"Clear date filter", namePlaceholder:"e.g. Zril", accountPlaceholder:"Main Account", balancePlaceholder:"1000", pairPlaceholder:"e.g. XAUUSD", entryPlaceholder:"3342.50", setupPlaceholder:"Liquidity Sweep", methodPlaceholder:"SMC / Price Action / etc.", yourNamePlaceholder:"Your name", usernamePlaceholder:"@trader", bioPlaceholder:"Tell something about your trading journey...", uploadPrompt:"Upload trading screenshot", showing7Of:"Showing 7 of", sortedNewest:"All journals are ordered from the most recently added.", showingAll:"Showing all", allDisplayed:"All journals are already displayed", seeMore:"See more", add:"+ Add", noData:"No data yet.", noPsychData:"No psychology data yet.", statsEmpty:"The chart will appear after journals have data.",
        tradingSpace:"Trading Space", active:"ACTIVE", journalFeatureDescription:"Record entries, setups, trade results, psychology, and the reasoning behind every decision.", statisticsFeatureDescription:"Turn journal records into insights about your trading performance.", psychologyFeatureDescription:"Review your psychology patterns based on recorded trades.", profileFeatureDescription:"Manage your account information, preferences, and dashboard settings.", quickActionDescription:"Don’t just remember a trade. Record it.", journalPageDescription:"Record your trading decisions, not just the outcome.", statisticsPageDescription:"Journal data is summarized into a view of your performance and trading patterns.", averageRR:"AVG. RR", chartEmpty:"The chart will appear once your journal has data.", psychologyByFeel:"PSYCHOLOGY BY FEEL", profilePhoto:"Profile photo", noLocalAccounts:"No local accounts yet.", deviceAccounts:"DEVICE ACCOUNTS", accountSwitcher:"Account Switcher", addAccount:"+ Add Account", localAccountsDescription:"Up to 3 accounts can be stored on one device. Each account must approve Quick Switch before it can be opened from the shortcut.", localData:"LOCAL DATA", backupVault:"Backup Vault", offline:"Offline", deviceBackup:"Device backup", backupLocationNotSelected:"Backup location has not been selected.", chooseBackupLocation:"Choose backup location", backupNow:"Back up now", restoreBackup:"Restore backup", backupDescription:"Backup includes up to 3 accounts, journals, photos, profiles, and preferences. The file stays in the device location you choose and is not sent to a server.", newRecord:"NEW RECORD", addJournal:"Add Journal", viewOnly:"View only", journalReadOnlyDescription:"Saved journals cannot be edited. Records can only be viewed or deleted.", accountPermission:"ACCOUNT PERMISSION", allowQuickSwitchTitle:"Allow Quick Switch?", allowQuickSwitchDescription:"Allow this account to appear in the account-switch shortcut?", allow:"Allow", notNow:"Not now",
        feelCalm:"Calm", feelNeutral:"Neutral", feelFear:"Fear", feelRevenge:"Revenge", feelOverconfident:"Overconfident", feelAnxious:"Anxious",
        market:"Market", pair:"Pair", position:"Position", date:"Date", finalPNL:"Final PNL", entryPrice:"Entry Price", setup:"Setup", stopLoss:"Stop Loss", takeProfit:"Take Profit", method:"Method", feel:"Feel", created:"Created", notProvidedOptional:"Not provided (optional)", screenshotLabel:"SCREENSHOT", tapToView:"Tap to view", noJournalDate:"No journal on this date.", noJournalDateDescription:"No record uses the date", clearFilter:"Clear date filter", noJournalEntries:"No journal entries yet.", firstTradeDescription:"Your first trade can start the data that shapes your statistics and psychology insights.", addFirstTrade:"Add First Trade", tradeCountSingular:"trade", tradeCountPlural:"trades", winRateMetric:"Win rate", avgPNL:"Avg PNL",
        insightNoDataTitle:"Not enough data yet.", insightNoDataBody:"After a few trades are recorded, this section will look at the relationship between your feel and trading results.", insightNeedMoreTitle:"Add a few more trades.", insightNeedMoreBody:"Psychology insights become more meaningful after a few journals, when comparisons between conditions are more reliable.", insightBestTitle:"{feel} looks strongest so far.", insightBestBody:"Across {count} trades while feeling {best}, the average PNL was {bestPnl}. {worst} averaged {worstPnl}. Use this pattern for review, not as a reason to force a setup.", insightMostTitle:"{feel} appears most often.", insightMostBody:"The {feel} state appeared in {count} trades. There is not enough difference to draw a strong conclusion yet, so keep collecting data without rewriting past records.", profilePsychologyNoData:"This section reads psychology conditions from your trading journal.", profilePsychologySummary:"{feel} is the most frequently recorded state ({count} trades). Win rate is {winRate}% with an average PNL of {avgPnl}. Explore Statistics for deeper insights.",
        notificationTitle:"Notifications", notificationSubtitle:"Stay on top of your trading activity.", notificationAll:"All", notificationTrading:"Trading", notificationRisk:"Risk", notificationPsychology:"Psychology", notificationMarkAllRead:"Mark all read", notificationAllRead:"All caught up", notificationClearAll:"Clear all", notificationDelete:"Delete notification", notificationEmptyTitle:"Nothing here yet.", notificationEmptyFiltered:"Try another category.", notificationEmptyBody:"Important activity will appear here as you use Trazeel.", notificationUnread:"Unread", notificationConfirmClearAll:"Delete all notifications? This cannot be undone.", notificationDeleted:"Notification deleted.", notificationAllDeleted:"All notifications deleted.", tradeRecorded:"Trade recorded", tradeAddedBody:"{pair} has been added to your journal.", activityReminder:"Activity reminder", riskReminderBody:"You’ve logged {count} trades today. Review your plan before opening another position.", psychologyPattern:"Psychology pattern", psychologyPatternBody:"The {feel} state has appeared repeatedly in your recent journal data.",
        deleteJournalConfirm:"Delete journal {date} • {pair}?\n\nThis record cannot be recovered after deletion.", journalDeleted:"Journal deleted.", closeLabel:"Close", logout:"Log out", logoutDescription:"Sign out of the active account", logoutSuccess:"You have been logged out. Please sign in again.", switchAllowed:"Quick Switch permission enabled.", switchDenied:"Quick Switch permission was not enabled.", wait:"Please wait...", enterIdPassword:"Enter your ID and password.", accountNotFound:"This ID was not found on this device. Restore a backup if the account is from another device.", invalidCredentials:"Incorrect ID or password.", accountAlreadyActive:"This account is already active.", switchAlreadyAllowed:"This account already has Quick Switch permission.", loginSuccess:"Login successful.", loginFailed:"Login failed.", fillSignup:"Enter your name, ID, and password.", invalidAccountId:"ID must be 3–24 characters. Use lowercase letters, numbers, periods, underscores, or hyphens.", passwordMinLength:"Password must be at least 8 characters.", maxAccounts:"A maximum of 3 accounts is allowed per device.", idAlreadyUsed:"This ID is already used on this device.", localAccountCreated:"Local account created.", accountCreateFailed:"Could not create the account.", accountPrepared:"Account is ready.", maxAccountsReached:"The 3-account device limit has been reached.", noLocalAccount:"No local accounts yet.", switchAccount:"Switch", allowSwitch:"Allow switch", revokePermission:"Revoke permission", switchPermissionTitle:"Allow Quick Switch?", switchPermissionDescription:"Allow this account to appear in the account-switch shortcut? If allowed, it can be opened from Profile without entering the ID and password again.", switchSuccess:"Account switched.", switchRevoked:"Quick Switch permission revoked.", backupFolderPermission:"Folder permission needs to be enabled again.", backupUnsupported:"This browser does not support automatic folder backups. Use Back up now instead.", backupPermissionDenied:"Backup folder permission was not granted.", backupEnabled:"Automatic backup enabled.", backupFolderUnavailable:"The backup folder cannot be accessed.", backupCreated:"Backup file created.", backupUpdated:"Device backup updated.", invalidBackup:"This is not a valid Trazeel backup file.", restoreConfirm:"Restore this backup? Current local account data will be replaced. After restoring, sign in with the ID and password from the backup.", restoreFailed:"Backup restore failed. Check the JSON file.", resetConfirm:"Delete all Trazeel accounts and data from this device? Files in the backup folder will not be deleted.", resetSuccess:"All local accounts have been deleted.",
                lockedRecord:"LOCKED RECORD", journalDetail:"Journal Detail", information:"Information", stepOne:"STEP 01", stepTwo:"STEP 02", spot:"Spot", buyOnly:"Buy only", future:"Future", forexCrypto:"Forex / Crypto", forex:"Forex", currencyPairs:"Currency pairs", crypto:"Crypto", cryptoFutures:"Crypto futures", dateFieldLabel:"01. Date", pairFieldLabel:"02. Pair", positionFieldLabel:"03. Position", manual:"Manual", select:"Select", buy:"BUY", sell:"SELL", finalPNLFieldLabel:"04. Final PNL", chooseResult:"Choose result", entryPriceFieldLabel:"05. Entry Price", sltpFieldLabel:"06. SL / TP", stopLoss:"STOP LOSS", takeProfit:"TAKE PROFIT", setupFieldLabel:"07. Setup", methodFieldLabel:"08. Method", feelFieldLabel:"09. Feel", psychologyData:"Psychology data", screenshotFieldLabel:"10. Screenshot", optional:"Optional", addImage:"Add image", optionalImageDescription:"Optional. The image will be compressed for local storage.", remove:"Remove", requiredFieldsNote:"All fields are required except the screenshot.",
        onSelectedDate:"on selected date", noJournalData:"No journal data", systemDefault:"System Default", dark:"Dark", light:"Light", english:"English", indonesian:"Bahasa Indonesia",
        accountName:'Account', welcomeBadge:'TRADING WORKSPACE', setupYouSuffix:'you.', setupAccountSuffix:'account.', saveJournalButton:'Add Journal', greetingNight:'Good evening', greetingMorning:'Good morning', greetingAfternoon:'Good afternoon', greetingEvening:'Good evening', winsCount:'wins', statisticsNoJournalMeta:'No journal data', justNow:'just now', minutesAgo:'{count}m ago', hoursAgo:'{count}h ago', daysAgo:'{count}d ago', accountCurrentlyUsed:'Currently active', quickSwitchActive:'Quick Switch enabled', switchPermissionMissing:'Quick Switch permission not granted', backupFolderHint:'Choose a folder once to enable automatic backups.', backupManualOnly:'This browser uses manual backup files.', backupAutoActive:'Automatic backup is active. {filename} updates when data changes.', backupPermissionAgain:'Folder permission needs to be enabled again.', setupNameError:'A name is required.', setupAccountNameError:'An account name is required.', setupBalanceError:'Enter a valid starting balance.', validationSelectDate:'Choose a date.', validationPair:'Enter a pair.', validationFutureCategory:'Choose a Future category: Forex or Crypto.', validationPosition:'Choose BUY or SELL.', validationMarketType:'Choose a trade type.', validationPnl:'Choose Profit/Loss and enter the amount.', validationEntry:'Enter the entry price.', validationStopLoss:'Enter the Stop Loss.', validationTakeProfit:'Enter the Take Profit.', validationSetup:'Enter the setup.', validationMethod:'Enter the method.', validationFeel:'Choose a psychology state.', editNameRequired:'A name is required.', editAccountNameRequired:'An account name is required.', editBalanceInvalid:'The starting balance is invalid.', accountInfoUpdated:'Account information updated.', displayNameRequired:'A display name is required.', profileUpdated:'Profile updated.', chooseImageFile:'Choose an image file.', profilePhotoUpdated:'Profile photo updated.', profilePhotoFailed:'The profile photo could not be processed.'
    }
};
function t(key, fallback = key) { return I18N[state.language]?.[key] ?? fallback; }

function interpolate(template, values = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function applyLanguage(language, persist = true) {
    state.language = language === "en" ? "en" : "id";
    if (persist) localStorage.setItem(STORAGE.language, state.language);
    if (languageSelect) languageSelect.value = state.language;
    document.documentElement.lang = state.language;
    const dictionary = I18N[state.language];

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
            element.textContent = dictionary[key];
        }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        if (dictionary[key]) element.setAttribute("placeholder", dictionary[key]);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const key = element.dataset.i18nAriaLabel;
        if (dictionary[key]) element.setAttribute("aria-label", dictionary[key]);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
        const key = element.dataset.i18nTitle;
        if (dictionary[key]) element.setAttribute("title", dictionary[key]);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const key = element.dataset.i18nAlt;
        if (dictionary[key]) element.setAttribute("alt", dictionary[key]);
    });

    if (profileBio && (!state.profile.bio || state.profile.bio === I18N.id.defaultBio || state.profile.bio === I18N.en.defaultBio)) {
        profileBio.textContent = dictionary.defaultBio;
    }
    if (themeSelect) {
        const themeLabels = [dictionary.systemDefault, dictionary.dark, dictionary.light];
        [...themeSelect.options].forEach((option, index) => option.textContent = themeLabels[index] || option.textContent);
    }
    if (languageSelect) {
        [...languageSelect.options].forEach((option, index) => option.textContent = index === 0 ? dictionary.indonesian : dictionary.english);
    }

    updateAuthOverlayContent();
    updateUserInterface();
    renderJournal();
    renderStatistics();
    renderPsychologyProfile();
    if (typeof applyLocalAccountLanguage === "function") applyLocalAccountLanguage();
    if (typeof refreshNotificationLanguage === "function") refreshNotificationLanguage();
    if (typeof renderNotificationCenter === "function" && $("notificationPanel")) renderNotificationCenter();
}

function applyTheme(theme, persist = true) {
    const allowed = ["system", "dark", "light"].includes(theme) ? theme : "system";
    state.theme = allowed;
    if (persist) localStorage.setItem(STORAGE.theme, state.theme);
    if (themeSelect) themeSelect.value = state.theme;

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches === true;
    const resolved = allowed === "system" ? (prefersLight ? "light" : "dark") : allowed;
    document.documentElement.dataset.theme = resolved;
    document.body.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    document.body.style.colorScheme = resolved;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = resolved === "light" ? "#f7f3ea" : "#0a0a0d";
}

if (window.matchMedia) { const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)"); systemThemeQuery.addEventListener?.("change", () => { if (state.theme === "system") applyTheme("system", false); }); }

/* =========================================================
   RESET
========================================================= */

/* Local reset behavior is in local-auth.js. */

/* =========================================================
   FIELD HELPERS
========================================================= */

function setFieldError(
    input,
    errorElement,
    message
) {
    if (input) {
        input.classList.add(
            "invalid"
        );
    }

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function clearFieldError(
    input,
    errorElement
) {
    if (input) {
        input.classList.remove(
            "invalid"
        );
    }

    if (errorElement) {
        errorElement.textContent =
            "";
    }
}

function setCustomFieldError(
    fieldName,
    message
) {
    const error =
        document.querySelector(
            `[data-error-for="${fieldName}"]`
        );

    if (error) {
        error.textContent =
            message;
    }

    const input =
        $(fieldName);

    if (
        input &&
        input.classList
    ) {
        input.classList.add(
            "invalid"
        );
    }
}

function clearCustomFieldError(
    fieldName
) {
    const error =
        document.querySelector(
            `[data-error-for="${fieldName}"]`
        );

    if (error) {
        error.textContent = "";
    }

    const input =
        $(fieldName);

    if (
        input &&
        input.classList
    ) {
        input.classList.remove(
            "invalid"
        );
    }
}

function clearAllJournalErrors() {
    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(
            (error) => {
                if (
                    error.id.endsWith(
                        "Error"
                    ) ||
                    error.dataset
                        .errorFor
                ) {
                    error.textContent =
                        "";
                }
            }
        );

    document
        .querySelectorAll(
            "#journalForm input"
        )
        .forEach(
            (input) => {
                input.classList.remove(
                    "invalid"
                );
            }
        );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(
    message
) {
    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer = setTimeout(
        () => {
            toast.classList.remove(
                "show"
            );
        },
        2500
    );
}


/* =========================================================
   FORMATTING
========================================================= */

function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 5) return t("greetingNight");
    if (hour < 12) return t("greetingMorning");
    if (hour < 18) return t("greetingAfternoon");
    return t("greetingEvening");
}

function formatMoney(
    amount,
    currency = "USD"
) {
    try {
        return new Intl.NumberFormat(
            state.language === "en" ? "en-US" : "id-ID",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2
            }
        ).format(amount);
    } catch {
        return `${currency} ${Number(
            amount || 0
        ).toFixed(2)}`;
    }
}

function formatNumber(
    value,
    digits = 2
) {
    return Number(
        value || 0
    ).toLocaleString(
        state.language === "en" ? "en-US" : "id-ID",
        {
            minimumFractionDigits:
                digits,
            maximumFractionDigits:
                digits
        }
    );
}

function formatRawNumber(
    value
) {
    if (
        !Number.isFinite(
            Number(value)
        )
    ) {
        return "-";
    }

    return Number(
        value
    ).toLocaleString(
        state.language === "en" ? "en-US" : "id-ID",
        {
            maximumFractionDigits:
                8
        }
    );
}

function formatSignedNumber(
    value
) {
    const number =
        Number(
            value || 0
        );

    const sign =
        number >= 0
            ? "+"
            : "-";

    return `${sign}${formatNumber(
        Math.abs(number),
        2
    )}`;
}

function formatShortSigned(
    value
) {
    const number =
        Number(
            value || 0
        );

    const sign =
        number >= 0
            ? "+"
            : "-";

    const abs =
        Math.abs(number);

    if (abs >= 1000000) {
        return `${sign}${formatNumber(
            abs / 1000000,
            1
        )}M`;
    }

    if (abs >= 1000) {
        return `${sign}${formatNumber(
            abs / 1000,
            1
        )}K`;
    }

    return `${sign}${formatNumber(
        abs,
        abs % 1 === 0
            ? 0
            : 1
    )}`;
}

function formatDateLong(
    value
) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        (state.language === "en" ? "en-US" : "id-ID"),
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}

function formatDateUpper(
    value
) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        state.language === "en" ? "en-US" : "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    )
        .format(date)
        .toUpperCase();
}

function formatCreatedAt(
    value
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        (state.language === "en" ? "en-US" : "id-ID"),
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function formatFeelLabel(feel) {
    const keyByFeel = {
        calm: "feelCalm",
        neutral: "feelNeutral",
        fear: "feelFear",
        revenge: "feelRevenge",
        overconfident: "feelOverconfident",
        anxious: "feelAnxious"
    };
    const key = keyByFeel[feel];
    return key ? t(key, FEEL_META[feel]?.label || "Unknown") : "Unknown";
}

function getFeelEmoji(
    feel
) {
    const icons = {
        calm: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 14.5c.9 1.1 2 1.5 3.5 1.5s2.6-.4 3.5-1.5M9 10h.01M15 10h.01"></path></svg>',
        neutral: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 14h7M9 10h.01M15 10h.01"></path></svg>',
        fear: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 15.5c1-1 2-1.5 3.5-1.5s2.5.5 3.5 1.5M9 10h.01M15 10h.01"></path></svg>',
        revenge: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M8 9.5l2 1M16 9.5l-2 1M8.5 15h7M7 6l2 1M17 6l-2 1"></path></svg>',
        overconfident: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.2 3.5c.9 3.4-1.9 4.4-1.2 7.1.4-1.2 1.4-2.2 2.7-2.8.6 1.8 2.8 3 2.8 6a4.5 4.5 0 1 1-8.9 0c0-2.3 1.2-4.1 2.8-5.7-.1 2 .4 2.9 1.2 3.5.1-2.5.2-4.8-2-6.9 1.1.3 2.1 1 2.6 1.8z"></path></svg>',
        anxious: '<svg class="feel-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 15.5c1.1-.8 2.1-1.2 3.5-1.2s2.4.4 3.5 1.2M9 10h.01M15 10h.01M8 6.5l1.2 1M16 6.5l-1.2 1"></path></svg>'
    };
    return icons[feel] || "";
}

function capitalize(
    value
) {
    if (!value) {
        return "";
    }

    return (
        value
            .charAt(0)
            .toUpperCase() +
        value.slice(1)
    );
}


/* =========================================================
   ID / HTML SAFETY
========================================================= */

function generateId() {
    return `j_${Date.now().toString(
        36
    )}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

function escapeHTML(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   EMPTY STATE BUTTON EVENTS
========================================================= */

document.addEventListener(
    "click",
    (event) => {
        if (
            event.target.id ===
            "emptyAddJournalBtn"
        ) {
            openJournalModal();
        }

        if (
            event.target.id ===
            "clearEmptyDateBtn"
        ) {
            state.selectedDate =
                "";

            journalDateFilter.value =
                "";

            state.showAllJournals =
                false;

            renderJournal();
        }
    }
);

/* =========================================================
   NOTIFICATION CENTER
   Activity-based notifications using the existing UI theme.
   Existing logo, SVG icons, layout and main styling are untouched.
========================================================= */

const NOTIFICATION_STORAGE_KEY = "trazeel_notifications_v1";
const NOTIFICATION_DISMISSED_KEY = "trazeel_notifications_dismissed_v1";
const NOTIFICATION_MAX_ITEMS = 40;

let notificationState = {
    items: [],
    filter: "all",
    dismissedIds: []
};

function initializeNotificationSystem() {
    loadNotifications();
    injectNotificationStyles();
    ensureNotificationPanel();
    syncNotificationInsights();
    refreshNotificationLanguage();
    renderNotificationCenter();
}

function loadNotifications() {
    const parsed = safeJSONParse(
        localStorage.getItem(NOTIFICATION_STORAGE_KEY),
        []
    );

    const dismissed = safeJSONParse(localStorage.getItem(NOTIFICATION_DISMISSED_KEY), []);
    notificationState.dismissedIds = Array.isArray(dismissed) ? dismissed.filter((id) => typeof id === "string") : [];
    notificationState.items = Array.isArray(parsed)
        ? parsed.filter(
              (item) =>
                  item &&
                  typeof item === "object" &&
                  item.id &&
                  item.title &&
                  item.body
          )
        : [];

    sortNotifications();
}

function saveNotifications() {
    try {
        localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            JSON.stringify(
                notificationState.items.slice(
                    0,
                    NOTIFICATION_MAX_ITEMS
                )
            )
        );
    } catch (error) {
        console.error(
            "Notification storage error:",
            error
        );
    }
}

function sortNotifications() {
    notificationState.items.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
    );
}

function createNotification({
    id,
    type = "trading",
    title,
    body,
    createdAt = new Date().toISOString(),
    read = false,
    meta = ""
}) {
    if (!id || !title || !body) return;
    if (notificationState.dismissedIds.includes(id)) return;

    const index =
        notificationState.items.findIndex(
            (item) => item.id === id
        );

    if (index >= 0) {
        notificationState.items[index] = {
            ...notificationState.items[index],
            type,
            title,
            body,
            createdAt,
            meta,
            read:
                notificationState.items[index].read === true
        };
    } else {
        notificationState.items.unshift({
            id,
            type,
            title,
            body,
            createdAt,
            meta,
            read
        });
    }

    sortNotifications();
    notificationState.items =
        notificationState.items.slice(
            0,
            NOTIFICATION_MAX_ITEMS
        );

    saveNotifications();
}

function recordTradeNotification(journal) {
    if (!journal?.id) return;

    createNotification({
        id: `trade-${journal.id}`,
        type: "trading",
        title: t("tradeRecorded"),
        body: interpolate(t("tradeAddedBody"), { pair: journal.pair || "Trade" }),
        createdAt:
            journal.createdAt ||
            new Date().toISOString(),
        meta:
            `${formatSignedNumber(
                journal.pnl
            )} • ${formatFeelLabel(
                journal.feel
            )}`
    });
}

function syncNotificationInsights() {
    if (!Array.isArray(state.journals)) return;

    syncRiskNotification();
    syncPsychologyNotifications();
    saveNotifications();

    renderNotificationCenter();
}

function syncRiskNotification() {
    const today =
        toLocalDateInputValue(
            new Date()
        );

    const todayTrades =
        state.journals.filter(
            (journal) =>
                journal.date === today
        );

    const count =
        todayTrades.length;

    const id =
        `risk-daily-${today}`;

    if (count >= 3) {
        createNotification({
            id,
            type: "risk",
            title: t("activityReminder"),
            body: interpolate(t("riskReminderBody"), { count }),
            meta: state.language === "en" ? `${count} trades today` : `${count} trade hari ini`
        });
    } else {
        removeNotification(
            id,
            false
        );
    }
}

function syncPsychologyNotifications() {
    const groups =
        groupByFeel();

    Object.entries(groups).forEach(
        ([feel, data]) => {
            const id =
                `psych-${feel}`;

            if (data.count >= 3) {
                createNotification({
                    id,
                    type: "psychology",
                    title: t("psychologyPattern"),
                    body: interpolate(t("psychologyPatternBody"), { feel: formatFeelLabel(feel) }),
                    meta: `${data.count} ${t("tradeCountPlural")} • ${t("avgPNL")} ${formatSignedNumber(data.pnl / data.count)}`
                });
            } else {
                removeNotification(
                    id,
                    false
                );
            }
        }
    );

    Object.keys(FEEL_META).forEach(
        (feel) => {
            if (!groups[feel]) {
                removeNotification(
                    `psych-${feel}`,
                    false
                );
            }
        }
    );
}

function removeNotification(id, persist = true) {
    const next = notificationState.items.filter((item) => item.id !== id);
    const changed = next.length !== notificationState.items.length;
    notificationState.items = next;

    if (!persist) {
        notificationState.dismissedIds = notificationState.dismissedIds.filter((dismissedId) => dismissedId !== id);
        localStorage.setItem(NOTIFICATION_DISMISSED_KEY, JSON.stringify(notificationState.dismissedIds));
    }
    if (persist && changed) saveNotifications();
}

function getUnreadNotificationCount() {
    return notificationState.items.filter(
        (item) => item.read !== true
    ).length;
}

function getFilteredNotifications() {
    if (
        notificationState.filter ===
        "all"
    ) {
        return notificationState.items;
    }

    return notificationState.items.filter(
        (item) =>
            item.type ===
            notificationState.filter
    );
}

function markNotificationRead(
    id
) {
    const item =
        notificationState.items.find(
            (notification) =>
                notification.id === id
        );

    if (!item) return;

    item.read = true;
    saveNotifications();
    renderNotificationCenter();
}

function markAllNotificationsRead() {
    notificationState.items.forEach(
        (item) => {
            item.read = true;
        }
    );

    saveNotifications();
    renderNotificationCenter();
}

function dismissNotification(id) {
    if (!id) return;
    if (!notificationState.dismissedIds.includes(id)) {
        notificationState.dismissedIds.push(id);
        localStorage.setItem(NOTIFICATION_DISMISSED_KEY, JSON.stringify(notificationState.dismissedIds));
    }
    removeNotification(id, true);
    renderNotificationCenter();
    showToast(t("notificationDeleted"));
}

function clearAllNotifications() {
    if (!notificationState.items.length) return;
    if (!window.confirm(t("notificationConfirmClearAll"))) return;
    const ids = notificationState.items.map((item) => item.id);
    notificationState.dismissedIds = [...new Set([...notificationState.dismissedIds, ...ids])];
    localStorage.setItem(NOTIFICATION_DISMISSED_KEY, JSON.stringify(notificationState.dismissedIds));
    notificationState.items = [];
    saveNotifications();
    renderNotificationCenter();
    showToast(t("notificationAllDeleted"));
}

function refreshNotificationLanguage() {
    notificationState.items.forEach((item) => {
        if (item.id.startsWith("trade-")) {
            const journalId = item.id.slice(6);
            const journal = state.journals.find((entry) => String(entry.id) === journalId);
            if (journal) {
                item.title = t("tradeRecorded");
                item.body = interpolate(t("tradeAddedBody"), { pair: journal.pair || "Trade" });
                item.meta = `${formatSignedNumber(journal.pnl)} • ${formatFeelLabel(journal.feel)}`;
            }
        } else if (item.type === "risk" && item.id.startsWith("risk-daily-")) {
            const count = state.journals.filter((journal) => journal.date === item.id.slice("risk-daily-".length)).length;
            item.title = t("activityReminder");
            item.body = interpolate(t("riskReminderBody"), { count });
            item.meta = state.language === "en" ? `${count} trades today` : `${count} trade hari ini`;
        } else if (item.type === "psychology" && item.id.startsWith("psych-")) {
            const feel = item.id.slice(6);
            const group = groupByFeel()[feel];
            if (group) {
                item.title = t("psychologyPattern");
                item.body = interpolate(t("psychologyPatternBody"), { feel: formatFeelLabel(feel) });
                item.meta = `${group.count} ${t("tradeCountPlural")} • ${t("avgPNL")} ${formatSignedNumber(group.pnl / group.count)}`;
            }
        }
    });
    saveNotifications();
}

function setNotificationFilter(
    filter
) {
    const allowed = [
        "all",
        "trading",
        "risk",
        "psychology"
    ];

    notificationState.filter =
        allowed.includes(filter)
            ? filter
            : "all";

    renderNotificationCenter();
}

function toggleNotificationCenter() {
    ensureNotificationPanel();

    const panel =
        $("notificationPanel");

    if (!panel) return;

    const open =
        !panel.classList.contains(
            "open"
        );

    panel.classList.toggle(
        "open",
        open
    );

    panel.setAttribute(
        "aria-hidden",
        open
            ? "false"
            : "true"
    );

    if (open) {
        syncNotificationInsights();
    }
}

function closeNotificationCenter() {
    const panel =
        $("notificationPanel");

    if (!panel) return;

    panel.classList.remove(
        "open"
    );

    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}

function ensureNotificationPanel() {
    if ($("notificationPanel")) return;

    const panel = document.createElement("aside");
    panel.id = "notificationPanel";
    panel.className = "notification-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
        <div class="notification-panel-head">
            <div>
                <span class="notification-eyebrow">${escapeHTML(t("notifications"))}</span>
                <h2>${escapeHTML(t("notificationSubtitle"))}</h2>
            </div>
            <button class="notification-close" id="notificationCloseBtn" type="button" aria-label="${escapeHTML(t("closeLabel"))}">×</button>
        </div>
        <div class="notification-tools">
            <div class="notification-filters" role="tablist" aria-label="${escapeHTML(t("notificationTitle"))}">
                <button class="notification-filter active" data-notification-filter="all" type="button">${escapeHTML(t("notificationAll"))}</button>
                <button class="notification-filter" data-notification-filter="trading" type="button">${escapeHTML(t("notificationTrading"))}</button>
                <button class="notification-filter" data-notification-filter="risk" type="button">${escapeHTML(t("notificationRisk"))}</button>
                <button class="notification-filter" data-notification-filter="psychology" type="button">${escapeHTML(t("notificationPsychology"))}</button>
            </div>
            <div class="notification-actions">
                <button class="notification-clear-all" id="notificationClearAllBtn" type="button">${escapeHTML(t("notificationClearAll"))}</button>
                <button class="notification-mark-all" id="notificationMarkAllBtn" type="button">${escapeHTML(t("notificationMarkAllRead"))}</button>
            </div>
        </div>
        <div class="notification-list" id="notificationList"></div>
    `;
    document.body.appendChild(panel);

    $("notificationCloseBtn")?.addEventListener("click", closeNotificationCenter);
    panel.querySelectorAll("[data-notification-filter]").forEach((button) => {
        button.addEventListener("click", () => setNotificationFilter(button.dataset.notificationFilter));
    });
    $("notificationMarkAllBtn")?.addEventListener("click", markAllNotificationsRead);
    $("notificationClearAllBtn")?.addEventListener("click", clearAllNotifications);

    $("notificationList")?.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-notification-delete]");
        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();
            dismissNotification(deleteButton.dataset.notificationDelete);
            return;
        }
        const openButton = event.target.closest("[data-notification-open]");
        if (openButton) markNotificationRead(openButton.dataset.notificationOpen);
    });

    document.addEventListener("click", (event) => {
        const current = $("notificationPanel");
        const trigger = $("notificationBtn");
        if (!current || !current.classList.contains("open")) return;
        if (current.contains(event.target) || trigger?.contains(event.target)) return;
        closeNotificationCenter();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && $("notificationPanel")?.classList.contains("open")) closeNotificationCenter();
    });
}

function renderNotificationCenter() {
    ensureNotificationPanel();
    const list = $("notificationList");
    if (!list) return;

    const panel = $("notificationPanel");
    const eyebrow = panel?.querySelector(".notification-eyebrow");
    const heading = panel?.querySelector(".notification-panel-head h2");
    const closeButton = $("notificationCloseBtn");
    const filterList = panel?.querySelector(".notification-filters");
    if (eyebrow) eyebrow.textContent = t("notifications");
    if (heading) heading.textContent = t("notificationSubtitle");
    if (closeButton) closeButton.setAttribute("aria-label", t("closeLabel"));
    if (filterList) filterList.setAttribute("aria-label", t("notificationTitle"));
    const filterKeys = { all: "notificationAll", trading: "notificationTrading", risk: "notificationRisk", psychology: "notificationPsychology" };
    panel?.querySelectorAll("[data-notification-filter]").forEach((button) => { button.textContent = t(filterKeys[button.dataset.notificationFilter]); });
    if ($("notificationClearAllBtn")) $("notificationClearAllBtn").textContent = t("notificationClearAll");

    const filtered = getFilteredNotifications();
    const unreadCount = getUnreadNotificationCount();
    const markAll = $("notificationMarkAllBtn");
    const clearAll = $("notificationClearAllBtn");

    if (markAll) {
        markAll.disabled = unreadCount === 0;
        markAll.textContent = unreadCount > 0
            ? `${t("notificationMarkAllRead")} (${unreadCount})`
            : t("notificationAllRead");
    }
    if (clearAll) clearAll.disabled = notificationState.items.length === 0;

    document.querySelectorAll("[data-notification-filter]").forEach((button) => {
        button.classList.toggle("active", button.dataset.notificationFilter === notificationState.filter);
    });
    updateNotificationBadge(unreadCount);

    if (!filtered.length) {
        const emptyMessage = notificationState.items.length ? t("notificationEmptyFiltered") : t("notificationEmptyBody");
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8"></path></svg></div>
                <strong>${escapeHTML(t("notificationEmptyTitle"))}</strong>
                <p>${escapeHTML(emptyMessage)}</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map((item) => {
        const typeLabel = item.type === "risk" ? t("notificationRisk") : item.type === "psychology" ? t("notificationPsychology") : t("notificationTrading");
        const icon = item.type === "risk" ? "!" : item.type === "psychology" ? "◌" : "↗";
        return `
            <article class="notification-item ${item.read === true ? "" : "unread"}" data-notification-id="${escapeHTML(item.id)}">
                <button class="notification-item-main" type="button" data-notification-open="${escapeHTML(item.id)}" aria-label="${escapeHTML(item.title)}">
                    <span class="notification-item-icon type-${escapeHTML(item.type)}">${icon}</span>
                    <span class="notification-item-content">
                        <span class="notification-item-top"><strong>${escapeHTML(item.title)}</strong><time>${escapeHTML(formatNotificationTime(item.createdAt))}</time></span>
                        <span class="notification-item-body">${escapeHTML(item.body)}</span>
                        <span class="notification-item-meta"><span>${escapeHTML(typeLabel)}</span>${item.meta ? `<span>•</span><span>${escapeHTML(item.meta)}</span>` : ""}</span>
                    </span>
                    ${item.read !== true ? `<span class="notification-unread-dot" aria-label="${escapeHTML(t("notificationUnread"))}"></span>` : ""}
                </button>
                <button class="notification-delete-btn" type="button" data-notification-delete="${escapeHTML(item.id)}" aria-label="${escapeHTML(t("notificationDelete"))}" title="${escapeHTML(t("notificationDelete"))}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path></svg>
                </button>
            </article>`;
    }).join("");
}

function updateNotificationBadge(
    count
) {
    const button =
        $("notificationBtn");

    if (!button) return;

    let badge =
        button.querySelector(
            ".notification-unread-count"
        );

    if (count > 0) {
        if (!badge) {
            badge =
                document.createElement(
                    "span"
                );

            badge.className =
                "notification-unread-count";

            button.appendChild(
                badge
            );
        }

        badge.textContent =
            count > 9
                ? "9+"
                : String(count);

        button.classList.add(
            "has-notifications"
        );
    } else {
        badge?.remove();

        button.classList.remove(
            "has-notifications"
        );
    }
}

function formatNotificationTime(
    value
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const diff =
        Math.max(
            0,
            Date.now() -
                date.getTime()
        );

    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;

    if (diff < minute) return t("justNow");
    if (diff < hour) return interpolate(t("minutesAgo"), { count: Math.floor(diff / minute) });
    if (diff < day) return interpolate(t("hoursAgo"), { count: Math.floor(diff / hour) });
    if (diff < 7 * day) return interpolate(t("daysAgo"), { count: Math.floor(diff / day) });

    return new Intl.DateTimeFormat(
        state.language === "en" ? "en-US" : "id-ID",
        {
            day: "2-digit",
            month: "short"
        }
    ).format(date);
}

function injectNotificationStyles() {
    if ($("notificationStyles")) return;
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
        .notification-panel{position:fixed;top:82px;right:max(16px,calc((100vw - 900px)/2));z-index:80;width:min(450px,calc(100vw - 28px));max-height:min(720px,calc(100vh - 98px));display:flex;flex-direction:column;overflow:hidden;padding:18px;border:1px solid var(--border-strong);border-radius:var(--radius-lg);background:var(--surface);color:var(--text);box-shadow:0 24px 70px rgba(0,0,0,.24);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);opacity:0;visibility:hidden;transform:translateY(-10px) scale(.985);transform-origin:top right;transition:opacity 220ms ease,visibility 220ms ease,transform 300ms ease}
        .notification-panel.open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}
        .notification-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:15px;border-bottom:1px solid var(--border)}
        .notification-eyebrow{display:block;color:var(--text-muted);font-size:9px;font-weight:800;letter-spacing:.16em}
        .notification-panel-head h2{margin-top:5px;color:var(--text);font-size:20px;letter-spacing:-.025em}
        .notification-close{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:11px;color:var(--text-soft);background:var(--surface-2);cursor:pointer;font-size:20px;line-height:1}
        .notification-tools{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 0}
        .notification-filters{min-width:0;display:flex;gap:5px;overflow-x:auto;scrollbar-width:none}.notification-filters::-webkit-scrollbar{display:none}
        .notification-filter{flex:0 0 auto;min-height:30px;padding:0 10px;border-radius:999px;color:var(--text-muted);background:transparent;border:1px solid transparent;font-size:9px;font-weight:800;cursor:pointer}
        .notification-filter.active{color:var(--text);background:var(--accent-soft);border-color:var(--border-strong)}
        .notification-actions{display:flex;align-items:center;gap:11px;flex:0 0 auto}
        .notification-mark-all,.notification-clear-all{padding:0;color:var(--text-soft);background:transparent;font-size:9px;font-weight:700;cursor:pointer;white-space:nowrap}
        .notification-clear-all{color:var(--red)}.notification-mark-all:disabled,.notification-clear-all:disabled{opacity:.38;cursor:default}
        .notification-list{min-height:0;overflow:auto;padding-right:2px;display:grid;gap:8px;scrollbar-width:thin}
        .notification-item{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 32px;align-items:stretch;gap:7px;padding:6px;border:1px solid var(--border);border-radius:16px;background:var(--surface);color:var(--text)}
        .notification-item.unread{border-color:var(--border-strong);background:linear-gradient(135deg,var(--accent-soft),transparent 66%),var(--surface)}
        .notification-item-main{width:100%;min-width:0;display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:start;gap:10px;padding:6px;text-align:left;border:0;border-radius:11px;color:var(--text);background:transparent;cursor:pointer}
        .notification-item-main:hover{background:var(--surface-2)}
        .notification-item-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:var(--surface-2);color:var(--text-soft);font-size:13px;font-weight:900}
        .notification-item-icon.type-trading{color:var(--blue)}.notification-item-icon.type-risk{color:var(--orange)}.notification-item-icon.type-psychology{color:var(--accent)}
        .notification-item-content{min-width:0;display:grid;gap:6px}
        .notification-item-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.notification-item-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.notification-item-top time{flex:0 0 auto;color:var(--text-muted);font-size:8px;white-space:nowrap}
        .notification-item-body{color:var(--text-soft);font-size:10px;line-height:1.55}.notification-item-meta{display:flex;align-items:center;flex-wrap:wrap;gap:5px;color:var(--text-muted);font-size:8px}
        .notification-unread-dot{width:7px;height:7px;margin:6px 4px 0 0;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}
        .notification-delete-btn{width:30px;height:30px;align-self:start;display:grid;place-items:center;margin-top:6px;border:1px solid transparent;border-radius:9px;color:var(--text-muted);background:transparent;cursor:pointer;transition:color 160ms ease,background 160ms ease,border-color 160ms ease}
        .notification-delete-btn:hover{color:var(--red);background:var(--red-soft);border-color:rgba(193,85,95,.2)}.notification-delete-btn svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .notification-empty{min-height:230px;display:grid;place-items:center;align-content:center;padding:24px 18px;text-align:center;border:1px dashed var(--border-strong);border-radius:18px;color:var(--text-soft)}
        .notification-empty-icon{width:46px;height:46px;display:grid;place-items:center;margin-bottom:12px;border-radius:14px;color:var(--green);background:var(--green-soft);font-size:17px;font-weight:900}.notification-empty strong{color:var(--text);font-size:12px}.notification-empty p{max-width:270px;margin-top:6px;color:var(--text-muted);font-size:9px;line-height:1.5}
        .icon-btn.has-notifications{border-color:var(--border-strong)}.notification-unread-count{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;display:grid;place-items:center;border:2px solid var(--bg);border-radius:999px;color:var(--bg);background:var(--accent);font-size:7px;font-weight:900;line-height:1}
        @media(max-width:560px){.notification-panel{top:78px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 90px);border-radius:20px;padding:15px}.notification-tools{align-items:flex-start;flex-direction:column}.notification-actions{width:100%;justify-content:flex-end}.notification-mark-all{font-size:8px}}
    `;
    document.head.appendChild(style);
}
