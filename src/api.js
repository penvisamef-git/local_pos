// Talks to the local POS server (local_pos_api) on this computer.
// In production the server also serves this screen, so the same origin works; in development use REACT_APP_API_HOST.
const HOST = process.env.REACT_APP_API_HOST || (window.location.port === "3001" ? "http://localhost:8087" : "");
export const BASE = `${HOST}/api/pos`;
const TOKEN_KEY = "pos_token";
const USER_KEY = "pos_user";

export const session = {
  token: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  },
  user: () => {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  save: (token, user) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // storage blocked → this tab only
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};

let onLoggedOut = () => {};
export const setLoggedOutHandler = (fn) => {
  onLoggedOut = fn;
};

async function call(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(session.token() ? { "x-pos-token": session.token() } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const e = new Error("មិនអាចភ្ជាប់ម៉ាស៊ីន POS (local_pos_api) / The POS server is not running");
    e.server = true;
    throw e;
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/login") {
    session.clear();
    onLoggedOut();
  }
  if (!res.ok || json.success === false) {
    const e = new Error(json.message || `Error ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return json.data;
}

export const api = {
  status: () => call("GET", "/status"),
  pair: (code) => call("POST", "/pair", { code }),
  unpair: () => call("POST", "/unpair"),
  sync: () => call("POST", "/sync"),
  users: () => call("GET", "/users"),
  login: (user_id, pin) => call("POST", "/login", { user_id, pin }),
  approve: (user_id, pin) => call("POST", "/approve", { user_id, pin }),
  logout: () => call("POST", "/logout"),
  catalog: () => call("GET", "/catalog"),
  shift: () => call("GET", "/shift/current"),
  openShift: (d) => call("POST", "/shift/open", d),
  closeShift: (d) => call("POST", "/shift/close", d),
  sell: (d) => call("POST", "/sale", d),
  holds: () => call("GET", "/hold"),
  hold: (d) => call("POST", "/hold", d),
  unhold: (id) => call("DELETE", `/hold/${id}`), // resume (take it back) or delete
  sales: (params = {}) => call("GET", `/sale?${new URLSearchParams(params)}`),
  report: (params = {}) => call("GET", `/report?${new URLSearchParams(params)}`),
  display: (mode, data) => call("PUT", "/display", { mode, data }),
  retrySale: (id) => call("POST", `/sale/${encodeURIComponent(id)}/retry`),
  discardSale: (id, d) => call("POST", `/sale/${encodeURIComponent(id)}/discard`, d),
  refundSale: (id, d) => call("POST", `/sale/${encodeURIComponent(id)}/refund`, d),
  receipt: (id) => call("GET", `/receipt/${encodeURIComponent(id)}`),
};
