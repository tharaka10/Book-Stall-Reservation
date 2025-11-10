import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  Plus,
  X,
  ChevronDown,
  CheckSquare,
  XSquare,
  Wrench,
} from "lucide-react";
//import API from "../services/api"; // For when you're ready to connect

// --- Type Definitions ---
type StallStatus = "Available" | "Reserved" | "Maintenance";
type StallSize = "Small" | "Medium" | "Large";

interface Stall {
  id: string;
  name: string;
  size: StallSize;
  status: StallStatus;
  publisherName?: string; // Optional: Who reserved it
}

// --- Mock Data (for development) ---
const mockStalls: Stall[] = [
  {
    id: "stall-001",
    name: "A-01",
    size: "Medium",
    status: "Reserved",
    publisherName: "Book Co. Lanka",
  },
  {
    id: "stall-002",
    name: "A-02",
    size: "Medium",
    status: "Available",
  },
  {
    id: "stall-003",
    name: "A-03",
    size: "Small",
    status: "Maintenance",
  },
  {
    id: "stall-004",
    name: "B-01",
    size: "Large",
    status: "Available",
  },
  {
    id: "stall-005",
    name: "B-02",
    size: "Large",
    status: "Reserved",
    publisherName: "Readers Ltd.",
  },
  {
    id: "stall-006",
    name: "C-01",
    size: "Small",
    status: "Available",
  },
  {
    id: "stall-007",
    name: "C-02",
    size: "Small",
    status: "Reserved",
    publisherName: "Pages Inc.",
  },
];
// --- End Mock Data ---

// -------------------------------------
// --- Main Stalls Page Component ---
// -------------------------------------
export default function StallsPage() {
  // --- State ---
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchStalls = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- DEVELOPMENT: Using Mock Data ---
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setStalls(mockStalls);
        // --- END DEVELOPMENT ---

        /* --- PRODUCTION: Real API Call (uncomment when ready) ---
        const response = await API.get("/stalls");
        setStalls(response.data);
        */
      } catch (err) {
        console.error("Failed to fetch stalls:", err);
        setError("Failed to fetch stalls.");
      } finally {
        setLoading(false);
      }
    };

    fetchStalls();
  }, []); // Runs once on component mount

  // --- Filtering ---
  const filteredStalls = useMemo(() => {
    return stalls
      .filter((stall) => statusFilter === "All" || stall.status === statusFilter)
      .filter((stall) => sizeFilter === "All" || stall.size === sizeFilter);
  }, [stalls, statusFilter, sizeFilter]);

  // --- Event Handlers ---
  const handleOpenAddModal = () => {
    setEditingStall(null); // Clear any editing stall
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stall: Stall) => {
    setEditingStall(stall);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStall(null);
  };

  // --- DEV MODE: Save Stall (Add or Edit) ---
  const handleSaveStall = (savedStall: Stall) => {
    if (editingStall) {
      // Edit existing stall
      setStalls((prev) =>
        prev.map((s) => (s.id === savedStall.id ? savedStall : s))
      );
      console.log("--- DEV MODE: Edited stall ---", savedStall);
    } else {
      // Add new stall
      const newStall = { ...savedStall, id: `stall-${Date.now()}` }; // Create a temp ID
      setStalls((prev) => [newStall, ...prev]);
      console.log("--- DEV MODE: Added new stall ---", newStall);
    }
    handleCloseModal();
  };

  // --- Render ---
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Stalls</h1>

      {/* --- Controls: Filters and Add Button --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {/* Status Filter */}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Available", label: "Available" },
              { value: "Reserved", label: "Reserved" },
              { value: "Maintenance", label: "Maintenance" },
            ]}
          />
          {/* Size Filter */}
          <FilterDropdown
            label="Size"
            value={sizeFilter}
            onChange={setSizeFilter}
            options={[
              { value: "All", label: "All Sizes" },
              { value: "Small", label: "Small" },
              { value: "Medium", label: "Medium" },
              { value: "Large", label: "Large" },
            ]}
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add New Stall
        </button>
      </div>

      {/* --- Stalls Grid --- */}
      {loading ? (
        <p className="text-center py-10">Loading stalls...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : filteredStalls.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No stalls found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStalls.map((stall) => (
            <StallCard
              key={stall.id}
              stall={stall}
              onManageClick={() => handleOpenEditModal(stall)}
            />
          ))}
        </div>
      )}

      {/* --- Add/Edit Modal --- */}
      {isModalOpen && (
        <ManageStallModal
          stall={editingStall}
          onClose={handleCloseModal}
          onSave={handleSaveStall}
        />
      )}
    </div>
  );
}

// -------------------------------------
// --- Filter Dropdown Component ---
// -------------------------------------
function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={`filter-${label}`}
        className="appearance-none w-48 bg-white border rounded-lg shadow-sm px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
}

// -------------------------------------
// --- Stall Card Component ---
// -------------------------------------
function StallCard({
  stall,
  onManageClick,
}: {
  stall: Stall;
  onManageClick: () => void;
}) {
  const statusInfo = {
    Available: {
      Icon: CheckSquare,
      color: "text-green-600",
      borderColor: "border-green-200",
      bgColor: "bg-green-50",
    },
    Reserved: {
      Icon: XSquare,
      color: "text-red-600",
      borderColor: "border-red-200",
      bgColor: "bg-red-50",
    },
    Maintenance: {
      Icon: Wrench,
      color: "text-yellow-600",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-50",
    },
  }[stall.status];

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} flex flex-col justify-between`}
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{stall.name}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color} border border-current`}
          >
            {stall.size}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <statusInfo.Icon className={`w-5 h-5 ${statusInfo.color}`} />
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {stall.status}
          </span>
        </div>
        {stall.status === "Reserved" && stall.publisherName && (
          <p className="text-sm text-gray-600 mt-2 truncate">
            Booked by: <span className="font-medium">{stall.publisherName}</span>
          </p>
        )}
      </div>
      <div className="px-5 py-3 bg-white border-t">
        <button
          onClick={onManageClick}
          className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Manage Stall
        </button>
      </div>
    </div>
  );
}

// -------------------------------------
// --- Manage Stall Modal Component ---
// -------------------------------------
function ManageStallModal({
  stall,
  onClose,
  onSave,
}: {
  stall: Stall | null;
  onClose: () => void;
  onSave: (stall: Stall) => void;
}) {
  const [name, setName] = useState(stall?.name || "");
  const [size, setSize] = useState<StallSize>(stall?.size || "Medium");
  const [status, setStatus] = useState<StallStatus>(stall?.status || "Available");
  const [publisherName, setPublisherName] = useState(stall?.publisherName || "");

  const isNew = stall === null;
  const title = isNew ? "Add New Stall" : "Manage Stall";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      id: stall?.id || "", // ID will be handled by onSave
      name,
      size,
      status,
      publisherName: status === "Reserved" ? publisherName : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Stall Name */}
            <div>
              <label
                htmlFor="stall-name"
                className="block text-sm font-medium text-gray-700"
              >
                Stall Name
              </label>
              <input
                type="text"
                id="stall-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {/* Stall Size */}
            <div>
              <label
                htmlFor="stall-size"
                className="block text-sm font-medium text-gray-700"
              >
                Size
              </label>
              <select
                id="stall-size"
                value={size}
                onChange={(e) => setSize(e.target.value as StallSize)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            {/* Stall Status */}
            <div>
              <label
                htmlFor="stall-status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="stall-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StallStatus)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            {/* Publisher Name (Conditional) */}
            {status === "Reserved" && (
              <div>
                <label
                  htmlFor="publisher-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Publisher Name (if Reserved)
                </label>
                <input
                  type="text"
                  id="publisher-name"
                  value={publisherName}
                  onChange={(e) => setPublisherName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Book Co. Lanka"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}