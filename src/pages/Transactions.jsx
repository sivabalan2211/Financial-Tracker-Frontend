import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";

import { api } from "../services/api";

const initialForm = {
  account_id: "",
  category_id: "",
  type: "expense",
  amount: "",
  transaction_date: new Date().toISOString().split("T")[0],
  description: "",
  reference: "",
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [form.type]);

  async function loadData() {
    try {
      setLoading(true);

      const [transactionData, accountData] = await Promise.all([
        api.getTransactions(),
        api.getAccounts(),
      ]);

      setTransactions(transactionData);
      setAccounts(accountData);

      if (accountData.length > 0) {
        setForm((current) => ({
          ...current,
          account_id: current.account_id || accountData[0].id,
        }));
      }

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await api.getCategories(form.type);
      setCategories(data);
    } catch (err) {
      setError(err.message);
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

    if (!form.account_id) {
      setError("Please select an account.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.createTransaction({
        account_id: Number(form.account_id),
        category_id: form.category_id ? Number(form.category_id) : null,
        type: form.type,
        amount: Number(form.amount),
        transaction_date: form.transaction_date,
        description: form.description || null,
        reference: form.reference || null,
      });

      setForm({
        ...initialForm,
        account_id: form.account_id,
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id) {
    const confirmed = window.confirm("Delete this transaction?");

    if (!confirmed) return;

    try {
      await api.deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const accountMap = Object.fromEntries(
    accounts.map((account) => [account.id, account.name])
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>

            <p className="mt-1 text-slate-500">
              Track every income and expense.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-white"
          >
            <Plus size={18} />
            Add Transaction
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
              <h2 className="text-lg font-semibold">Add Transaction</h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>

                <select
                  name="type"
                  value={form.type}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  <option value="expense">Expense</option>

                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Account
                </label>

                <select
                  name="account_id"
                  value={form.account_id}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  <option value="">Select account</option>

                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Amount</label>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={updateField}
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>

                <input
                  type="date"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Reference
                </label>

                <input
                  name="reference"
                  value={form.reference}
                  onChange={updateField}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={3}
                  placeholder="What was this transaction for?"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Transaction History</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.type === "income"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUp size={18} />
                      ) : (
                        <ArrowDown size={18} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {transaction.description || "Transaction"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {accountMap[transaction.account_id] ||
                          "Unknown account"}{" "}
                        · {transaction.transaction_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`whitespace-nowrap font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatMoney(transaction.amount)}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete transaction"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
