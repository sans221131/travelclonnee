"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { FileText, Check, AlertCircle, ExternalLink } from "lucide-react";

const currencies = ["INR", "USD", "EUR", "GBP", "AED", "CHF"];
const providers = ["razorpay"];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    amount_in_paise: "",
    currency: "INR",
    provider: "razorpay",
    provider_short_url: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<{
    id: string;
    receipt: string;
    provider_short_url: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setCreatedInvoice(null);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount_in_paise: parseInt(formData.amount_in_paise),
          notes: formData.notes ? { note: formData.notes } : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Invoice ${data.invoice.receipt} created successfully! Redirecting...`,
        });
        setCreatedInvoice(data.invoice);

        // Redirect to check invoice page after 1.5 seconds
        setTimeout(() => {
          router.push("/admin/check-invoice");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to create invoice",
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      amount_in_paise: "",
      currency: "INR",
      provider: "razorpay",
      provider_short_url: "",
      notes: "",
    });
    setMessage(null);
    setCreatedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Generate a new invoice and get a payment link
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Created Invoice Info */}
        {createdInvoice && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              Invoice Created Successfully!
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Invoice ID</p>
                <p className="text-sm font-mono text-white">
                  {createdInvoice.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Receipt Number</p>
                <p className="text-sm font-mono text-emerald-400">
                  {createdInvoice.receipt}
                </p>
              </div>
            </div>
            {createdInvoice.provider_short_url ? (
              <a
                href={createdInvoice.provider_short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open Payment Link
              </a>
            ) : (
              <a
                href={`/?ref=${createdInvoice.receipt}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on Main Page
              </a>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Customer Details
            </h2>

            {/* Customer Name */}
            <div className="mb-6">
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Customer Name *
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Customer Email */}
            <div className="mb-6">
              <label
                htmlFor="customer_email"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Customer Email
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Customer Phone */}
            <div className="mb-6">
              <label
                htmlFor="customer_phone"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Customer Phone
              </label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Invoice Details
            </h2>

            {/* Amount */}
            <div className="mb-6">
              <label
                htmlFor="amount_in_paise"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Amount *
              </label>
              <input
                type="number"
                id="amount_in_paise"
                name="amount_in_paise"
                required
                min="1"
                value={formData.amount_in_paise}
                onChange={handleChange}
                placeholder="Enter amount (e.g., 1000 for ₹1000 or $1000)"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Enter the exact amount as it should appear on the invoice
              </p>
            </div>

            {/* Currency and Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-zinc-200 mb-2"
                >
                  Currency *
                </label>
                <select
                  id="currency"
                  name="currency"
                  required
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="provider"
                  className="block text-sm font-medium text-zinc-200 mb-2"
                >
                  Payment Provider *
                </label>
                <select
                  id="provider"
                  name="provider"
                  required
                  value={formData.provider}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {providers.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov.charAt(0).toUpperCase() + prov.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Razorpay Payment Link */}
            <div className="mb-6">
              <label
                htmlFor="provider_short_url"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Razorpay Payment Link *
              </label>
              <input
                type="url"
                id="provider_short_url"
                name="provider_short_url"
                required
                value={formData.provider_short_url}
                onChange={handleChange}
                placeholder="https://razorpay.com/payment-link/..."
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Paste the complete Razorpay payment link for this invoice
              </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this invoice..."
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Create Invoice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
