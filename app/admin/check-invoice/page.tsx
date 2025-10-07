"use client";

import { useState, useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { CheckCircle2, Search, AlertCircle, ExternalLink } from "lucide-react";

type Invoice = {
  id: string;
  receipt: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount_in_paise: number;
  currency: string;
  provider: string;
  provider_invoice_id: string | null;
  provider_short_url: string | null;
  status: string;
  notes: any;
  created_at: string;
  updated_at: string;
};

export default function CheckInvoicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAll, setIsFetchingAll] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all invoices on mount
  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    setIsFetchingAll(true);
    try {
      const response = await fetch("/api/invoices");
      const data = await response.json();
      if (response.ok) {
        setAllInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsFetchingAll(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setInvoice(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setInvoice(null);

    try {
      const response = await fetch(
        `/api/invoices/${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();

      if (response.ok) {
        setInvoice(data.invoice);
      } else {
        setError(data.error || "Invoice not found");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setInvoice(inv);
    setSearchQuery(inv.receipt);
    setError(null);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "draft":
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
      case "issued":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "expired":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "cancelled":
        return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "partially_paid":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      default:
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Check Invoice</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Search by invoice ID or receipt number to view payment status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter invoice ID or receipt number (e.g., LW-2025-0042)"
                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Invoice Details */}
        {invoice && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {invoice.receipt}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Invoice ID: {invoice.id}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1).replace("_", " ")}
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatAmount(invoice.amount_in_paise, invoice.currency)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Customer Information
                  </h3>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Name</p>
                    <p className="text-sm text-white">
                      {invoice.customer_name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Email</p>
                    <p className="text-sm text-white">
                      {invoice.customer_email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Phone</p>
                    <p className="text-sm text-white">
                      {invoice.customer_phone || "—"}
                    </p>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Invoice Details
                  </h3>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Provider</p>
                    <p className="text-sm text-white capitalize">
                      {invoice.provider}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Provider Invoice ID</p>
                    <p className="text-sm text-white font-mono">
                      {invoice.provider_invoice_id || "—"}
                    </p>
                  </div>
                  {invoice.provider_short_url && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Payment Link</p>
                      <a
                        href={invoice.provider_short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 underline break-all inline-flex items-center gap-1 group"
                      >
                        <span className="truncate">{invoice.provider_short_url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Created</p>
                    <p className="text-sm text-white">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Last Updated</p>
                    <p className="text-sm text-white">
                      {formatDate(invoice.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Notes
                  </h3>
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                      {typeof invoice.notes === 'string' 
                        ? invoice.notes 
                        : invoice.notes?.note || JSON.stringify(invoice.notes, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setInvoice(null);
                    setSearchQuery("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg text-sm font-medium transition-all"
                >
                  ← Back to All Invoices
                </button>
                {invoice.provider_short_url && (
                  <a
                    href={invoice.provider_short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Payment Link
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Invoices List */}
        {!invoice && !error && !isLoading && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                All Invoices ({allInvoices.length})
              </h3>
              <button
                onClick={fetchAllInvoices}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Refresh
              </button>
            </div>

            {isFetchingAll ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">Loading invoices...</p>
              </div>
            ) : allInvoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-200 mb-2">
                  No Invoices Yet
                </h3>
                <p className="text-zinc-500 text-sm">
                  Create your first invoice to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {allInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelectInvoice(inv)}
                    className="w-full text-left p-4 rounded-lg bg-zinc-800 border border-white/10 hover:bg-zinc-800/80 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-white font-mono">
                            {inv.receipt}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              inv.status
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate">
                          {inv.customer_name || "No customer name"} •{" "}
                          {formatDate(inv.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatAmount(inv.amount_in_paise, inv.currency)}
                        </p>
                        <p className="text-xs text-zinc-500">{inv.currency}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
