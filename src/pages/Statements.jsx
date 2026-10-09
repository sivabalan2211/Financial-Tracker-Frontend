import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { api } from "../services/api";

function getDefaultStartDate() {
  const date = new Date();

  date.setDate(1);

  return date.toISOString().split("T")[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split("T")[0];
}

export default function Statements() {
  const [accounts, setAccounts] = useState([]);

  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const data = await api.getAccounts();

      setAccounts(data);

      if (data.length > 0) {
        setAccountId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function downloadStatement() {
    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const blob = await api.downloadStatement(accountId, startDate, endDate);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `financial_statement_${startDate}_${endDate}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Statements</h1>

          <p className="mt-1 text-slate-500">
            Generate PDF statements for your accounts.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Account Statement
              </h2>

              <p className="text-sm text-slate-500">
                Select an account and reporting period.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Account</label>

              <select
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
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
              <label className="mb-1 block text-sm font-medium">From</label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To</label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={downloadStatement}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Download size={18} />

              {loading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
          <p className="font-medium">Statement includes</p>

          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Opening balance</li>
            <li>Income and expenses</li>
            <li>Transfers</li>
            <li>Transaction history</li>
            <li>Closing balance</li>
            <li>Statement period and account details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
