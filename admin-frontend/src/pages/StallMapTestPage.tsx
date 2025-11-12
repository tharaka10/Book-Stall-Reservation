import { useState, useEffect, type FormEvent } from "react";
import {
  X,
  // CheckSquare, XSquare, Wrench removed as they are not used
} from "lucide-react";

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

// --- Utility Functions for Mock Data ---
// getRandomSize is removed, as size is now determined by name

const getRandomStatus = (): [StallStatus, string?] => {
  const statuses: StallStatus[] = ["Available", "Reserved", "Maintenance"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  if (status === "Reserved") {
    const publishers = ["Book Co. Lanka", "Readers Ltd.", "Kandy Books", "Pages Inc."];
    return [status, publishers[Math.floor(Math.random() * publishers.length)]];
  }
  return [status, undefined];
};

// --- NEW MOCK DATA (60 stalls) ---
const createMockStalls = (): Stall[] => {
  const stalls: Stall[] = [];
  
  // Create 15 Large stalls (A01 - A15)
  for (let i = 1; i <= 15; i++) {
    const name = `A${String(i).padStart(2, '0')}`;
    const [status, publisherName] = getRandomStatus();
    stalls.push({
      id: `s-a${i}`,
      name: name,
      size: "Large", // 'A' stalls are always Large
      status: status,
      publisherName: publisherName,
    });
  }

  // Create 20 Medium stalls (B01 - B20)
  for (let i = 1; i <= 20; i++) {
    const name = `B${String(i).padStart(2, '0')}`;
    const [status, publisherName] = getRandomStatus();
    stalls.push({
      id: `s-b${i}`,
      name: name,
      size: "Medium", // 'B' stalls are always Medium
      status: status,
      publisherName: publisherName,
    });
  }

  // Create 25 Small stalls (C01 - C25)
  for (let i = 1; i <= 25; i++) {
    const name = `C${String(i).padStart(2, '0')}`;
    const [status, publisherName] = getRandomStatus();
    stalls.push({
      id: `s-c${i}`,
      name: name,
      size: "Small", // 'C' stalls are always Small
      status: status,
      publisherName: publisherName,
    });
  }
  return stalls;
};

const mockStalls = createMockStalls();

// -------------------------------------
// --- NEW MAP LAYOUT CONSTANT (Remapped Names) ---
// -------------------------------------
// The layout positions are the same, but the keys are renamed
// to match the new A=Large, B=Medium, C=Small logic.
const stallLayout: { [key: string]: React.CSSProperties } = {
  // --- Hall A (15 Large stalls, 20 Medium stalls) ---
  // Large Stalls (A01 - A15) - Mapped to old A01-A15
  "A01": { top: "15%", left: "5%", width: "5%", height: "8%" },
  "A02": { top: "8%", left: "12%", width: "5%", height: "8%" },
  "A03": { top: "8%", left: "18%", width: "5%", height: "8%" },
  "A04": { top: "15%", left: "25%", width: "5%", height: "8%" },
  "A05": { top: "25%", left: "30%", width: "5%", height: "8%" },
  "A06": { top: "35%", left: "30%", width: "5%", height: "8%" },
  "A07": { top: "45%", left: "25%", width: "5%", height: "8%" },
  "A08": { top: "52%", left: "18%", width: "5%", height: "8%" },
  "A09": { top: "52%", left: "12%", width: "5%", height: "8%" },
  "A10": { top: "45%", left: "5%", width: "5%", height: "8%" },
  "A11": { top: "35%", left: "0%", width: "5%", height: "8%" },
  "A12": { top: "25%", left: "0%", width: "5%", height: "8%" },
  "A13": { top: "22%", left: "10%", width: "5%", height: "8%" },
  "A14": { top: "22%", left: "16%", width: "5%", height: "8%" },
  "A15": { top: "30%", left: "23%", width: "5%", height: "8%" },

  // Medium Stalls (B01 - B20) - Mapped to old A16-A35
  "B01": { top: "38%", left: "23%", width: "5%", height: "8%" },
  "B02": { top: "45%", left: "16%", width: "5%", height: "8%" },
  "B03": { top: "45%", left: "10%", width: "5%", height: "8%" },
  "B04": { top: "38%", left: "7%", width: "5%", height: "8%" },
  "B05": { top: "30%", left: "7%", width: "5%", height: "8%" },
  "B06": { top: "30%", left: "13%", width: "7%", height: "5%" },
  "B07": { top: "30%", left: "21%", width: "7%", height: "5%" },
  "B08": { top: "36%", left: "13%", width: "7%", height: "5%" },
  "B09": { top: "36%", left: "21%", width: "7%", height: "5%" },
  "B10": { top: "42%", left: "17%", width: "7%", height: "5%" },
  "B11": { top: "62%", left: "8%", width: "7%", height: "5%" },
  "B12": { top: "62%", left: "16%", width: "7%", height: "5%" },
  "B13": { top: "68%", left: "8%", width: "7%", height: "5%" },
  "B14": { top: "68%", left: "16%", width: "7%", height: "5%" },
  "B15": { top: "74%", left: "12%", width: "7%", height: "5%" },
  "B16": { top: "5%", left: "5%", width: "5%", height: "8%" },
  "B17": { top: "5%", left: "25%", width: "5%", height: "8%" },
  "B18": { top: "80%", left: "12%", width: "7%", height: "5%" },
  "B19": { top: "86%", left: "12%", width: "7%", height: "5%" },
  "B20": { top: "92%", left: "12%", width: "7%", height: "5%" },

  // --- Hall B (25 Small stalls) ---
  // Small Stalls (C01 - C25) - Mapped to old B01-B25
  "C01": { top: "20%", left: "65%", width: "5%", height: "8%" },
  "C02": { top: "15%", left: "72%", width: "5%", height: "8%" },
  "C03": { top: "15%", left: "78%", width: "5%", height: "8%" },
  "C04": { top: "20%", left: "85%", width: "5%", height: "8%" },
  "C05": { top: "30%", left: "90%", width: "5%", height: "8%" },
  "C06": { top: "40%", left: "90%", width: "5%", height: "8%" },
  "C07": { top: "50%", left: "85%", width: "5%", height: "8%" },
  "C08": { top: "55%", left: "78%", width: "5%", height: "8%" },
  "C09": { top: "55%", left: "72%", width: "5%", height: "8%" },
  "C10": { top: "50%", left: "65%", width: "5%", height: "8%" },
  "C11": { top: "40%", left: "60%", width: "5%", height: "8%" },
  "C12": { top: "30%", left: "60%", width: "5%", height: "8%" },
  "C13": { top: "25%", left: "70%", width: "6%", height: "6%" },
  "C14": { top: "25%", left: "77%", width: "6%", height: "6%" },
  "C15": { top: "32%", left: "65%", width: "6%", height: "6%" },
  "C16": { top: "32%", left: "72%", width: "6%", height: "6%" },
  "C17": { top: "32%", left: "79%", width: "6%", height: "6%" },
  "C18": { top: "32%", left: "86%", width: "6%", height: "6%" },
  "C19": { top: "40%", left: "68%", width: "6%", height: "6%" },
  "C20": { top: "40%", left: "75%", width: "6%", height: "6%" },
  "C21": { top: "40%", left: "82%", width: "6%", height: "6%" },
  "C22": { top: "47%", left: "70%", width: "6%", height: "6%" },
  "C23": { top: "47%", left: "77%", width: "6%", height: "6%" },
  "C24": { top: "47%", left: "84%", width: "6%", height: "6%" },
  "C25": { top: "65%", left: "75%", width: "6%", height: "6%" },
};

// -------------------------------------
// --- Map Test Page Component ---
// -------------------------------------
export default function StallMapTestPage() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);

  useEffect(() => {
    // Load mock data on mount
    setStalls(mockStalls);
  }, []);

  const handleOpenEditModal = (stall: Stall) => {
    setEditingStall(stall);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStall(null);
  };

  const handleSaveStall = (savedStall: Stall) => {
    if (editingStall) {
      // Edit existing stall
      setStalls((prev) =>
        prev.map((s) => (s.id === savedStall.id ? savedStall : s))
      );
      console.log("--- DEV MODE: Edited stall ---", savedStall);
    }
    // We disable adding new stalls from the map for now
    // as they wouldn't have a layout position.
    handleCloseModal();
  };

  const getSizeColor = (size: StallSize) => {
    switch (size) {
      case "Small":
        return "bg-yellow-400 border-yellow-600"; // Yellow for Small
      case "Medium":
        return "bg-blue-400 border-blue-600"; // Blue for Medium
      case "Large":
        return "bg-red-400 border-red-600"; // Red for Large
    }
  };

  const getStatusOpacity = (status: StallStatus) => {
    return status === "Available" ? "opacity-100" : "opacity-40";
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Stall Map Test (Sandbox)</h1>
      <p className="mb-4 text-gray-600">
        This is a test page for the new map layout. Click any stall to manage it.
      </p>

      {/* --- Map Container --- */}
      <div className="w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden" style={{ height: "120vh" }}>
        <div className="relative w-full h-full p-4">
          
          {/* --- Octagon Outlines --- */}
          {/* Hall A (Larger) */}
          <div 
            className="absolute bg-gray-200"
            style={{
              width: "40%", 
              height: "70%", 
              top: "5%", 
              left: "0%",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
            }}
          >
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-500">HALL A</span>
          </div>

          {/* Hall B (Smaller) */}
          <div 
            className="absolute bg-gray-200"
            style={{
              width: "35%", 
              height: "60%", 
              top: "10%", 
              left: "60%",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
            }}
          >
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-500">HALL B</span>
          </div>

          {/* --- Static Elements --- */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 p-4 bg-gray-300 rounded z-10">
            <span className="text-gray-600 font-bold">MAIN ENTRANCE</span>
          </div>
          <div className="absolute top-1/2 left-[48%] -translate-x-1/2 p-3 bg-gray-300 rounded z-10">
            <span className="text-gray-600 font-bold">LOBBY</span>
          </div>

          {/* --- Render Stalls --- */}
          {stalls.map((stall) => {
            const layout = stallLayout[stall.name];
            // If stall doesn't have a map position, don't render it
            if (!layout) {
                console.warn(`No layout for stall: ${stall.name}`);
                return null;
            }

            return (
              <button
                key={stall.id}
                onClick={() => handleOpenEditModal(stall)}
                style={layout}
                className={`absolute border rounded-sm flex items-center justify-center font-bold text-white text-xs shadow-md
                  ${getSizeColor(stall.size)}
                  ${getStatusOpacity(stall.status)}
                  hover:opacity-100 hover:scale-110 hover:shadow-lg transition-all transform z-20`} // z-20 to be above outlines
              >
                {stall.name}
              </button>
            );
          })}
        </div>
      </div>

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
// --- Manage Stall Modal Component (Copied from StallsPage) ---
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
  // We only read 'name', we don't need 'setName' since it's read-only
  const [name] = useState(stall?.name || "");
  const [size] = useState<StallSize>(stall?.size || "Medium");
  const [status, setStatus] = useState<StallStatus>(stall?.status || "Available");
  const [publisherName, setPublisherName] = useState(stall?.publisherName || "");

  // This modal can only EDIT, not create new stalls (as they'd have no map position)
  const title = "Manage Stall";

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
            {/* Stall Name (Read-only) */}
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
                readOnly // You shouldn't change the name of a stall on the map
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
            {/* Stall Size (Read-only) */}
            <div>
              <label
                htmlFor="stall-size"
                className="block text-sm font-medium text-gray-700"
              >
                Size
              </label>
              <input
                type="text"
                id="stall-size"
                value={size}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
              />
            </div>
            {/* Stall Status (EDITABLE) */}
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
                {/* FIX: Corrected typo from value_a to value */}
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