// utils/sessionManager.js
// Centralized session management — all auth data in localStorage for persistence

/**
 * Generate or retrieve unique tab ID (stays in sessionStorage — tab-specific is fine)
 */
export const getOrCreateTabId = () => {
  let tabId = sessionStorage.getItem("tab_id");
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tab_id", tabId);
  }
  return tabId;
};

/**
 * Save session — all auth data goes to localStorage for persistence
 */
export const saveSession = (userData, role) => {
  const tabId = getOrCreateTabId();
  
  // Store auth data in localStorage (persistent across browser close)
  localStorage.setItem("current_user_id", userData.user_id);
  localStorage.setItem("current_username", userData.username);
  localStorage.setItem("current_role", role);
  localStorage.setItem("current_email", userData.email || "");
  
  // Store JWT tokens in localStorage
  if (userData.access_token) {
    localStorage.setItem(`auth_token_${role}`, userData.access_token);
    localStorage.setItem("auth_token", userData.access_token);
  }
  if (userData.refresh_token) {
    localStorage.setItem(`refresh_token_${role}`, userData.refresh_token);
    localStorage.setItem("refresh_token", userData.refresh_token);
  }
  
  // Track all active sessions
  let allSessions = JSON.parse(localStorage.getItem("all_active_sessions") || "[]");
  
  // Remove any existing session for this tab
  allSessions = allSessions.filter(s => s.tab_id !== tabId);
  
  // Add new session
  allSessions.push({
    tab_id: tabId,
    user_id: userData.user_id,
    username: userData.username,
    role: role,
    email: userData.email || "",
    login_time: new Date().toISOString()
  });
  
  localStorage.setItem("all_active_sessions", JSON.stringify(allSessions));
};

/**
 * Get current session from localStorage
 */
export const getCurrentSession = () => {
  const user_id = localStorage.getItem("current_user_id");
  const username = localStorage.getItem("current_username");
  const role = localStorage.getItem("current_role");
  const email = localStorage.getItem("current_email");
  const token = localStorage.getItem("auth_token");
  
  if (!user_id) return null;
  
  return { user_id, username, role, email, token };
};

/**
 * Check if user is logged in (checks localStorage)
 */
export const isLoggedIn = () => {
  return localStorage.getItem("current_user_id") !== null &&
         localStorage.getItem("auth_token") !== null;
};

/**
 * Get all active sessions across all tabs
 */
export const getAllActiveSessions = () => {
  return JSON.parse(localStorage.getItem("all_active_sessions") || "[]");
};

/**
 * Logout current tab — clears all auth data from localStorage
 */
export const logoutCurrentTab = () => {
  const tabId = sessionStorage.getItem("tab_id");
  
  // Clear auth data from localStorage
  localStorage.removeItem("current_user_id");
  localStorage.removeItem("current_username");
  localStorage.removeItem("current_role");
  localStorage.removeItem("current_email");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
  
  // Also clear sessionStorage (backward compat cleanup)
  sessionStorage.removeItem("current_user_id");
  sessionStorage.removeItem("current_username");
  sessionStorage.removeItem("current_role");
  sessionStorage.removeItem("current_email");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("refresh_token");
  
  // Remove from all_active_sessions
  let allSessions = JSON.parse(localStorage.getItem("all_active_sessions") || "[]");
  allSessions = allSessions.filter(s => s.tab_id !== tabId);
  localStorage.setItem("all_active_sessions", JSON.stringify(allSessions));
};

/**
 * Save Remember Me (email only, never password)
 */
export const saveRememberMe = (identifier, _password, role, userId) => {
  const rememberKey = `remember_${role}_${userId}`;
  const rememberData = {
    email: identifier,
    userId: userId,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem(rememberKey, JSON.stringify(rememberData));
  
  let rememberedAccounts = JSON.parse(
    localStorage.getItem(`remembered_${role}_accounts`) || "[]"
  );
  
  rememberedAccounts = rememberedAccounts.filter(acc => acc.userId !== userId);
  
  rememberedAccounts.push({
    userId: userId,
    email: identifier,
    savedAt: new Date().toISOString()
  });
  
  localStorage.setItem(
    `remembered_${role}_accounts`, 
    JSON.stringify(rememberedAccounts)
  );
};

/**
 * Get all remembered accounts for a role
 */
export const getAllRememberedAccounts = (role) => {
  return JSON.parse(
    localStorage.getItem(`remembered_${role}_accounts`) || "[]"
  );
};

/**
 * Get specific user's Remember Me data
 */
export const getRememberMe = (role) => {
  const rememberedAccounts = getAllRememberedAccounts(role);
  if (!rememberedAccounts.length) return null;

  rememberedAccounts.sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  const { userId } = rememberedAccounts[0];
  if (!userId) return null;

  const data = localStorage.getItem(`remember_${role}_${userId}`);
  return data ? JSON.parse(data) : null;
};


/**
 * Clear specific user's Remember Me credentials
 */
export const clearRememberMe = (role, userId = null) => {
  if (userId) {
    const rememberKey = `remember_${role}_${userId}`;
    localStorage.removeItem(rememberKey);
    
    let rememberedAccounts = getAllRememberedAccounts(role);
    rememberedAccounts = rememberedAccounts.filter(acc => acc.userId !== userId);
    localStorage.setItem(
      `remembered_${role}_accounts`, 
      JSON.stringify(rememberedAccounts)
    );
  } else {
    const rememberedAccounts = getAllRememberedAccounts(role);
    rememberedAccounts.forEach(acc => {
      localStorage.removeItem(`remember_${role}_${acc.userId}`);
    });
    localStorage.removeItem(`remembered_${role}_accounts`);
  }
};

/**
 * Save Google Remember Me
 */
export const saveGoogleRememberMe = (email, name, role, userId) => {
  const rememberKey = `remember_google_${role}_${userId}`;
  const rememberData = {
    email: email,
    name: name,
    userId: userId,
    isGoogle: true,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem(rememberKey, JSON.stringify(rememberData));
  
  let rememberedAccounts = getAllRememberedAccounts(role);
  rememberedAccounts = rememberedAccounts.filter(acc => acc.userId !== userId);
  rememberedAccounts.push({
    userId: userId,
    email: email,
    isGoogle: true,
    savedAt: new Date().toISOString()
  });
  
  localStorage.setItem(
    `remembered_${role}_accounts`, 
    JSON.stringify(rememberedAccounts)
  );
};

/**
 * Cleanup expired sessions (call on app init)
 */
export const cleanupExpiredSessions = () => {
  let allSessions = JSON.parse(localStorage.getItem("all_active_sessions") || "[]");
  
  const now = new Date().getTime();
  allSessions = allSessions.filter(session => {
    const loginTime = new Date(session.login_time).getTime();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    return hoursDiff < 24;
  });
  
  localStorage.setItem("all_active_sessions", JSON.stringify(allSessions));
  
  ['admin', 'employee'].forEach(role => {
    let rememberedAccounts = getAllRememberedAccounts(role);
    rememberedAccounts = rememberedAccounts.filter(acc => {
      const savedTime = new Date(acc.savedAt).getTime();
      const daysDiff = (now - savedTime) / (1000 * 60 * 60 * 24);
      return daysDiff < 30;
    });
    localStorage.setItem(
      `remembered_${role}_accounts`, 
      JSON.stringify(rememberedAccounts)
    );
  });
};