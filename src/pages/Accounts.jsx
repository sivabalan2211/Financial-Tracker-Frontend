import { useEffect, useState } from "react";
import { Plus, Wallet, X } from "lucide-react";

import { api } from "../services/api";

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Cash" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

const initialForm = {
  name: "",
  account_type: "bank",
  account_class: "asset",
  opening_balance: "0",
  currency: "INR",
};

function formatMoney(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Account name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.createAccount({
        ...form,
        name: form.name.trim(),
        opening_balance: Number(form.opening_balance || 0),
      });

      setForm(initialForm);
      setShowForm(false);

      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Accounts</h1>

            <p className="mt-1 text-slate-500">
              Manage your bank, cash, savings and liability accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Account</h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Account Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="HDFC Bank"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Account Type
                </label>

                <select
                  name="account_type"
                  value={form.account_type}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Account Class
                </label>

                <select
                  name="account_class"
                  value={form.account_class}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  <option value="asset">Asset — money you own</option>

                  <option value="liability">Liability — money you owe</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Opening Balance
                </label>

                <input
                  type="number"
                  step="0.01"
                  name="opening_balance"
                  value={form.opening_balance}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Currency
                </label>

                <input
                  name="currency"
                  value={form.currency}
                  onChange={updateField}
                  maxLength={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 uppercase"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500">
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Wallet className="mx-auto text-slate-400" size={40} />

            <h3 className="mt-4 font-semibold">No accounts yet</h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first bank, cash or savings account.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {account.name}
                    </h3>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {account.account_type.replace("_", " ")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      account.account_class === "asset"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {account.account_class}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-slate-500">Opening Balance</p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(account.opening_balance, account.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
