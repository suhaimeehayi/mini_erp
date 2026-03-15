import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/apiHelpers";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const INITIAL_STATS = {
  users: 0,
  products: 0,
  inventory: 0,
  customers: 0,
  suppliers: 0,
  purchases: 0,
  sales: 0,
  lowStock: 0,
};

function Dashboard() {
  const { permissions, loading: authLoading, isAdmin } = useAuth();
  const metricConfigs = useMemo(() => ([
    {
      key: "users",
      label: "Users",
      path: "/accounts/users/",
      permission: "view_users",
      cardClassName: "bg-slate-50",
      headingClassName: "text-slate-600",
      valueClassName: "text-3xl font-bold text-slate-800",
    },
    {
      key: "products",
      label: "Products",
      path: "/products/",
      permission: "view_products",
      cardClassName: "bg-blue-50",
      headingClassName: "text-blue-600",
      valueClassName: "text-3xl font-bold text-blue-800",
    },
    {
      key: "inventory",
      label: "Inventory",
      path: "/inventory/",
      permission: "view_inventory",
      cardClassName: "bg-cyan-50",
      headingClassName: "text-cyan-600",
      valueClassName: "text-3xl font-bold text-cyan-800",
    },
    {
      key: "customers",
      label: "Customers",
      path: "/customers/",
      permission: "view_customers",
      cardClassName: "bg-green-50",
      headingClassName: "text-green-600",
      valueClassName: "text-3xl font-bold text-green-800",
    },
    {
      key: "suppliers",
      label: "Suppliers",
      path: "/suppliers/",
      permission: "view_suppliers",
      cardClassName: "bg-yellow-50",
      headingClassName: "text-yellow-600",
      valueClassName: "text-3xl font-bold text-yellow-800",
    },
    {
      key: "purchases",
      label: "Purchases",
      path: "/purchase-orders/",
      permission: "view_purchase_orders",
      cardClassName: "bg-orange-50",
      headingClassName: "text-orange-600",
      valueClassName: "text-3xl font-bold text-orange-800",
    },
    {
      key: "sales",
      label: "Sales",
      path: "/sales-orders/",
      permission: "view_sales_orders",
      cardClassName: "bg-indigo-50",
      headingClassName: "text-indigo-600",
      valueClassName: "text-3xl font-bold text-indigo-800",
    },
    {
      key: "lowStock",
      label: "Low Stock",
      path: "/inventory/low_stock/",
      permission: "view_inventory",
      cardClassName: "bg-red-50",
      headingClassName: "text-red-600",
      valueClassName: "text-3xl font-bold text-red-800",
    },
  ]), []);

  const isAdminAccount = isAdmin();
  const visibleMetricConfigs = useMemo(() => {
    return metricConfigs.filter((metric) => {
      if (metric.key === "users") {
        return isAdminAccount && permissions.includes(metric.permission);
      }

      return isAdminAccount || permissions.includes(metric.permission);
    });
  }, [isAdminAccount, metricConfigs, permissions]);

  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const chartData = useMemo(() => {
    return visibleMetricConfigs.map((metric) => ({
      name: metric.label,
      total: stats[metric.key],
    }));
  }, [stats, visibleMetricConfigs]);

  const hasVisibleMetrics = visibleMetricConfigs.length > 0;

  const hasChartData = useMemo(() => {
    return chartData.some((item) => item.total > 0);
  }, [chartData]);

  const renderMetricValue = (value, className) => {
    if (!loading && value === 0) {
      return <p className="text-base font-medium text-gray-500">ไม่มีข้อมูล</p>;
    }

    return <p className={className}>{value}</p>;
  };

  const renderChartContent = (renderChart) => {
    if (!hasChartData) {
      return (
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
          ไม่มีข้อมูล
        </div>
      );
    }

    return <ResponsiveContainer width="100%" height={300}>{renderChart()}</ResponsiveContainer>;
  };

  const getCountFromResponse = (result) => {
    if (result.status !== "fulfilled") {
      return 0;
    }

    const data = result.value?.data;
    if (Array.isArray(data)) {
      return data.length;
    }

    return typeof data?.count === "number" ? data.count : 0;
  };

  const fetchStats = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!hasVisibleMetrics) {
      setStats(INITIAL_STATS);
      setErrorMessage("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const results = await Promise.allSettled(
      visibleMetricConfigs.map((metric) => api.get(metric.path)),
    );

    const nextStats = visibleMetricConfigs.reduce((accumulator, metric, index) => {
      accumulator[metric.key] = getCountFromResponse(results[index]);
      return accumulator;
    }, { ...INITIAL_STATS });

    setStats(nextStats);

    const failedResults = visibleMetricConfigs
      .map((metric, index) => ({
        ...metric,
        result: results[index],
      }))
      .filter((entry) => entry.result.status === "rejected");

    if (failedResults.length > 0) {
      const firstFailure = failedResults[0];
      const rawMessage = getApiErrorMessage(
        firstFailure.result.reason,
        `${firstFailure.label} data could not be loaded.`,
      );
      const safeMessage = typeof rawMessage === "string" && rawMessage.trim().startsWith("<")
        ? `${firstFailure.label} data could not be loaded because the backend returned a server error.`
        : rawMessage;

      setErrorMessage(
        failedResults.length === 1
          ? safeMessage
          : `${safeMessage} Failed metrics: ${failedResults.map((entry) => entry.label).join(", ")}.`,
      );
    }

    setLoading(false);
  }, [authLoading, hasVisibleMetrics, visibleMetricConfigs]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      fetchStats();
    }, 0);

    return () => clearTimeout(timerId);
  }, [authLoading, fetchStats]);

  const COLORS = ['#0ea5e9', '#2563eb', '#06b6d4', '#16a34a', '#ca8a04', '#ea580c', '#4f46e5', '#dc2626'];

  return (
    <div className="mt-10 bg-white p-6 shadow rounded">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">System Analytics Dashboard</h2>
        <button
          type="button"
          onClick={fetchStats}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {!authLoading && !hasVisibleMetrics && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You do not have permission to view dashboard metrics.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      {/* Stats Cards */}
      {hasVisibleMetrics && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          {visibleMetricConfigs.map((metric) => (
            <div key={metric.key} className={`${metric.cardClassName} rounded-lg p-4 shadow-sm`}>
              <h3 className={`text-lg font-semibold ${metric.headingClassName}`}>{metric.label}</h3>
              {renderMetricValue(stats[metric.key], metric.valueClassName)}
            </div>
          ))}
        </div>
      )}

      {(authLoading || loading) && hasVisibleMetrics && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading dashboard metrics...
        </div>
      )}

      {/* Charts Grid */}
      {hasVisibleMetrics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Bar Chart - Entity Counts</h3>
          {renderChartContent(() => (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          ))}
        </div>

        {/* Line Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Line Chart - Trends</h3>
          {renderChartContent(() => (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={3} />
            </LineChart>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Pie Chart - Distribution</h3>
          {renderChartContent(() => (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ))}
        </div>

        {/* Area Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Area Chart - Overview</h3>
          {renderChartContent(() => (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
