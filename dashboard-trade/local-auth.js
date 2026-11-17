/* =========================================================
   TRAZEEL LOCAL ACCOUNTS + QUICK SWITCH + BACKUP VAULT
   Local-only authentication. No remote authentication service.
========================================================= */
const LA_ACCOUNTS_KEY = "trazeel_local_accounts_v1";
const LA_SESSION_KEY = "trazeel_local_session_v1";
const LA_MIGRATION_KEY = "trazeel_legacy_migrated_v1";
const LA_DATA_PREFIX = "trazeel_local_data_v1:";
const LA_MAX_ACCOUNTS = 3;
const LA_PASSWORD_ITERATIONS = 310000;
const LA_BACKUP_FILENAME = "Trazeel-Backup.json";

let activeLocalAccountId = null;
let localAddAccountMode = false;
let localReturnAccountId = null;
let localPendingConsent = null;
let localBackupTimer = null;
let localVaultDbPromise = null;
let localBackupDirectoryHandle = null;

function laParseJSON(raw, fallback) {
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch (error) { console.warn("Trazeel local data parse error:", error); return fallback; }
}
function laGetAccounts() {
    const accounts = laParseJSON(localStorage.getItem(LA_ACCOUNTS_KEY), []);
    return Array.isArray(accounts) ? accounts.slice(0, LA_MAX_ACCOUNTS) : [];
}
function laSaveAccounts(accounts) {
    localStorage.setItem(LA_ACCOUNTS_KEY, JSON.stringify(accounts.slice(0, LA_MAX_ACCOUNTS)));
    laScheduleAutomaticBackup();
}
function laFindAccount(id) { return laGetAccounts().find((account) => account.id === id) || null; }
function laDataKey(accountId, key) { return LA_DATA_PREFIX + accountId + ":" + key; }
function laReadData(accountId, key, fallback) {
    return laParseJSON(localStorage.getItem(laDataKey(accountId, key)), fallback);
}
function laWriteData(accountId, key, value) {
    localStorage.setItem(laDataKey(accountId, key), JSON.stringify(value));
}
function laDefaultProfile() {
    return { username: "", bio: "Membangun konsistensi, satu trade setiap kali.", avatar: null };
}
function laLoadAccountIntoState(accountId) {
    const account = laFindAccount(accountId);
    if (!account) return false;
    activeLocalAccountId = account.id;
    state.user = laReadData(account.id, "user", {
        name: account.displayName || "Trader", accountName: "Main Account",
        startingBalance: 0, currency: "USD", loginId: account.loginId,
        createdAt: account.createdAt
    });
    state.journals = laReadData(account.id, "journals", []);
    if (!Array.isArray(state.journals)) state.journals = [];
    state.profile = Object.assign(laDefaultProfile(), laReadData(account.id, "profile", {}));
    if (typeof loadNotifications === "function") loadNotifications();
    state.authenticated = true;
    return true;
}
function loadData() {
    state.theme = localStorage.getItem(STORAGE.theme) || "system";
    state.language = localStorage.getItem(STORAGE.language) || "id";
    const sessionId = localStorage.getItem(LA_SESSION_KEY);
    if (sessionId && laLoadAccountIntoState(sessionId)) return;
    activeLocalAccountId = null;
    state.user = null;
    state.journals = [];
    state.profile = laDefaultProfile();
    state.authenticated = false;
}
function saveUser() {
    if (!activeLocalAccountId || !state.user) return;
    laWriteData(activeLocalAccountId, "user", state.user);
    const accounts = laGetAccounts();
    const index = accounts.findIndex((account) => account.id === activeLocalAccountId);
    if (index >= 0) {
        accounts[index].displayName = state.user.name || accounts[index].displayName;
        laSaveAccounts(accounts);
    }
    laScheduleAutomaticBackup();
    renderLocalAccountSwitcher();
}
function saveJournals() {
    if (activeLocalAccountId) laWriteData(activeLocalAccountId, "journals", Array.isArray(state.journals) ? state.journals : []);
    laScheduleAutomaticBackup();
}
function saveProfile() {
    if (activeLocalAccountId) laWriteData(activeLocalAccountId, "profile", state.profile || laDefaultProfile());
    laScheduleAutomaticBackup();
}
function laActivateAccount(accountId) {
    if (!laLoadAccountIntoState(accountId)) return false;
    localStorage.setItem(LA_SESSION_KEY, accountId);
    state.authenticated = true;
    return true;
}
function laOpenMainApp() {
    openMainApp();
    renderLocalAccountSwitcher();
    laRefreshBackupStatus();
}
function initializeLocalAccountSystem() {
    for (const form of [authLoginForm, authSignupForm]) {
        const input = form?.querySelector('[name="loginId"]');
        if (input) { input.type = "text"; input.autocomplete = "username"; input.inputMode = "text"; }
    }
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => false);
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("service-worker.js").catch((error) => {
            console.warn("Trazeel offline cache registration failed:", error);
        });
    }
    renderLocalAccountSwitcher();
    laRefreshBackupStatus();
}
function initializeIntro() {
    setTimeout(() => {
        introScreen.classList.add("exit");
        setTimeout(() => {
            introScreen.classList.add("hidden");
            state.introFinished = true;
            if (state.authenticated && state.user) {
                const account = laFindAccount(activeLocalAccountId);
                if (account?.setupCompleted) laOpenMainApp();
                else {
                    userNameInput.value = state.user.name || "";
                    showScreen(setupScreen);
                    showSetupStep(1);
                }
            } else showScreen(welcomeScreen);
        }, 520);
    }, 1200);
}
function ensureLocalSignOutButton() {
    const resetButton = $("resetAppBtn");
    if (!resetButton || $("localSignOutBtn")) return;
    const button = document.createElement("button");
    button.className = "setting-button";
    button.id = "localSignOutBtn";
    button.type = "button";
    button.innerHTML = `<div><strong>${t('logout')}</strong><span>${t('logoutDescription')}</span></div><span>›</span>`;
    resetButton.parentElement?.insertBefore(button, resetButton);
    button.addEventListener("click", handleLocalSignOut);
}
function handleLocalSignOut() {
    localStorage.removeItem(LA_SESSION_KEY);
    activeLocalAccountId = null;
    localAddAccountMode = false;
    localReturnAccountId = null;
    state.user = null;
    state.journals = [];
    state.profile = laDefaultProfile();
    state.authenticated = false;
    state.selectedDate = "";
    state.showAllJournals = false;
    window.location.hash = "";
    showScreen(authGateScreen);
    initializeAuthGate();
    showToast(t("logoutSuccess"));
}
function laBytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((value) => { binary += String.fromCharCode(value); });
    return btoa(binary);
}
function laBase64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
async function laCreatePasswordHash(password, saltBytes) {
    if (!window.crypto?.subtle) throw new Error("Login aman memerlukan HTTPS atau localhost.");
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2", salt: saltBytes, iterations: LA_PASSWORD_ITERATIONS, hash: "SHA-256"
    }, material, 256);
    return laBytesToBase64(new Uint8Array(bits));
}
function laConstantTimeEqual(left, right) {
    if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
    let difference = 0;
    for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
    return difference === 0;
}
async function laCreateAccount(loginId, password, displayName) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return {
        id: crypto.randomUUID(), loginId, displayName,
        salt: laBytesToBase64(salt),
        passwordHash: await laCreatePasswordHash(password, salt),
        quickSwitchAllowed: false, setupCompleted: false,
        createdAt: new Date().toISOString()
    };
}
async function laVerifyPassword(account, password) {
    try {
        const candidate = await laCreatePasswordHash(password, laBase64ToBytes(account.salt));
        return laConstantTimeEqual(candidate, account.passwordHash);
    } catch (error) { console.error("Local password verification failed:", error); return false; }
}
function laCreateEmptyAccountData(account) {
    laWriteData(account.id, "user", {
        name: account.displayName, accountName: "Main Account", startingBalance: 0,
        currency: "USD", loginId: account.loginId, createdAt: account.createdAt
    });
    laWriteData(account.id, "journals", []);
    laWriteData(account.id, "profile", laDefaultProfile());
    laWriteData(account.id, "notifications", []);
}
function laHasLegacyData() {
    return localStorage.getItem(STORAGE.setupCompleted) === "true" ||
        localStorage.getItem(STORAGE.journals) !== null ||
        localStorage.getItem(STORAGE.profile) !== null ||
        localStorage.getItem(STORAGE.user) !== null;
}
function laMigrateLegacyData(account) {
    const legacyUser = laParseJSON(localStorage.getItem(STORAGE.user), {}) || {};
    const legacyJournals = laParseJSON(localStorage.getItem(STORAGE.journals), []);
    const legacyProfile = laParseJSON(localStorage.getItem(STORAGE.profile), {}) || {};
    const migratedUser = Object.assign({}, legacyUser, {
        name: account.displayName || legacyUser.name || "Trader",
        loginId: account.loginId,
        createdAt: legacyUser.createdAt || account.createdAt,
        accountName: legacyUser.accountName || "Main Account",
        startingBalance: Number.isFinite(Number(legacyUser.startingBalance)) ? Number(legacyUser.startingBalance) : 0,
        currency: legacyUser.currency || "USD"
    });
    laWriteData(account.id, "user", migratedUser);
    laWriteData(account.id, "journals", Array.isArray(legacyJournals) ? legacyJournals : []);
    laWriteData(account.id, "profile", Object.assign(laDefaultProfile(), legacyProfile));
    const legacyNotifications = laParseJSON(localStorage.getItem(NOTIFICATION_STORAGE_KEY), []);
    laWriteData(account.id, "notifications", Array.isArray(legacyNotifications) ? legacyNotifications : []);
    account.setupCompleted = localStorage.getItem(STORAGE.setupCompleted) === "true";
    localStorage.setItem(LA_MIGRATION_KEY, "true");
    laScheduleAutomaticBackup();
}
function laShowQuickSwitchConsent(accountId, returnAccountId) {
    const account = laFindAccount(accountId);
    if (!account) return;
    localPendingConsent = { accountId, returnAccountId: returnAccountId || null };
    $("switchPermissionAccountName").textContent = account.displayName || account.loginId;
    $("switchPermissionDescription").textContent = t("switchPermissionDescription");
    const modal = $("switchPermissionModal");
    modal?.classList.remove("hidden");
    modal?.setAttribute("aria-hidden", "false");
}
function localFinishConsent(allowed) {
    if (!localPendingConsent) return;
    const pending = localPendingConsent;
    const accounts = laGetAccounts();
    const index = accounts.findIndex((account) => account.id === pending.accountId);
    if (index >= 0) {
        accounts[index].quickSwitchAllowed = Boolean(allowed);
        laSaveAccounts(accounts);
    }
    localPendingConsent = null;
    $("switchPermissionModal")?.classList.add("hidden");
    $("switchPermissionModal")?.setAttribute("aria-hidden", "true");
    localAddAccountMode = false;
    localReturnAccountId = null;
    if (pending.returnAccountId && laFindAccount(pending.returnAccountId)) {
        laActivateAccount(pending.returnAccountId);
        laOpenMainApp();
    } else if (laFindAccount(pending.accountId)) {
        laActivateAccount(pending.accountId);
        laOpenMainApp();
    }
    showToast(allowed ? t("switchAllowed") : t("switchDenied"));
}
function setAuthFormBusy(form, busy, label) {
    const button = form?.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? t("wait") : label;
}
async function handleAuthLogin(event) {
    event.preventDefault();
    const loginId = String(authLoginForm?.querySelector('[name="loginId"]')?.value || "").trim().toLowerCase();
    const password = authLoginForm?.querySelector('[name="password"]')?.value || "";
    if (!loginId || !password) { showToast(t("enterIdPassword")); return; }
    const account = laGetAccounts().find((item) => item.loginId === loginId);
    if (!account) {
        showToast(t("accountNotFound"));
        return;
    }
    setAuthFormBusy(authLoginForm, true, t("login"));
    try {
        if (!await laVerifyPassword(account, password)) { showToast(t("invalidCredentials")); return; }
        if (localAddAccountMode) {
            const returnId = localReturnAccountId;
            if (account.id === returnId) { showToast(t("accountAlreadyActive")); return; }
            if (account.quickSwitchAllowed) {
                localAddAccountMode = false;
                localReturnAccountId = null;
                if (returnId) laActivateAccount(returnId);
                laOpenMainApp();
                showToast(t("switchAlreadyAllowed"));
                return;
            }
            laShowQuickSwitchConsent(account.id, returnId);
            return;
        }
        laActivateAccount(account.id);
        if (laFindAccount(account.id)?.setupCompleted) laOpenMainApp();
        else {
            userNameInput.value = state.user?.name || account.displayName || "";
            showScreen(setupScreen);
            showSetupStep(1);
        }
        showToast(t("loginSuccess"));
    } catch (error) {
        console.error("Local login error:", error);
        showToast(error.message || t("loginFailed"));
    } finally {
        setAuthFormBusy(authLoginForm, false, t("login"));
        const input = authLoginForm?.querySelector('[name="password"]');
        if (input) input.value = "";
    }
}
async function handleAuthSignup(event) {
    event.preventDefault();
    const name = authSignupName?.value.trim();
    const loginId = String(authSignupForm?.querySelector('[name="loginId"]')?.value || "").trim().toLowerCase();
    const password = authSignupForm?.querySelector('[name="password"]')?.value || "";
    if (!name || !loginId || !password) { showToast(t("fillSignup")); return; }
    if (!/^[a-z0-9._-]{3,24}$/.test(loginId)) {
        showToast(t("invalidAccountId"));
        return;
    }
    if (password.length < 8) { showToast(t("passwordMinLength")); return; }
    const existing = laGetAccounts();
    if (existing.length >= LA_MAX_ACCOUNTS) { showToast(t("maxAccounts")); return; }
    if (existing.some((account) => account.loginId === loginId)) { showToast(t("idAlreadyUsed")); return; }

    setAuthFormBusy(authSignupForm, true, t("signUp"));
    try {
        const account = await laCreateAccount(loginId, password, name);
        const accounts = laGetAccounts();
        const isFirstAccount = accounts.length === 0;
        const shouldMigrate = isFirstAccount && !localStorage.getItem(LA_MIGRATION_KEY) && laHasLegacyData();
        accounts.push(account);
        laSaveAccounts(accounts);

        if (localAddAccountMode) {
            laCreateEmptyAccountData(account);
            laActivateAccount(account.id);
            userNameInput.value = name;
            accountNameInput.value = "";
            startingBalanceInput.value = "";
            currencyInput.value = "USD";
            showScreen(setupScreen);
            showSetupStep(1);
        } else if (shouldMigrate) {
            laMigrateLegacyData(account);
            laSaveAccounts(laGetAccounts().map((item) => item.id === account.id ? account : item));
            laActivateAccount(account.id);
            if (account.setupCompleted) {
                laOpenMainApp();
                laShowQuickSwitchConsent(account.id, null);
            } else {
                userNameInput.value = state.user?.name || name;
                showScreen(setupScreen);
                showSetupStep(1);
            }
        } else {
            laCreateEmptyAccountData(account);
            laActivateAccount(account.id);
            userNameInput.value = name;
            accountNameInput.value = "";
            startingBalanceInput.value = "";
            currencyInput.value = "USD";
            showScreen(setupScreen);
            showSetupStep(1);
        }

        const input = authSignupForm?.querySelector('[name="password"]');
        if (input) input.value = "";
        showToast(t("localAccountCreated"));
    } catch (error) {
        console.error("Local signup error:", error);
        showToast(error.message || t("accountCreateFailed"));
    } finally {
        setAuthFormBusy(authSignupForm, false, t("signUp"));
    }
}
function handleFinishSetup() {
    const name = userNameInput.value.trim();
    const accountName = accountNameInput.value.trim();
    const balance = Number(startingBalanceInput.value);
    const currency = currencyInput.value;
    if (!name) { setFieldError(userNameInput, $("userNameError"), t("setupNameError")); showSetupStep(1); return; }
    if (!accountName) { setFieldError(accountNameInput, $("accountNameError"), t("setupAccountNameError")); return; }
    if (!Number.isFinite(balance) || balance < 0) {
        setFieldError(startingBalanceInput, $("startingBalanceError"), t("setupBalanceError"));
        return;
    }
    state.user = Object.assign({}, state.user || {}, {
        name, accountName, startingBalance: balance, currency,
        loginId: laFindAccount(activeLocalAccountId)?.loginId || "",
        createdAt: state.user?.createdAt || new Date().toISOString()
    });
    const accounts = laGetAccounts();
    const index = accounts.findIndex((account) => account.id === activeLocalAccountId);
    if (index >= 0) {
        accounts[index].displayName = name;
        accounts[index].setupCompleted = true;
        laSaveAccounts(accounts);
    }
    saveUser();
    saveJournals();
    saveProfile();
    state.authenticated = true;
    localStorage.setItem(LA_SESSION_KEY, activeLocalAccountId);
    const returnId = localAddAccountMode ? localReturnAccountId : null;
    laShowQuickSwitchConsent(activeLocalAccountId, returnId);
    laOpenMainApp();
    showToast(t("accountPrepared"));
}
function laStartAddAccount() {
    if (laGetAccounts().length >= LA_MAX_ACCOUNTS) {
        showToast(t("maxAccountsReached"));
        return;
    }
    localAddAccountMode = true;
    localReturnAccountId = activeLocalAccountId;
    showScreen(authGateScreen);
    initializeAuthGate();
    authLoginForm?.reset();
    authSignupForm?.reset();
}
function laEscapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}
function applyLocalAccountLanguage() {
    const button = $("addLocalAccountBtn");
    if (button) {
        const disabled = button.disabled;
        button.textContent = disabled ? t("maxAccountsReached") : t("addAccount");
    }
    const count = $("localAccountCount");
    if (count) count.textContent = `${laGetAccounts().length}/3 ${state.language === "en" ? "accounts" : "akun"}`;
    const status = $("backupStatusText");
    if (status && !localBackupDirectoryHandle) status.textContent = window.showDirectoryPicker ? t("backupFolderHint") : t("backupManualOnly");
    if (status && localBackupDirectoryHandle) void laRefreshBackupStatus();
    if ($("localSignOutBtn")) {
        const btn = $("localSignOutBtn");
        btn.innerHTML = `<div><strong>${t("logout")}</strong><span>${t("logoutDescription")}</span></div><span>›</span>`;
    }
    renderLocalAccountSwitcher();
}

function renderLocalAccountSwitcher() {
    const list = $("localAccountSwitcherList");
    const count = $("localAccountCount");
    const addButton = $("addLocalAccountBtn");
    if (!list) return;
    const accounts = laGetAccounts();
    if (count) count.textContent = accounts.length + (state.language === "en" ? "/3 accounts" : "/3 akun");
    if (addButton) {
        addButton.disabled = accounts.length >= LA_MAX_ACCOUNTS;
        addButton.textContent = addButton.disabled ? t("maxAccountsReached") : t("addAccount");
    }
    if (!accounts.length) {
        list.innerHTML = `<div class="local-empty-state">${t("noLocalAccount")}</div>`;
        return;
    }
    list.innerHTML = accounts.map((account) => {
        const active = account.id === activeLocalAccountId;
        const allowed = Boolean(account.quickSwitchAllowed);
        let action = "";
        if (!active && allowed) {
            action = `<button class="local-account-action" data-local-switch="${laEscapeHTML(account.id)}" type="button">${t('switchAccount')}</button>`;
        } else if (!active && !allowed) {
            action = `<button class="local-account-action muted" data-local-authorize="${laEscapeHTML(account.id)}" type="button">${t('allowSwitch')}</button>`;
        } else if (active && allowed) {
            action = `<button class="local-account-action muted" data-local-revoke="${laEscapeHTML(account.id)}" type="button">${t('revokePermission')}</button>`;
        } else {
            action = `<button class="local-account-action muted" data-local-consent="${laEscapeHTML(account.id)}" type="button">${t('allowSwitch')}</button>`;
        }
        const status = active ? t("accountCurrentlyUsed") : allowed ? t("quickSwitchActive") : t("switchPermissionMissing");
        return '<div class="local-account-row' + (active ? " is-active" : "") + '">' +
            '<div class="local-account-avatar">' + laEscapeHTML((account.displayName || account.loginId).slice(0, 1).toUpperCase()) + '</div>' +
            '<div class="local-account-details"><strong>' + laEscapeHTML(account.displayName || account.loginId) + '</strong>' +
            '<span>@' + laEscapeHTML(account.loginId) + '</span><small>' + status + '</small></div>' +
            '<div class="local-account-controls">' + action + '</div></div>';
    }).join("");
}

async function laOpenVaultDatabase() {
    if (!localVaultDbPromise) {
        localVaultDbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open("trazeel_backup_vault_v1", 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains("settings")) request.result.createObjectStore("settings");
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    return localVaultDbPromise;
}
async function laStoreBackupFolder(handle) {
    localBackupDirectoryHandle = handle;
    const db = await laOpenVaultDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("settings", "readwrite");
        tx.objectStore("settings").put(handle, "backup-folder");
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
async function laGetBackupFolder() {
    if (localBackupDirectoryHandle) return localBackupDirectoryHandle;
    try {
        const db = await laOpenVaultDatabase();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction("settings", "readonly");
            const request = tx.objectStore("settings").get("backup-folder");
            request.onsuccess = () => {
                localBackupDirectoryHandle = request.result || null;
                resolve(localBackupDirectoryHandle);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) { console.warn("Backup folder handle unavailable:", error); return null; }
}
function laBuildBackupPayload() {
    const accounts = laGetAccounts();
    return {
        format: "trazeel-local-backup", version: 1, createdAt: new Date().toISOString(),
        accounts,
        accountData: accounts.map((account) => ({
            accountId: account.id,
            user: laReadData(account.id, "user", null),
            journals: laReadData(account.id, "journals", []),
            profile: laReadData(account.id, "profile", laDefaultProfile()),
            notifications: laReadData(account.id, "notifications", [])
        })),
        preferences: {
            theme: localStorage.getItem(STORAGE.theme) || "system",
            language: localStorage.getItem(STORAGE.language) || "id"
        }
    };
}
async function laWriteBackupToFolder(handle) {
    if (await handle.queryPermission({ mode: "readwrite" }) !== "granted") return false;
    const file = await handle.getFileHandle(LA_BACKUP_FILENAME, { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(laBuildBackupPayload(), null, 2));
    await writable.close();
    laRefreshBackupStatus();
    return true;
}
function laScheduleAutomaticBackup() {
    clearTimeout(localBackupTimer);
    localBackupTimer = setTimeout(async () => {
        try {
            const handle = await laGetBackupFolder();
            if (handle) await laWriteBackupToFolder(handle);
        } catch (error) { console.warn("Trazeel automatic backup failed:", error); }
    }, 850);
}
async function laRefreshBackupStatus() {
    const node = $("backupStatusText");
    if (!node) return;
    const handle = await laGetBackupFolder();
    if (!handle) {
        node.textContent = window.showDirectoryPicker ? t("backupFolderHint") : t("backupManualOnly");
        return;
    }
    try {
        node.textContent = await handle.queryPermission({ mode: "readwrite" }) === "granted"
            ? interpolate(t("backupAutoActive"), { filename: LA_BACKUP_FILENAME })
            : t("backupPermissionAgain");
    } catch (error) { node.textContent = t("backupFolderPermission"); }
}
async function laChooseBackupFolder() {
    if (!window.showDirectoryPicker) {
        showToast(t("backupUnsupported"));
        laDownloadBackup();
        return;
    }
    try {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        if (await handle.requestPermission({ mode: "readwrite" }) !== "granted") {
            showToast(t("backupPermissionDenied"));
            return;
        }
        await laStoreBackupFolder(handle);
        await laWriteBackupToFolder(handle);
        showToast(t("backupEnabled"));
        laRefreshBackupStatus();
    } catch (error) {
        if (error?.name !== "AbortError") {
            console.error("Backup folder selection failed:", error);
            showToast(t("backupFolderUnavailable"));
        }
    }
}
function laDownloadBackup() {
    const blob = new Blob([JSON.stringify(laBuildBackupPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trazeel-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t("backupCreated"));
}
async function laBackupNow() {
    try {
        const handle = await laGetBackupFolder();
        if (handle) {
            let permission = await handle.queryPermission({ mode: "readwrite" });
            if (permission !== "granted" && handle.requestPermission) {
                permission = await handle.requestPermission({ mode: "readwrite" });
            }
            if (permission === "granted" && await laWriteBackupToFolder(handle)) {
                showToast(t("backupUpdated"));
                return;
            }
        }
    } catch (error) { console.warn("Could not use backup folder:", error); }
    laDownloadBackup();
}
function laValidateBackup(payload) {
    return Boolean(payload && payload.format === "trazeel-local-backup" &&
        payload.version === 1 && Array.isArray(payload.accounts) &&
        payload.accounts.length >= 1 && payload.accounts.length <= LA_MAX_ACCOUNTS &&
        Array.isArray(payload.accountData) && payload.accountData.length === payload.accounts.length &&
        payload.accounts.every((account) => account && typeof account.id === "string" &&
            typeof account.loginId === "string" && typeof account.salt === "string" &&
            typeof account.passwordHash === "string") &&
        payload.accountData.every((entry) => entry && payload.accounts.some((account) => account.id === entry.accountId)));
}
async function laRestoreBackupFile(file) {
    try {
        const payload = JSON.parse(await file.text());
        if (!laValidateBackup(payload)) { showToast(t("invalidBackup")); return; }
        if (!window.confirm(t("restoreConfirm"))) return;

        const restoredAccounts = payload.accounts.map((account) => ({
            ...account,
            quickSwitchAllowed: false
        }));
        const oldKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(LA_DATA_PREFIX)) oldKeys.push(key);
        }
        oldKeys.forEach((key) => localStorage.removeItem(key));
        localStorage.setItem(LA_ACCOUNTS_KEY, JSON.stringify(restoredAccounts));
        payload.accountData.forEach((entry) => {
            laWriteData(entry.accountId, "user", entry.user || {});
            laWriteData(entry.accountId, "journals", Array.isArray(entry.journals) ? entry.journals : []);
            laWriteData(entry.accountId, "profile", entry.profile || laDefaultProfile());
            laWriteData(entry.accountId, "notifications", Array.isArray(entry.notifications) ? entry.notifications : []);
        });
        if (payload.preferences) {
            localStorage.setItem(STORAGE.theme, payload.preferences.theme || "system");
            localStorage.setItem(STORAGE.language, payload.preferences.language || "id");
        }
        localStorage.removeItem(LA_SESSION_KEY);
        window.location.reload();
    } catch (error) {
        console.error("Backup restore failed:", error);
        showToast(t("restoreFailed"));
    }
}
function resetApplication() {
    if (!window.confirm(t("resetConfirm"))) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key === LA_ACCOUNTS_KEY || key === LA_SESSION_KEY || key === LA_MIGRATION_KEY || key === NOTIFICATION_STORAGE_KEY ||
            key.startsWith(LA_DATA_PREFIX) || Object.values(STORAGE).includes(key))) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    activeLocalAccountId = null;
    state.user = null;
    state.journals = [];
    state.profile = laDefaultProfile();
    state.authenticated = false;
    state.theme = "system";
    state.language = "id";
    document.body.removeAttribute("data-theme");
    window.location.hash = "";
    showScreen(welcomeScreen);
    showToast(t("resetSuccess"));
}
document.addEventListener("DOMContentLoaded", () => {
    $("restoreBackupFromWelcomeBtn")?.addEventListener("click", () => $("restoreBackupFromWelcomeInput")?.click());
    $("restoreBackupFromWelcomeInput")?.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (file) laRestoreBackupFile(file);
        event.target.value = "";
    });
    $("addLocalAccountBtn")?.addEventListener("click", laStartAddAccount);
    $("chooseBackupFolderBtn")?.addEventListener("click", laChooseBackupFolder);
    $("backupNowBtn")?.addEventListener("click", laBackupNow);
    $("restoreBackupBtn")?.addEventListener("click", () => $("restoreBackupInput")?.click());
    $("restoreBackupInput")?.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (file) laRestoreBackupFile(file);
        event.target.value = "";
    });
    $("allowQuickSwitchBtn")?.addEventListener("click", () => localFinishConsent(true));
    $("denyQuickSwitchBtn")?.addEventListener("click", () => localFinishConsent(false));
    $("localAccountSwitcherList")?.addEventListener("click", (event) => {
        const sw = event.target.closest("[data-local-switch]");
        const auth = event.target.closest("[data-local-authorize]");
        const revoke = event.target.closest("[data-local-revoke]");
        const consent = event.target.closest("[data-local-consent]");

        if (sw) {
            const account = laFindAccount(sw.dataset.localSwitch);
            if (account?.quickSwitchAllowed && laActivateAccount(account.id)) {
                laOpenMainApp();
                showToast(t("switchSuccess"));
            }
        }

        if (auth) {
            const account = laFindAccount(auth.dataset.localAuthorize);
            if (account) {
                localAddAccountMode = true;
                localReturnAccountId = activeLocalAccountId;
                showScreen(authGateScreen);
                initializeAuthGate();
                const input = authLoginForm?.querySelector('[name="loginId"]');
                if (input) input.value = account.loginId;
            }
        }

        if (revoke) {
            const accounts = laGetAccounts();
            const account = accounts.find((item) => item.id === revoke.dataset.localRevoke);
            if (account) {
                account.quickSwitchAllowed = false;
                laSaveAccounts(accounts);
                renderLocalAccountSwitcher();
                showToast(t("switchRevoked"));
            }
        }

        if (consent) laShowQuickSwitchConsent(consent.dataset.localConsent, null);
    });

    themeSelect?.addEventListener("change", laScheduleAutomaticBackup);
    languageSelect?.addEventListener("change", laScheduleAutomaticBackup);
    renderLocalAccountSwitcher();
    laRefreshBackupStatus();
});


/* Account-scoped notification history. */
function loadNotifications() {
    const parsed = activeLocalAccountId
        ? laReadData(activeLocalAccountId, "notifications", [])
        : [];
    notificationState.items = Array.isArray(parsed)
        ? parsed.filter((item) => item && typeof item === "object" && item.id && item.title && item.body)
        : [];
    sortNotifications();
}
function saveNotifications() {
    if (!activeLocalAccountId) return;
    laWriteData(activeLocalAccountId, "notifications", notificationState.items.slice(0, NOTIFICATION_MAX_ITEMS));
    laScheduleAutomaticBackup();
}
