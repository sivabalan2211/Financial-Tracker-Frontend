const API_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Something went wrong",
    }));

    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  getDashboard: () => request("/dashboard"),

  getAccounts: () => request("/accounts"),

  createAccount: (data) =>
    request("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTransactions: (params = "") => request(`/transactions${params}`),

  createTransaction: (data) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, {
      method: "DELETE",
    }),

  getCategories: (type) =>
    request(type ? `/categories?type=${type}` : "/categories"),

  createCategory: (data) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: "DELETE",
    }),

  getTransfers: () => request("/transfers"),

  createTransfer: (data) =>
    request("/transfers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  downloadStatement: async (accountId, startDate, endDate) => {
    const response = await fetch(
      `${API_URL}/statements/account/${accountId}/pdf?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Unable to generate statement",
      }));

      throw new Error(error.detail || "Unable to generate statement");
    }

    return response.blob();
  },

  getReportSummary: (startDate, endDate, accountId = null) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    if (accountId) {
      params.set("account_id", accountId);
    }

    return request(`/reports/summary?${params.toString()}`);
  },

  getMonthlyReport: (startDate, endDate, accountId = null) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    if (accountId) {
      params.set("account_id", accountId);
    }

    return request(`/reports/monthly?${params.toString()}`);
  },

  getCategoryReport: (
    startDate,
    endDate,
    type = "expense",
    accountId = null
  ) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      type,
    });

    if (accountId) {
      params.set("account_id", accountId);
    }

    return request(`/reports/categories?${params.toString()}`);
  },

  getAccountReport: () => request("/reports/accounts"),
};
