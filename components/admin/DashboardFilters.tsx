// components/admin/DashboardFilters.tsx
"use client";

type DashboardFiltersProps = {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  destinationFilter: string;
  setDestinationFilter: (destination: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  uniqueDestinations: string[];
};

export default function DashboardFilters({
  statusFilter,
  setStatusFilter,
  destinationFilter,
  setDestinationFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  uniqueDestinations,
}: DashboardFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="grid md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">🆕 New</option>
            <option value="contacted">📞 Contacted</option>
            <option value="quoted">💰 Quoted</option>
            <option value="closed">✅ Closed</option>
            <option value="archived">📁 Archived</option>
          </select>
        </div>

        {/* Destination Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Destinations</option>
            {uniqueDestinations.map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">⏰ Oldest First</option>
            <option value="name">👤 Name A-Z</option>
            <option value="destination">🌍 Destination A-Z</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter("new");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            🆕 New Leads
          </button>
          <button
            onClick={() => {
              setStatusFilter("all");
              setDestinationFilter("all");
              setSearchQuery("");
              setSortBy("newest");
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            🔄 Clear All
          </button>
          <button
            onClick={() => {
              setStatusFilter("closed");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
          >
            ✅ Closed Deals
          </button>
          <button
            onClick={() => {
              setStatusFilter("archived");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            📁 Archived
          </button>
          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchQuery("");
              // Filter trips with activities will be handled by parent component
            }}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            🎯 With Activities
          </button>
        </div>
      </div>
    </div>
  );
}