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
    profile: { username:"", bio:"Membangun konsistensi, satu trade setiap kali.", avatar:null },
    theme: "system",
    language: "id"
};

const $ = (id) => document.getElementById(id);

const introScreen = $("introScreen");
const welcomeScreen = $("welcomeScreen");
const setupScreen = $("setupScreen");
const mainApp = $("mainApp");

const startSetupBtn = $("startSetupBtn");
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
    initializeIntro();
}

function bindEvents() {
    startSetupBtn.addEventListener("click", () => {
        showScreen(setupScreen);
        showSetupStep(1);
    });

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

    $("notificationBtn")?.addEventListener("click", () => {
        showToast(
            "Belum ada notification engine. Bagian ini disiapkan untuk tahap berikutnya."
        );
    });

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

            if (setupCompleted && storedUser) {
                openMainApp();
                handleHashRoute();
            } else {
                showScreen(welcomeScreen);
            }
        }, 520);
    }, 1900);
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
        profileLabel:"TRADER PROFILE", editProfile:"Edit", defaultBio:"Membangun konsistensi, satu trade setiap kali.", trades:"Trades", winRate:"Win Rate", netResult:"Net PNL", account:"ACCOUNT", accountInformation:"Informasi account", editAccount:"Edit", editAccountTitle:"Edit Account", saveAccount:"Save Account", name:"Nama", accountName:"Account", startingBalance:"Starting Balance", currency:"Currency", psychology:"PSYCHOLOGY", yourCurrentProfile:"Profil psikologi lo saat ini.", dominantState:"DOMINANT STATE", settings:"SETTINGS", preferences:"Preferences", appearance:"Appearance", appearanceDesc:"Pilih tampilan Trazeel.", language:"Bahasa", languageDesc:"Pilih bahasa interface.", tradingPreferences:"Trading Preferences", tradingPreferencesDesc:"Risk, session, timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Hapus seluruh data lokal",
        editProfileTitle:"Edit Profile", saveProfile:"Save Profile", displayName:"Display Name", username:"Username", bio:"Bio", whatDidYouTrade:"What did you trade?", chooseMarket:"Choose the market.", futureMarkets:"Future dibagi menjadi Forex atau Crypto.", chooseTradeType:"Pilih jenis transaksi terlebih dahulu.", spotNotice:"Position tidak diperlukan untuk transaksi Spot.", profit:"Profit", loss:"Loss", tradePositive:"Trade berakhir positif", tradeNegative:"Trade berakhir negatif", screenshot:"Screenshot", close:"Close", deleteJournal:"Delete Journal",
        home:"Home", journalNav:"Journal", statsNav:"Stats", profileNav:"Profile", changeProfilePhoto:"Change profile photo", notifications:"Notifications", clearDateFilter:"Clear date filter",
        namePlaceholder:"Contoh: Zril", accountPlaceholder:"Main Account", balancePlaceholder:"1000", pairPlaceholder:"Contoh: XAUUSD", entryPlaceholder:"3342.50", setupPlaceholder:"Liquidity Sweep", methodPlaceholder:"SMC / Price Action / etc.", yourNamePlaceholder:"Your name", usernamePlaceholder:"@trader", bioPlaceholder:"Tell something about your trading journey...", uploadPrompt:"Upload trading screenshot", showing7Of:"Showing 7 of", sortedNewest:"All journals are ordered from the most recently added.", showingAll:"Showing all", allDisplayed:"All journals are already displayed", seeMore:"See more", noData:"Belum ada data.", noPsychData:"Belum ada data psychology.", statsEmpty:"Chart akan muncul setelah journal memiliki data."
    },
    en: {
        getStarted:"Get Started", continue:"Continue", back:"← Back", enterDashboard:"Enter Dashboard",
        personalDashboard:"PERSONAL DASHBOARD", welcomeBack:"Welcome back to your trading space.", accountBalance:"ACCOUNT BALANCE", todaysResult:"TODAY'S RESULT", tradesLabel:"TRADES", winRateLabel:"WIN RATE",
        yourWorkspace:"YOUR WORKSPACE", everythingInOnePlace:"Everything in one place.", tradingJournal:"Trading Journal", statistics:"Statistics", psychologyTitle:"Psychology", profileSettings:"Profile & Settings", readyToLog:"READY TO LOG?", recordNextTrade:"Record your next trade.",
        journal:"JOURNAL", yourTrades:"Your trades.", filterDate:"FILTER DATE", journals:"journals", journalSingular:"journal", readTheData:"Read the data.", totalTrades:"TOTAL TRADES", journalEntries:"Journal entries", basedOnSltp:"Based on SL / TP", netResultLabel:"NET RESULT", performance:"PERFORMANCE", journalResultOverview:"Journal result overview", psychologyInsight:"PSYCHOLOGY INSIGHT", seeThePattern:"See the pattern.",
        profileLabel:"TRADER PROFILE", editProfile:"Edit", defaultBio:"Building consistency, one trade at a time.", trades:"Trades", winRate:"Win Rate", netResult:"Net PNL", account:"ACCOUNT", accountInformation:"Account information", editAccount:"Edit", editAccountTitle:"Edit Account", saveAccount:"Save Account", name:"Name", accountName:"Account", startingBalance:"Starting Balance", currency:"Currency", psychology:"PSYCHOLOGY", yourCurrentProfile:"Your current psychology profile.", dominantState:"DOMINANT STATE", settings:"SETTINGS", preferences:"Preferences", appearance:"Appearance", appearanceDesc:"Choose how Trazeel looks.", language:"Language", languageDesc:"Choose your interface language.", tradingPreferences:"Trading Preferences", tradingPreferencesDesc:"Risk, session, timeframe", resetDashboard:"Reset Dashboard", resetDashboardDesc:"Delete all local data",
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
