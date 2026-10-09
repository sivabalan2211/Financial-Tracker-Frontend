import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Landmark, Wallet } from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../services/api";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
];

function getMonthStart() {
  const date = new Date();

  date.setDate(1);

  return date.toISOString().split("T")[0];
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    net_cash_flow: 0,
  });

  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountReport, setAccountReport] = useState(null);

  const [startDate, setStartDate] = useState(getMonthStart());

  const [endDate, setEndDate] = useState(getToday());

  const [accountId, setAccountId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate, accountId]);

  async function loadAccounts() {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const selectedAccount = accountId ? Number(accountId) : null;

      const [summaryData, monthlyData, categoryData, accountData] =
        await Promise.all([
          api.getReportSummary(startDate, endDate, selectedAccount),
          api.getMonthlyReport(startDate, endDate, selectedAccount),
          api.getCategoryReport(startDate, endDate, "expense", selectedAccount),
          api.getAccountReport(),
        ]);

      setSummary(summaryData);
      setMonthly(monthlyData);
      setCategories(categoryData);
      setAccountReport(accountData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    return monthly.map((item) => ({
      month: item.month,
      Income: Number(item.income || 0),
      Expenses: Number(item.expenses || 0),
      "Net Cash Flow": Number(item.net_cash_flow || 0),
    }));
  }, [monthly]);

  const pieData = useMemo(() => {
    return categories.map((item) => ({
      name: item.category_name,
      value: Number(item.total || 0),
    }));
  }, [categories]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Financial Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              Overview of your financial activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option value="">All Accounts</option>

              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            />

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center text-slate-500">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Summary cards */}

            <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Income"
                value={formatMoney(summary.total_income)}
                icon={<ArrowUp size={20} />}
                color="green"
              />

              <SummaryCard
                title="Total Expenses"
                value={formatMoney(summary.total_expenses)}
                icon={<ArrowDown size={20} />}
                color="red"
              />

              <SummaryCard
                title="Net Cash Flow"
                value={formatMoney(summary.net_cash_flow)}
                icon={<Wallet size={20} />}
                color={Number(summary.net_cash_flow) >= 0 ? "blue" : "red"}
              />

              <SummaryCard
                title="Net Worth"
                value={formatMoney(accountReport?.net_worth || 0)}
                icon={<Landmark size={20} />}
                color="purple"
              />
            </div>

            {/* Charts */}

            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Income vs Expenses
                  </h2>

                  <p className="text-sm text-slate-500">
                    Monthly financial activity
                  </p>
                </div>

                <div className="h-[340px]">
                  {chartData.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip formatter={(value) => formatMoney(value)} />

                        <Legend />

                        <Bar
                          dataKey="Income"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        />

                        <Bar
                          dataKey="Expenses"
                          fill="#dc2626"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Expense categories */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Expenses by Category
                  </h2>

                  <p className="text-sm text-slate-500">
                    Where your money went
                  </p>
                </div>

                <div className="h-[340px]">
                  {pieData.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={105}
                          label
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip formatter={(value) => formatMoney(value)} />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Accounts */}

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-5">
                <h2 className="font-semibold">Account Balances</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current balance across your accounts
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {accountReport?.assets?.map((account) => (
                  <AccountRow key={account.account_id} account={account} />
                ))}

                {accountReport?.liabilities?.map((account) => (
                  <AccountRow
                    key={account.account_id}
                    account={account}
                    liability
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function AccountRow({ account, liability = false }) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2 ${
            liability ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Landmark size={18} />
        </div>

        <div>
          <p className="font-medium">{account.account_name}</p>

          <p className="text-sm capitalize text-slate-500">
            {account.account_type.replace("_", " ")}
          </p>
        </div>
      </div>

      <p
        className={`font-semibold ${
          liability ? "text-red-600" : "text-slate-900"
        }`}
      >
        {formatMoney(account.balance)}
      </p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      No data available for this period.
    </div>
  );
}
