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
    <div className="bg-zinc-950 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] backdrop-blur-md p-6 mb-8">
      <div className="grid md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-zinc-500"></div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Destination Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Destination</label>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
          >
            <option value="all">All Destinations</option>
            {uniqueDestinations.map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-zinc-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="destination">Destination A-Z</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm font-medium text-zinc-300 mb-3">Quick Filters:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter("new");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            New Leads
          </button>
          <button
            onClick={() => {
              setStatusFilter("all");
              setDestinationFilter("all");
              setSearchQuery("");
              setSortBy("newest");
            }}
            className="px-3 py-1 bg-white/10 text-zinc-300 border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              setStatusFilter("closed");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/20 rounded-full text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            Closed Deals
          </button>
          <button
            onClick={() => {
              setStatusFilter("archived");
              setSearchQuery("");
            }}
            className="px-3 py-1 bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 rounded-full text-sm font-medium hover:bg-zinc-500/20 transition-colors"
          >
            Archived
          </button>
          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchQuery("");
              // Filter trips with activities will be handled by parent component
            }}
            className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            With Activities
          </button>
        </div>
      </div>
    </div>
  );
}