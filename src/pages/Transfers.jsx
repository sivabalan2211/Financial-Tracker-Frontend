import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";

import { api } from "../services/api";

const initialForm = {
  from_account_id: "",
  to_account_id: "",
  amount: "",
  transfer_date: new Date().toISOString().split("T")[0],
  description: "",
  reference: "",
};

export default function Transfers() {
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accountData, transferData] = await Promise.all([
        api.getAccounts(),
        api.getTransfers(),
      ]);

      setAccounts(accountData);
      setTransfers(transferData);

      if (accountData.length >= 2) {
        setForm((current) => ({
          ...current,
          from_account_id: current.from_account_id || accountData[0].id,
          to_account_id: current.to_account_id || accountData[1].id,
        }));
      }
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

    if (form.from_account_id === form.to_account_id) {
      setError("Source and destination accounts must be different.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("Transfer amount must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.createTransfer({
        from_account_id: Number(form.from_account_id),
        to_account_id: Number(form.to_account_id),
        amount: Number(form.amount),
        transfer_date: form.transfer_date,
        description: form.description || null,
        reference: form.reference || null,
      });

      setForm(initialForm);
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
            <h1 className="text-3xl font-bold">Transfers</h1>

            <p className="mt-1 text-slate-500">
              Move money between your accounts.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-white"
          >
            <Plus size={18} />
            New Transfer
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-xl border bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold">New Transfer</h2>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  From Account
                </label>

                <select
                  name="from_account_id"
                  value={form.from_account_id}
                  onChange={updateField}
                  className="w-full rounded-lg border px-3 py-2.5"
                  required
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
                  To Account
                </label>

                <select
                  name="to_account_id"
                  value={form.to_account_id}
                  onChange={updateField}
                  className="w-full rounded-lg border px-3 py-2.5"
                  required
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
                <label className="mb-1 block text-sm font-medium">Amount</label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>

                <input
                  type="date"
                  name="transfer_date"
                  value={form.transfer_date}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <input
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Monthly savings transfer"
                  className="w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={saving}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Transfer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold">Transfer History</h2>
          </div>

          {transfers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No transfers yet.
            </div>
          ) : (
            <div className="divide-y">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                      <ArrowRight size={18} />
                    </div>

                    <div>
                      <p className="font-medium">
                        {accountMap[transfer.from_account_id]} →{" "}
                        {accountMap[transfer.to_account_id]}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {transfer.transfer_date}
                        {transfer.description
                          ? ` · ${transfer.description}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    ₹{Number(transfer.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
