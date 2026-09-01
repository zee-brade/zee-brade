/* =========================================================
   TRADION
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

/* =========================================================
   SUPABASE AUTH
   Browser client using the public publishable key.
========================================================= */

const SUPABASE_URL =
    "https://wzngesxfeuxesgzihsyo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ThK42W9h5FtHunR-piPSfQ_bXIfhYNj";

let supabaseClient = null;
let supabaseAuthReady = false;
let supabaseAuthBusy = false;

function loadSupabaseSDK() {
    if (window.supabase?.createClient) {
        return Promise.resolve();
    }

    const existing = document.querySelector(
        'script[data-trazeel-supabase-sdk="true"]'
    );

    if (existing) {
        return new Promise((resolve, reject) => {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", () => reject(new Error("Supabase SDK failed to load.")), { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.dataset.trazeelSupabaseSdk = "true";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Supabase SDK failed to load."));
        document.head.appendChild(script);
    });
}

function getSupabaseUserName(user) {
    const metadataName =
        user?.user_metadata?.display_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name;

    if (metadataName) return String(metadataName).trim();

    return deriveLoginUser(user?.email || "").name;
}

function rememberSupabaseUser(user) {
    if (!user) return;

    const existing = state.user && typeof state.user === "object"
        ? state.user
        : deriveLoginUser(user.email || "");

    state.user = {
        ...existing,
        name: existing.name || getSupabaseUserName(user),
        email: user.email || existing.email || "",
        authUserId: user.id,
        authProvider: "supabase",
        createdAt: existing.createdAt || user.created_at || new Date().toISOString()
    };

    localStorage.setItem(
        STORAGE.user,
        JSON.stringify(state.user)
    );

    if (!userNameInput.value.trim()) {
        userNameInput.value = state.user.name || "";
    }
}

function clearLocalAuthState() {
    localStorage.removeItem(STORAGE.user);
    localStorage.removeItem(STORAGE.setupCompleted);
    localStorage.removeItem(STORAGE.profile);
    localStorage.removeItem("trazeel_auth_signup_v1");

    state.user = null;
    state.authenticated = false;
    state.profile = {
        username: "",
        bio: "Membangun konsistensi, satu trade setiap kali.",
        avatar: null
    };
}

function handleSupabaseAuthStateChange(event, session) {
    if (event === "INITIAL_SESSION") {
        if (session?.user) {
            state.authenticated = true;
            rememberSupabaseUser(session.user);
        } else {
            state.authenticated = false;
        }
        return;
    }

    if (event === "SIGNED_IN" && session?.user) {
        state.authenticated = true;
        rememberSupabaseUser(session.user);

        if (state.introFinished) {
            const setupCompleted =
                localStorage.getItem(STORAGE.setupCompleted) === "true";

            if (setupCompleted && state.user) {
                openMainApp();
            } else {
                userNameInput.value = state.user.name || "";
                showScreen(setupScreen);
                showSetupStep(1);
            }
        }

        return;
    }

    if (event === "TOKEN_REFRESHED" && session?.user) {
        state.authenticated = true;
        rememberSupabaseUser(session.user);
        return;
    }

    if (event === "USER_UPDATED" && session?.user) {
        state.authenticated = true;
        rememberSupabaseUser(session.user);
        return;
    }

    if (event === "SIGNED_OUT") {
        clearLocalAuthState();

        if (state.introFinished) {
            window.location.hash = "";
            showScreen(welcomeScreen);
        }
    }
}

async function initializeSupabaseAuth() {
    try {
        await loadSupabaseSDK();

        if (!window.supabase?.createClient) {
            throw new Error("Supabase client is unavailable.");
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );

        supabaseClient.auth.onAuthStateChange(
            handleSupabaseAuthStateChange
        );

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        supabaseAuthReady = true;

        if (data?.session?.user) {
            state.authenticated = true;
            rememberSupabaseUser(data.session.user);
        } else {
            state.authenticated = false;
        }
    } catch (error) {
        console.error("Supabase initialization error:", error);
        supabaseClient = null;
        supabaseAuthReady = false;
        state.authenticated = false;
    }
}

function formatAuthError(error) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("invalid login credentials")) {
        return state.language === "en"
            ? "Email or password is incorrect."
            : "Email atau password salah.";
    }

    if (message.includes("email not confirmed")) {
        return state.language === "en"
            ? "Email is not confirmed yet. Check your inbox first."
            : "Email belum dikonfirmasi. Cek inbox email lo dulu.";
    }

    if (message.includes("user already registered")) {
        return state.language === "en"
            ? "That email is already registered."
            : "Email itu sudah terdaftar.";
    }

    if (message.includes("password should be at least")) {
        return state.language === "en"
            ? "Password is too short."
            : "Password terlalu pendek.";
    }

    if (message.includes("rate limit") || message.includes("too many requests")) {
        return state.language === "en"
            ? "Too many attempts. Please wait a moment and try again."
            : "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
    }

    return error?.message || (state.language === "en"
        ? "Authentication failed. Please try again."
        : "Autentikasi gagal. Coba lagi.");
}

function setAuthFormBusy(form, busy, idleText) {
    const button = form?.querySelector('button[type="submit"]');
    if (!button) return;

    button.disabled = busy;
    button.dataset.idleText = idleText;
    button.textContent = busy
        ? (state.language === "en" ? "Please wait..." : "Tunggu sebentar...")
        : idleText;
}

function ensureAuthSignOutButton() {
    const resetButton = $("resetAppBtn");
    if (!resetButton || $("supabaseSignOutBtn")) return;

    const button = document.createElement("button");
    button.className = "setting-button";
    button.id = "supabaseSignOutBtn";
    button.type = "button";
    button.innerHTML = `
        <div>
            <strong data-i18n="signOut">Sign out</strong>
            <span data-i18n="signOutDesc">Keluar dari akun Trazeel</span>
        </div>
        <span>›</span>
    `;

    resetButton.parentElement?.insertBefore(button, resetButton);
    button.addEventListener("click", handleSupabaseSignOut);
}

async function handleSupabaseSignOut() {
    if (supabaseAuthBusy) return;

    if (!supabaseClient) {
        clearLocalAuthState();
        showScreen(welcomeScreen);
        showToast(state.language === "en" ? "Signed out." : "Berhasil keluar.");
        return;
    }

    supabaseAuthBusy = true;

    try {
        const { error } = await supabaseClient.auth.signOut({
            scope: "local"
        });

        if (error) throw error;

        showToast(
            state.language === "en"
                ? "Signed out successfully."
                : "Berhasil keluar dari akun."
        );
    } catch (error) {
        console.error("Supabase sign out error:", error);
        showToast(formatAuthError(error));
    } finally {
        supabaseAuthBusy = false;
    }
}

const FEEL_META = {
    calm: { label: "Calm", emoji: "😎" },
    neutral: { label: "Neutral", emoji: "😐" },
    fear: { label: "Fear", emoji: "😨" },
    revenge: { label: "Revenge", emoji: "😤" },
    overconfident: { label: "Overconfident", emoji: "🔥" },
    anxious: { label: "Anxious", emoji: "😰" }
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

async function init() {
    loadData();
    bindEvents();
    initializePreferences();
    setTodayDefaults();
    initializeNotificationSystem();
    ensureAuthSignOutButton();
    await initializeSupabaseAuth();
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

function initializeIntro() {
    const setupCompleted =
        localStorage.getItem(STORAGE.setupCompleted) === "true";

    setTimeout(() => {
        introScreen.classList.add("exit");

        setTimeout(() => {
            introScreen.classList.add("hidden");
            state.introFinished = true;

            const storedUser = state.user;

            if (state.authenticated && setupCompleted && storedUser) {
                openMainApp();
                handleHashRoute();
            } else if (state.authenticated) {
                if (storedUser?.name) {
                    userNameInput.value = storedUser.name;
                }
                showScreen(setupScreen);
                showSetupStep(1);
            } else {
                showScreen(welcomeScreen);
            }
        }, 520);
    }, 1900);
}



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

    if (!authSignupOpen) {
        authOverlayTitle.textContent = "Welcome Back";
        authOverlayDescription.textContent = "Sudah punya akun? Masuk dan lanjutkan perjalananmu.";
        authArrowBtn.textContent = mobile ? "↑" : "←";
        authArrowBtn.setAttribute("aria-label", "Open sign up");
        authSwitchHint.textContent = "Geser untuk Sign Up";
    } else {
        authOverlayTitle.textContent = "Create Account";
        authOverlayDescription.textContent = "Belum punya akun? Daftar sekarang dan mulai perjalananmu.";
        authArrowBtn.textContent = mobile ? "↓" : "→";
        authArrowBtn.setAttribute("aria-label", "Back to login");
        authSwitchHint.textContent = "Geser untuk Login";
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

function deriveLoginUser(email) {
    const localPart = String(email || "").split("@")[0].trim();
    const name = localPart
        ? localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 30)
        : "Trader";
    return {
        name,
        accountName: "Main Account",
        startingBalance: 0,
        currency: "USD",
        createdAt: new Date().toISOString(),
        email: String(email || "").trim(),
        authProvider: "login"
    };
}

async function handleAuthLogin(event) {
    event.preventDefault();

    if (supabaseAuthBusy) return;

    const email =
        authLoginForm.querySelector('input[name="email"]')?.value.trim();

    const password =
        authLoginForm.querySelector('input[name="password"]')?.value || "";

    if (!email || !password) {
        showToast(
            state.language === "en"
                ? "Enter your email and password."
                : "Isi email dan password dulu."
        );
        return;
    }

    if (!supabaseClient || !supabaseAuthReady) {
        showToast(
            state.language === "en"
                ? "Authentication service is unavailable. Refresh the page and try again."
                : "Layanan autentikasi belum siap. Refresh halaman lalu coba lagi."
        );
        return;
    }

    supabaseAuthBusy = true;
    setAuthFormBusy(authLoginForm, true, "Login");

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        if (data?.user) {
            state.authenticated = true;
            rememberSupabaseUser(data.user);
        }

        showToast(
            state.language === "en"
                ? "Login successful. Welcome back."
                : "Login berhasil. Selamat datang kembali."
        );
    } catch (error) {
        console.error("Supabase login error:", error);
        showToast(formatAuthError(error));
    } finally {
        supabaseAuthBusy = false;
        setAuthFormBusy(authLoginForm, false, "Login");
    }
}

async function handleAuthSignup(event) {
    event.preventDefault();

    if (supabaseAuthBusy) return;

    const name = authSignupName?.value.trim();
    const email =
        authSignupForm.querySelector('input[name="email"]')?.value.trim();
    const password =
        authSignupForm.querySelector('input[name="password"]')?.value || "";

    if (!name || !email || !password) {
        showToast(
            state.language === "en"
                ? "Complete your name, email, and password."
                : "Lengkapi nama, email, dan password dulu."
        );
        return;
    }

    if (!supabaseClient || !supabaseAuthReady) {
        showToast(
            state.language === "en"
                ? "Authentication service is unavailable. Refresh the page and try again."
                : "Layanan autentikasi belum siap. Refresh halaman lalu coba lagi."
        );
        return;
    }

    supabaseAuthBusy = true;
    setAuthFormBusy(authSignupForm, true, "Sign Up");

    try {
        const { data, error } =
            await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: name
                    }
                }
            });

        if (error) throw error;

        localStorage.setItem(
            "trazeel_auth_signup_v1",
            JSON.stringify({
                name,
                email,
                createdAt: new Date().toISOString()
            })
        );

        userNameInput.value = name;
        accountNameInput.value = "";
        startingBalanceInput.value = "";
        currencyInput.value = "USD";

        if (data?.session?.user) {
            state.authenticated = true;
            rememberSupabaseUser(data.session.user);
            showScreen(setupScreen);
            showSetupStep(1);
            showToast(
                state.language === "en"
                    ? "Account created. Complete your account setup."
                    : "Akun berhasil dibuat. Lengkapi account setup lo."
            );
        } else {
            authSignupOpen = false;
            if (authOverlay) authOverlay.style.transform = "";
            applyAuthState(true);
            resizeAuthInnerContent();

            authLoginForm.querySelector('input[name="email"]')?.focus();

            showToast(
                state.language === "en"
                    ? "Account created. Check your email to confirm the account, then log in."
                    : "Akun berhasil dibuat. Cek email untuk konfirmasi akun, lalu login."
            );
        }
    } catch (error) {
        console.error("Supabase signup error:", error);
        showToast(formatAuthError(error));
    } finally {
        supabaseAuthBusy = false;
        setAuthFormBusy(authSignupForm, false, "Sign Up");
    }
}

/* =========================================================
   STORAGE
========================================================= */

function loadData() {
    state.user = safeJSONParse(
        localStorage.getItem(STORAGE.user),
        null
    );

    const journals = safeJSONParse(
        localStorage.getItem(STORAGE.journals),
        []
    );
    const profile = safeJSONParse(localStorage.getItem(STORAGE.profile), null);
    state.journals = Array.isArray(journals) ? journals : [];
    if (profile && typeof profile === "object") state.profile = { ...state.profile, ...profile };
    state.theme = localStorage.getItem(STORAGE.theme) || "system";
    state.language = localStorage.getItem(STORAGE.language) || "id";
}

function saveUser() {
    localStorage.setItem(
        STORAGE.user,
        JSON.stringify(state.user)
    );

    localStorage.setItem(
        STORAGE.setupCompleted,
        "true"
    );
}

function saveJournals() {
    localStorage.setItem(STORAGE.journals, JSON.stringify(state.journals));
}

function saveProfile() {
    localStorage.setItem(STORAGE.profile, JSON.stringify(state.profile));
}

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
            "Isi nama lo dulu."
        );

        return;
    }

    clearFieldError(
        userNameInput,
        $("userNameError")
    );

    showSetupStep(2);
}

function handleFinishSetup() {
    const name =
        userNameInput.value.trim();

    const accountName =
        accountNameInput.value.trim();

    const balance =
        Number(startingBalanceInput.value);

    const currency =
        currencyInput.value;

    let valid = true;

    if (!name) {
        setFieldError(
            userNameInput,
            $("userNameError"),
            "Isi nama lo dulu."
        );

        showSetupStep(1);

        return;
    }

    if (!accountName) {
        setFieldError(
            accountNameInput,
            $("accountNameError"),
            "Isi nama account."
        );

        valid = false;
    } else {
        clearFieldError(
            accountNameInput,
            $("accountNameError")
        );
    }

    if (
        !Number.isFinite(balance) ||
        balance < 0
    ) {
        setFieldError(
            startingBalanceInput,
            $("startingBalanceError"),
            "Masukkan balance yang valid."
        );

        valid = false;
    } else {
        clearFieldError(
            startingBalanceInput,
            $("startingBalanceError")
        );
    }

    if (!valid) return;

    state.user = {
        name,
        accountName,
        startingBalance: balance,
        currency,
        createdAt:
            new Date().toISOString()
    };

    saveUser();
    openMainApp();

    showToast(
        "Account berhasil disiapkan."
    );
}

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
        "Journal berhasil ditambahkan dan dikunci. 🔒"
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
        "Pilih tanggal."
    );

    needText(
        data.pair,
        "journalPair",
        "Isi pair."
    );

    if (
        data.marketType ===
        "future"
    ) {
        if (!data.category) {
            showToast(
                "Pilih kategori Future: Forex atau Crypto."
            );

            valid = false;
        }

        if (!data.position) {
            setCustomFieldError(
                "journalPosition",
                "Pilih BUY atau SELL."
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
                "Pilih jenis trade."
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
            "Pilih Profit/Loss dan isi nominalnya."
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
        "Isi entry price."
    );

    needNumber(
        data.sl,
        "journalSl",
        "Isi stop loss."
    );

    needNumber(
        data.tp,
        "journalTp",
        "Isi take profit."
    );

    needText(
        data.setup,
        "journalSetup",
        "Isi setup."
    );

    needText(
        data.method,
        "journalMethod",
        "Isi method."
    );

    if (!data.feel) {
        setCustomFieldError(
            "journalFeel",
            "Pilih kondisi feel."
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

    journalCountText.textContent =
        state.selectedDate
            ? "on selected date"
            : filtered.length === 1
              ? "journal"
              : "journals";

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
                    Tap to view • <span aria-hidden="true">🔒</span>
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

                <h2>
                    No journal on this date.
                </h2>

                <p>
                    Tidak ada record yang memakai tanggal
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
                    Clear date filter
                </button>
            </div>
        `;
    }

    return `
        <div class="empty-list-state">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17M8 6h8M8 10h8"/></svg>
            </div>

            <h2>
                No journal entries yet.
            </h2>

            <p>
                Trade pertama lo bisa menjadi titik awal
                dari data yang nantinya membentuk statistics
                dan psychology dashboard.
            </p>

            <button
                class="primary-btn"
                type="button"
                id="emptyAddJournalBtn"
            >
                Add First Trade
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
                "Market",
                marketLabel
            )}

            ${detailGroup(
                "Pair",
                journal.pair
            )}
        </div>

        ${
            journal.marketType ===
            "future"
                ? detailGroup(
                      "Position",
                      capitalize(
                          journal.position
                      )
                  )
                : ""
        }

        ${detailGroup(
            "Date",
            formatDateLong(
                journal.date
            )
        )}

        ${detailGroup(
            "Final PNL",
            formatSignedNumber(
                journal.pnl
            ),
            pnlClass
        )}

        <div class="detail-grid two">
            ${detailGroup(
                "Entry Price",
                formatRawNumber(
                    journal.entryPrice
                )
            )}

            ${detailGroup(
                "Setup",
                journal.setup
            )}
        </div>

        <div class="detail-grid two">
            ${detailGroup(
                "Stop Loss",
                formatRawNumber(
                    journal.sl
                )
            )}

            ${detailGroup(
                "Take Profit",
                formatRawNumber(
                    journal.tp
                )
            )}
        </div>

        <div class="detail-grid two">
            ${detailGroup(
                "Method",
                journal.method
            )}

            ${detailGroup(
                "Feel",
                `${getFeelEmoji(
                    journal.feel
                )} ${formatFeelLabel(
                    journal.feel
                )}`
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
            "Screenshot",
            "Not provided (optional)"
        );
    }

    html += detailGroup(
        "Created",
        formatCreatedAt(
            journal.createdAt
        )
    );

    $("journalDetailContent")
        .innerHTML = html;

    openModal(detailModal);
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
    const journal =
        state.journals.find(
            (item) =>
                item.id ===
                state.selectedJournalId
        );

    if (!journal) return;

    const confirmed =
        window.confirm(
            `Delete journal ${formatDateUpper(
                journal.date
            )} • ${journal.pair}?\n\nRecord ini tidak dapat dipulihkan setelah dihapus.`
        );

    if (!confirmed) return;

    state.journals =
        state.journals.filter(
            (item) =>
                item.id !==
                state.selectedJournalId
        );

    saveJournals();
    syncNotificationInsights();

    state.selectedJournalId =
        null;

    closeModal(
        detailModal
    );

    updateAllAnalytics();
    renderJournal();

    showToast(
        "Journal dihapus."
    );
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
        `${stats.wins} wins / ${stats.total} trades`;

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
            : "No journal data";

    renderPerformanceBars();
    renderPsychologyStatistics();
    renderPsychologyInsight();
}

function renderPerformanceBars() {
    const container =
        $("performanceBars");

    if (!state.journals.length) {
        container.innerHTML = `
            <div class="stats-empty-message">
                Chart akan muncul setelah journal memiliki data.
            </div>
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
        container.innerHTML = `
            <div class="stats-empty-message">
                Belum ada data psychology.
            </div>
        `;

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

                                    <span>
                                        ${
                                            data.count
                                        }
                                        trade${
                                            data.count ===
                                            1
                                                ? ""
                                                : "s"
                                        }
                                    </span>
                                </div>
                            </div>

                            <div class="psych-metric">
                                <span>
                                    Win rate
                                </span>

                                <strong>
                                    ${formatNumber(
                                        winRate,
                                        0
                                    )}%
                                </strong>
                            </div>

                            <div class="psych-metric">
                                <span>
                                    Avg PNL
                                </span>

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
        title.textContent =
            "Belum ada cukup data.";

        text.textContent =
            "Setelah beberapa trade dicatat, bagian ini akan membaca hubungan antara feel dan hasil trading lo.";

        return;
    }

    if (
        state.journals.length <
        3
    ) {
        title.textContent =
            "Tambahkan beberapa trade lagi.";

        text.textContent =
            "Data psychology akan lebih bermakna setelah ada beberapa journal, supaya perbandingan antar kondisi tidak terlalu tipis.";

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
        title.textContent =
            `${formatFeelLabel(
                best.feel
            )} terlihat paling sehat.`;

        const bestName =
            formatFeelLabel(
                best.feel
            );

        const worstName =
            formatFeelLabel(
                worst.feel
            );

        text.textContent =
            `Dari ${
                best.count
            } trade saat ${bestName}, rata-rata PNL tercatat ${formatSignedNumber(
                best.avgPnl
            )}. ${worstName} berada di ${formatSignedNumber(
                worst.avgPnl
            )} rata-rata. Gunakan pola ini sebagai bahan evaluasi, bukan sebagai alasan untuk memaksa setup.`;

        return;
    }

    const mostFrequent =
        entries.sort(
            (a, b) =>
                b[1].count -
                a[1].count
        )[0];

    title.textContent =
        `${formatFeelLabel(
            mostFrequent[0]
        )} paling sering muncul.`;

    text.textContent =
        `Kondisi ${formatFeelLabel(
            mostFrequent[0]
        )} muncul pada ${
            mostFrequent[1].count
        } trade. Belum ada perbedaan yang cukup kuat untuk membuat kesimpulan besar, jadi kumpulkan data tanpa mengubah catatan masa lalu.`;
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

        profilePsychologyNote.textContent =
            "Psychology di halaman ini akan membaca data kondisi psikologi dari journal trading lo.";

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

    psychologyFace.textContent =
        getFeelEmoji(feel);

    profilePsychologyNote.textContent =
        `${formatFeelLabel(
            feel
        )} adalah kondisi yang paling sering tercatat (${
            data.count
        } trade). Win rate ${formatNumber(
            winRate,
            0
        )}% dengan average PNL ${formatSignedNumber(
            avgPnl
        )}. Insight lebih dalam tersedia di Statistics.`;
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
        showToast(state.language === "en" ? "Name is required." : "Nama wajib diisi.");
        accountEditName.focus();
        return;
    }

    if (!accountName) {
        showToast(state.language === "en" ? "Account name is required." : "Nama account wajib diisi.");
        accountEditAccountName.focus();
        return;
    }

    if (!Number.isFinite(balance) || balance < 0) {
        showToast(state.language === "en" ? "Starting balance is invalid." : "Starting balance tidak valid.");
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

    showToast(state.language === "en" ? "Account information updated." : "Informasi account berhasil diperbarui.");
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
    if (!name) { showToast(state.language === "en" ? "Display name is required." : "Nama profil wajib diisi."); profileEditName.focus(); return; }
    state.user.name = name;
    state.profile.username = username;
    state.profile.bio = profileEditBio.value.trim() || I18N[state.language].defaultBio;
    saveUser(); saveProfile(); updateUserInterface(); closeModal(profileEditModal);
    showToast(state.language === "en" ? "Profile updated." : "Profile berhasil diperbarui.");
}

async function handleProfileAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast(state.language === "en" ? "Please choose an image file." : "Pilih file gambar."); event.target.value = ""; return; }
    try { state.profile.avatar = await compressImage(file, 720, 0.82); saveProfile(); renderProfileAvatar(); showToast(state.language === "en" ? "Profile photo updated." : "Foto profil berhasil diperbarui."); }
    catch (error) { console.error(error); showToast(state.language === "en" ? "Could not process the profile photo." : "Gagal memproses foto profil."); }
    finally { event.target.value = ""; }
}

function renderProfileAvatar() {
    if (!profileAvatarImage || !profileInitial) return;
    if (state.profile.avatar) { profileAvatarImage.src = state.profile.avatar; profileAvatarImage.classList.remove("hidden"); profileInitial.classList.add("hidden"); }
    else { profileAvatarImage.removeAttribute("src"); profileAvatarImage.classList.add("hidden"); profileInitial.classList.remove("hidden"); }
}

const I18N = {
    id: {
        getStarted:"Get Started", continue:"Continue", back:"← Back", enterDashboard:"Enter Dashboard",
        personalDashboard:"PERSONAL DASHBOARD", welcomeBack:"Welcome back to your trading space.", accountBalance:"ACCOUNT BALANCE", todaysResult:"TODAY'S RESULT", tradesLabel:"TRADES", winRateLabel:"WIN RATE",
        yourWorkspace:"YOUR WORKSPACE", everythingInOnePlace:"Everything in one place.", tradingJournal:"Trading Journal", statistics:"Statistics", psychologyTitle:"Psychology", profileSettings:"Profile & Settings", readyToLog:"READY TO LOG?", recordNextTrade:"Record your next trade.",
        journal:"JOURNAL", yourTrades:"Your trades.", filterDate:"FILTER DATE", journals:"journals", journalSingular:"journal", readTheData:"Read the data.", totalTrades:"TOTAL TRADES", journalEntries:"Journal entries", basedOnSltp:"Based on SL / TP", netResultLabel:"NET RESULT", performance:"PERFORMANCE", journalResultOverview:"Journal result overview", psychologyInsight:"PSYCHOLOGY INSIGHT", seeThePattern:"See the pattern.",
        profileLabel:"TRADER PROFILE", editProfile:"Edit", defaultBio:"Membangun konsistensi, satu trade setiap kali.", trades:"Trades", winRate:"Win Rate", netResult:"Net PNL", account:"ACCOUNT", accountInformation:"Informasi account", editAccount:"Edit", editAccountTitle:"Edit Account", saveAccount:"Save Account", name:"Nama", accountName:"Account", startingBalance:"Starting Balance", currency:"Currency", psychology:"PSYCHOLOGY", yourCurrentProfile:"Profil psikologi lo saat ini.", dominantState:"DOMINANT STATE", settings:"SETTINGS", preferences:"Preferences", appearance:"Appearance", appearanceDesc:"Pilih tampilan Trazeel.", language:"Bahasa", languageDesc:"Pilih bahasa interface.", tradingPreferences:"Trading Preferences", tradingPreferencesDesc:"Risk, session, timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Hapus seluruh data lokal", signOut:"Sign out", signOutDesc:"Keluar dari akun Trazeel",
        editProfileTitle:"Edit Profile", saveProfile:"Save Profile", displayName:"Display Name", username:"Username", bio:"Bio", whatDidYouTrade:"What did you trade?", chooseMarket:"Choose the market.", futureMarkets:"Future dibagi menjadi Forex atau Crypto.", chooseTradeType:"Pilih jenis transaksi terlebih dahulu.", spotNotice:"Position tidak diperlukan untuk transaksi Spot.", profit:"Profit", loss:"Loss", tradePositive:"Trade berakhir positif", tradeNegative:"Trade berakhir negatif", screenshot:"Screenshot", close:"Close", deleteJournal:"Delete Journal",
        home:"Home", journalNav:"Journal", statsNav:"Stats", profileNav:"Profile", changeProfilePhoto:"Change profile photo", notifications:"Notifications", clearDateFilter:"Clear date filter",
        namePlaceholder:"Contoh: Zril", accountPlaceholder:"Main Account", balancePlaceholder:"1000", pairPlaceholder:"Contoh: XAUUSD", entryPlaceholder:"3342.50", setupPlaceholder:"Liquidity Sweep", methodPlaceholder:"SMC / Price Action / etc.", yourNamePlaceholder:"Your name", usernamePlaceholder:"@trader", bioPlaceholder:"Tell something about your trading journey...", uploadPrompt:"Upload trading screenshot", showing7Of:"Showing 7 of", sortedNewest:"All journals are ordered from the most recently added.", showingAll:"Showing all", allDisplayed:"All journals are already displayed", seeMore:"See more", noData:"Belum ada data.", noPsychData:"Belum ada data psychology.", statsEmpty:"Chart akan muncul setelah journal memiliki data."
    },
    en: {
        getStarted:"Get Started", continue:"Continue", back:"← Back", enterDashboard:"Enter Dashboard",
        personalDashboard:"PERSONAL DASHBOARD", welcomeBack:"Welcome back to your trading space.", accountBalance:"ACCOUNT BALANCE", todaysResult:"TODAY'S RESULT", tradesLabel:"TRADES", winRateLabel:"WIN RATE",
        yourWorkspace:"YOUR WORKSPACE", everythingInOnePlace:"Everything in one place.", tradingJournal:"Trading Journal", statistics:"Statistics", psychologyTitle:"Psychology", profileSettings:"Profile & Settings", readyToLog:"READY TO LOG?", recordNextTrade:"Record your next trade.",
        journal:"JOURNAL", yourTrades:"Your trades.", filterDate:"FILTER DATE", journals:"journals", journalSingular:"journal", readTheData:"Read the data.", totalTrades:"TOTAL TRADES", journalEntries:"Journal entries", basedOnSltp:"Based on SL / TP", netResultLabel:"NET RESULT", performance:"PERFORMANCE", journalResultOverview:"Journal result overview", psychologyInsight:"PSYCHOLOGY INSIGHT", seeThePattern:"See the pattern.",
        profileLabel:"TRADER PROFILE", editProfile:"Edit", defaultBio:"Building consistency, one trade at a time.", trades:"Trades", winRate:"Win Rate", netResult:"Net PNL", account:"ACCOUNT", accountInformation:"Account information", editAccount:"Edit", editAccountTitle:"Edit Account", saveAccount:"Save Account", name:"Name", accountName:"Account", startingBalance:"Starting Balance", currency:"Currency", psychology:"PSYCHOLOGY", yourCurrentProfile:"Your current psychology profile.", dominantState:"DOMINANT STATE", settings:"SETTINGS", preferences:"Preferences", appearance:"Appearance", appearanceDesc:"Choose how Trazeel looks.", language:"Language", languageDesc:"Choose your interface language.", tradingPreferences:"Trading Preferences", tradingPreferencesDesc:"Risk, session, timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Delete all local data", signOut:"Sign out", signOutDesc:"Sign out of Trazeel",
        editProfileTitle:"Edit Profile", saveProfile:"Save Profile", displayName:"Display Name", username:"Username", bio:"Bio", whatDidYouTrade:"What did you trade?", chooseMarket:"Choose the market.", futureMarkets:"Future is divided into Forex or Crypto.", chooseTradeType:"Choose the transaction type first.", spotNotice:"Position is not required for Spot transactions.", profit:"Profit", loss:"Loss", tradePositive:"Trade ended positive", tradeNegative:"Trade ended negative", screenshot:"Screenshot", close:"Close", deleteJournal:"Delete Journal",
        home:"Home", journalNav:"Journal", statsNav:"Stats", profileNav:"Profile", changeProfilePhoto:"Change profile photo", notifications:"Notifications", clearDateFilter:"Clear date filter",
        namePlaceholder:"e.g. Zril", accountPlaceholder:"Main Account", balancePlaceholder:"1000", pairPlaceholder:"e.g. XAUUSD", entryPlaceholder:"3342.50", setupPlaceholder:"Liquidity Sweep", methodPlaceholder:"SMC / Price Action / etc.", yourNamePlaceholder:"Your name", usernamePlaceholder:"@trader", bioPlaceholder:"Tell something about your trading journey...", uploadPrompt:"Upload trading screenshot", showing7Of:"Showing 7 of", sortedNewest:"All journals are ordered from the most recently added.", showingAll:"Showing all", allDisplayed:"All journals are already displayed", seeMore:"See more", noData:"No data yet.", noPsychData:"No psychology data yet.", statsEmpty:"The chart will appear after journals have data."
    }
};

function t(key, fallback = key) { return I18N[state.language]?.[key] ?? fallback; }

function applyLanguage(language, persist = true) {
    state.language = language === "en" ? "en" : "id";
    if (persist) localStorage.setItem(STORAGE.language, state.language);
    if (languageSelect) languageSelect.value = state.language;
    document.documentElement.lang = state.language;
    const dictionary = I18N[state.language];

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (dictionary[key]) element.textContent = dictionary[key];
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

    if (profileBio && (!state.profile.bio || state.profile.bio === I18N.id.defaultBio || state.profile.bio === I18N.en.defaultBio)) profileBio.textContent = dictionary.defaultBio;
    if (themeSelect) {
        const themeLabels = state.language === "en" ? ["System Default","Dark","Light"] : ["Default Sistem","Gelap","Terang"];
        [...themeSelect.options].forEach((option,index) => option.textContent = themeLabels[index] || option.textContent);
    }
    if (languageSelect) [...languageSelect.options].forEach((option,index) => option.textContent = index === 0 ? "Bahasa Indonesia" : "English");

    // Re-render dynamic areas so their generated copy uses the selected language too.
    updateUserInterface();
    renderJournal();
    renderStatistics();
    renderPsychologyProfile();
}

function applyTheme(theme, persist = true) {
    const allowed = ["system","dark","light"].includes(theme) ? theme : "system";
    state.theme = allowed;
    if (persist) localStorage.setItem(STORAGE.theme, state.theme);
    if (themeSelect) themeSelect.value = state.theme;
    if (allowed === "system") { const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches; document.body.dataset.theme = prefersLight ? "light" : "dark"; }
    else document.body.dataset.theme = allowed;
}

if (window.matchMedia) { const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)"); systemThemeQuery.addEventListener?.("change", () => { if (state.theme === "system") applyTheme("system", false); }); }

/* =========================================================
   RESET
========================================================= */

function resetApplication() {
    const confirmed =
        window.confirm(
            "Reset Dashboard?\n\nIni akan menghapus account setup dan seluruh journal lokal. Data yang dihapus tidak dapat dipulihkan."
        );

    if (!confirmed) {
        return;
    }

    Object.values(
        STORAGE
    ).forEach(
        (key) =>
            localStorage.removeItem(
                key
            )
    );
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);

    state.user = null; state.journals = []; state.selectedDate = ""; state.showAllJournals = false;
    state.profile = { username:"", bio:"Membangun konsistensi, satu trade setiap kali.", avatar:null };
    state.theme = "system"; state.language = "id"; document.body.removeAttribute("data-theme");

    window.location.hash = "";

    journalDateFilter.value = "";

    updateAllAnalytics();

    showSetupStep(1);
    showScreen(welcomeScreen);

    showToast(
        "Dashboard di-reset."
    );
}


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
    const hour =
        new Date().getHours();

    if (hour < 5) {
        return "Good night";
    }

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

function formatMoney(
    amount,
    currency = "USD"
) {
    try {
        return new Intl.NumberFormat(
            "en-US",
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
        "en-US",
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
        "en-US",
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
        "id-ID",
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
        "en-US",
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
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function formatFeelLabel(
    feel
) {
    return (
        FEEL_META[feel]
            ?.label ||
        "Unknown"
    );
}

function getFeelEmoji(
    feel
) {
    return (
        FEEL_META[feel]
            ?.emoji ||
        ""
    );
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
const NOTIFICATION_MAX_ITEMS = 40;

let notificationState = {
    items: [],
    filter: "all"
};

function initializeNotificationSystem() {
    loadNotifications();
    injectNotificationStyles();
    ensureNotificationPanel();
    syncNotificationInsights();
    renderNotificationCenter();
}

function loadNotifications() {
    const parsed = safeJSONParse(
        localStorage.getItem(NOTIFICATION_STORAGE_KEY),
        []
    );

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
        title: "Trade recorded",
        body: `${journal.pair || "Trade"} berhasil dicatat di journal.`,
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
            title: "Activity reminder",
            body:
                `You've logged ${count} trades today. Review your plan before opening another position.`,
            meta:
                `${count} trades today`
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
                    title: "Psychology pattern",
                    body:
                        `${formatFeelLabel(
                            feel
                        )} is appearing repeatedly in your recent journal data.`,
                    meta:
                        `${data.count} trades • avg PNL ${formatSignedNumber(
                            data.pnl /
                                data.count
                        )}`
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

function removeNotification(
    id,
    persist = true
) {
    const next =
        notificationState.items.filter(
            (item) => item.id !== id
        );

    const changed =
        next.length !==
        notificationState.items.length;

    notificationState.items =
        next;

    if (persist && changed) {
        saveNotifications();
    }
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
    if ($("notificationPanel")) {
        return;
    }

    const panel =
        document.createElement(
            "aside"
        );

    panel.id =
        "notificationPanel";

    panel.className =
        "notification-panel";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    panel.innerHTML = `
        <div class="notification-panel-head">
            <div>
                <span class="notification-eyebrow">NOTIFICATIONS</span>
                <h2>Stay in the loop.</h2>
            </div>

            <button
                class="notification-close"
                id="notificationCloseBtn"
                type="button"
                aria-label="Close notifications"
            >×</button>
        </div>

        <div class="notification-tools">
            <div
                class="notification-filters"
                role="tablist"
                aria-label="Notification filters"
            >
                <button
                    class="notification-filter active"
                    data-notification-filter="all"
                    type="button"
                >All</button>

                <button
                    class="notification-filter"
                    data-notification-filter="trading"
                    type="button"
                >Trading</button>

                <button
                    class="notification-filter"
                    data-notification-filter="risk"
                    type="button"
                >Risk</button>

                <button
                    class="notification-filter"
                    data-notification-filter="psychology"
                    type="button"
                >Psychology</button>
            </div>

            <button
                class="notification-mark-all"
                id="notificationMarkAllBtn"
                type="button"
            >Mark all read</button>
        </div>

        <div
            class="notification-list"
            id="notificationList"
        ></div>
    `;

    document.body.appendChild(
        panel
    );

    $("notificationCloseBtn")?.addEventListener(
        "click",
        closeNotificationCenter
    );

    panel
        .querySelectorAll(
            "[data-notification-filter]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () =>
                    setNotificationFilter(
                        button.dataset
                            .notificationFilter
                    )
            );
        });

    $("notificationMarkAllBtn")?.addEventListener(
        "click",
        markAllNotificationsRead
    );

    $("notificationList")?.addEventListener(
        "click",
        (event) => {
            const button =
                event.target.closest(
                    "[data-notification-id]"
                );

            if (!button) return;

            markNotificationRead(
                button.dataset
                    .notificationId
            );
        }
    );

    document.addEventListener(
        "click",
        (event) => {
            const current =
                $("notificationPanel");

            const trigger =
                $("notificationBtn");

            if (
                !current ||
                !current.classList.contains(
                    "open"
                )
            ) {
                return;
            }

            if (
                current.contains(
                    event.target
                ) ||
                trigger?.contains(
                    event.target
                )
            ) {
                return;
            }

            closeNotificationCenter();
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key ===
                    "Escape" &&
                $("notificationPanel")?.classList.contains(
                    "open"
                )
            ) {
                closeNotificationCenter();
            }
        }
    );
}

function renderNotificationCenter() {
    ensureNotificationPanel();

    const list =
        $("notificationList");

    if (!list) return;

    const filtered =
        getFilteredNotifications();

    const unreadCount =
        getUnreadNotificationCount();

    const markAll =
        $("notificationMarkAllBtn");

    if (markAll) {
        markAll.disabled =
            unreadCount === 0;

        markAll.textContent =
            unreadCount > 0
                ? `Mark all read (${unreadCount})`
                : "All read";
    }

    document
        .querySelectorAll(
            "[data-notification-filter]"
        )
        .forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset
                    .notificationFilter ===
                    notificationState.filter
            );
        });

    updateNotificationBadge(
        unreadCount
    );

    if (!filtered.length) {
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">✓</div>
                <strong>Nothing new here.</strong>
                <p>
                    ${
                        notificationState
                            .items
                            .length
                            ? "Coba filter kategori lain."
                            : "Aktivitas penting akan muncul di sini saat Trazeel digunakan."
                    }
                </p>
            </div>
        `;

        return;
    }

    list.innerHTML =
        filtered
            .map(
                (item) => {
                    const typeLabel =
                        item.type ===
                        "risk"
                            ? "Risk"
                            : item.type ===
                                "psychology"
                              ? "Psychology"
                              : "Trading";

                    const icon =
                        item.type ===
                        "risk"
                            ? "!"
                            : item.type ===
                                "psychology"
                              ? "◌"
                              : "↗";

                    return `
                        <button
                            class="notification-item ${
                                item.read === true
                                    ? ""
                                    : "unread"
                            }"
                            type="button"
                            data-notification-id="${escapeHTML(
                                item.id
                            )}"
                        >
                            <span class="notification-item-icon type-${escapeHTML(
                                item.type
                            )}">
                                ${icon}
                            </span>

                            <span class="notification-item-content">
                                <span class="notification-item-top">
                                    <strong>${escapeHTML(
                                        item.title
                                    )}</strong>

                                    <time>${escapeHTML(
                                        formatNotificationTime(
                                            item.createdAt
                                        )
                                    )}</time>
                                </span>

                                <span class="notification-item-body">
                                    ${escapeHTML(
                                        item.body
                                    )}
                                </span>

                                <span class="notification-item-meta">
                                    <span>${typeLabel}</span>
                                    ${
                                        item.meta
                                            ? `<span>•</span><span>${escapeHTML(
                                                  item.meta
                                              )}</span>`
                                            : ""
                                    }
                                </span>
                            </span>

                            ${
                                item.read !== true
                                    ? '<span class="notification-unread-dot" aria-label="Unread"></span>'
                                    : ""
                            }
                        </button>
                    `;
                }
            )
            .join("");
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

    if (diff < minute)
        return "now";

    if (diff < hour)
        return `${Math.floor(
            diff / minute
        )}m ago`;

    if (diff < day)
        return `${Math.floor(
            diff / hour
        )}h ago`;

    if (
        diff <
        7 * day
    )
        return `${Math.floor(
            diff / day
        )}d ago`;

    return new Intl.DateTimeFormat(
        state.language ===
            "en"
            ? "en-US"
            : "id-ID",
        {
            day: "2-digit",
            month: "short"
        }
    ).format(date);
}

function injectNotificationStyles() {
    if ($("notificationStyles")) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "notificationStyles";

    style.textContent = `
        .notification-panel {
            position: fixed;
            top: 82px;
            right: max(16px, calc((100vw - 900px) / 2));
            z-index: 80;
            width: min(430px, calc(100vw - 28px));
            max-height: min(720px, calc(100vh - 98px));
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 18px;
            border: 1px solid var(--border-strong);
            border-radius: var(--radius-lg);
            background: rgba(21,21,26,.97);
            box-shadow: 0 24px 70px rgba(0,0,0,.34);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px) scale(.985);
            transform-origin: top right;
            transition:
                opacity 220ms ease,
                visibility 220ms ease,
                transform 300ms ease;
        }

        .notification-panel.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        .notification-panel-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }

        .notification-eyebrow {
            display: block;
            color: var(--text-muted);
            font-size: 9px;
            font-weight: 800;
            letter-spacing: .16em;
        }

        .notification-panel-head h2 {
            margin-top: 5px;
            color: var(--text);
            font-size: 22px;
            letter-spacing: -.025em;
        }

        .notification-close {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid var(--border);
            border-radius: 11px;
            color: var(--text-soft);
            background: var(--surface-2);
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
            transition:
                transform 180ms ease,
                background 180ms ease;
        }

        .notification-close:hover {
            transform: rotate(4deg);
            background: var(--surface-3);
        }

        .notification-tools {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 13px 0;
        }

        .notification-filters {
            min-width: 0;
            display: flex;
            gap: 5px;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .notification-filters::-webkit-scrollbar {
            display: none;
        }

        .notification-filter {
            flex: 0 0 auto;
            min-height: 30px;
            padding: 0 10px;
            border-radius: 999px;
            color: var(--text-muted);
            background: transparent;
            border: 1px solid transparent;
            font-size: 9px;
            font-weight: 800;
            cursor: pointer;
            transition:
                color 180ms ease,
                background 180ms ease,
                border-color 180ms ease;
        }

        .notification-filter.active {
            color: var(--text);
            background: var(--accent-soft);
            border-color: var(--border-strong);
        }

        .notification-mark-all {
            flex: 0 0 auto;
            padding: 0;
            color: var(--text-soft);
            background: transparent;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
        }

        .notification-mark-all:disabled {
            opacity: .42;
            cursor: default;
        }

        .notification-list {
            min-height: 0;
            overflow: auto;
            padding-right: 2px;
            display: grid;
            gap: 8px;
            scrollbar-width: thin;
        }

        .notification-item {
            position: relative;
            width: 100%;
            display: grid;
            grid-template-columns: 34px minmax(0,1fr) auto;
            align-items: start;
            gap: 10px;
            padding: 12px;
            text-align: left;
            border: 1px solid var(--border);
            border-radius: 16px;
            color: var(--text);
            background: var(--surface);
            cursor: pointer;
            transition:
                transform 220ms ease,
                background 180ms ease,
                border-color 180ms ease;
        }

        .notification-item:hover {
            transform: translateY(-1px);
            background: var(--surface-2);
            border-color: var(--border-strong);
        }

        .notification-item.unread {
            border-color: var(--border-strong);
            background:
                linear-gradient(
                    135deg,
                    var(--accent-soft),
                    transparent 60%
                ),
                var(--surface);
        }

        .notification-item-icon {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: var(--surface-2);
            color: var(--text-soft);
            font-size: 13px;
            font-weight: 900;
        }

        .notification-item-icon.type-trading {
            color: var(--blue);
        }

        .notification-item-icon.type-risk {
            color: var(--orange);
        }

        .notification-item-icon.type-psychology {
            color: var(--accent);
        }

        .notification-item-content {
            min-width: 0;
            display: grid;
            gap: 6px;
        }

        .notification-item-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .notification-item-top strong {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11px;
        }

        .notification-item-top time {
            flex: 0 0 auto;
            color: var(--text-muted);
            font-size: 8px;
            white-space: nowrap;
        }

        .notification-item-body {
            color: var(--text-soft);
            font-size: 10px;
            line-height: 1.55;
        }

        .notification-item-meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 5px;
            color: var(--text-muted);
            font-size: 8px;
        }

        .notification-unread-dot {
            width: 7px;
            height: 7px;
            margin-top: 6px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 0 4px var(--accent-soft);
        }

        .notification-empty {
            min-height: 230px;
            display: grid;
            place-items: center;
            align-content: center;
            padding: 24px 18px;
            text-align: center;
            border: 1px dashed var(--border-strong);
            border-radius: 18px;
            color: var(--text-soft);
        }

        .notification-empty-icon {
            width: 46px;
            height: 46px;
            display: grid;
            place-items: center;
            margin-bottom: 12px;
            border-radius: 14px;
            color: var(--green);
            background: var(--green-soft);
            font-size: 17px;
            font-weight: 900;
        }

        .notification-empty strong {
            color: var(--text);
            font-size: 12px;
        }

        .notification-empty p {
            max-width: 270px;
            margin-top: 6px;
            color: var(--text-muted);
            font-size: 9px;
            line-height: 1.5;
        }

        .icon-btn.has-notifications {
            border-color: var(--border-strong);
        }

        .notification-unread-count {
            position: absolute;
            top: -5px;
            right: -5px;
            min-width: 17px;
            height: 17px;
            padding: 0 4px;
            display: grid;
            place-items: center;
            border: 2px solid var(--bg);
            border-radius: 999px;
            color: var(--bg);
            background: var(--accent);
            font-size: 7px;
            font-weight: 900;
            line-height: 1;
        }

        @media (max-width: 560px) {
            .notification-panel {
                top: 78px;
                right: 10px;
                width: calc(100vw - 20px);
                max-height: calc(100vh - 90px);
                border-radius: 20px;
                padding: 15px;
            }

            .notification-tools {
                align-items: flex-end;
            }

            .notification-mark-all {
                font-size: 8px;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}
