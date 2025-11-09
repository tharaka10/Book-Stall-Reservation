import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  CheckSquare,
  ClipboardList,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
//import API from "../services/api"; // For when you're ready to connect

// --- Type Definitions ---
interface DashboardStats {
  totalStalls: number;
  reservedStalls: number;
  availableStalls: number;
  totalPublishers: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any; // Add index signature for recharts compatibility
}

interface RecentReservation {
  id: string;
  publisherName: string;
  stalls: string[];
  reservationDate: string; // ISO string
}

// --- Mock Data (for development) ---
const mockStats: DashboardStats = {
  totalStalls: 150,
  reservedStalls: 95,
  availableStalls: 52, // 150 - 95 - 3
  totalPublishers: 112,
};

const mockChartData: ChartDataItem[] = [
  { name: "Reserved", value: 95 },
  { name: "Available", value: 52 },
  { name: "Maintenance", value: 3 },
];

const mockRecentReservations: RecentReservation[] = [
  {
    id: "res-001",
    publisherName: "Book Co. Lanka",
    stalls: ["A-01", "A-02"],
    reservationDate: "2025-10-20T10:30:00Z",
  },
  {
    id: "res-002",
    publisherName: "Readers Ltd.",
    stalls: ["B-03"],
    reservationDate: "2025-10-19T14:15:00Z",
  },
  {
    id: "res-003",
    publisherName: "Pages Inc.",
    stalls: ["C-11"],
    reservationDate: "2025-10-19T09:00:00Z",
  },
  {
    id: "res-004",
    publisherName: "Colombo Books",
    stalls: ["A-05"],
    reservationDate: "2025-10-18T17:45:00Z",
  },
  {
    id: "res-005",
    publisherName: "Galle Publishers",
    stalls: ["D-01"],
    reservationDate: "2025-10-18T11:00:00Z",
  },
];
// --- End Mock Data ---

// -------------------------------------
// --- Main Dashboard Page Component ---
// -------------------------------------
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [recentReservations, setRecentReservations] = useState<
    RecentReservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- DEVELOPMENT: Using Mock Data ---
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setStats(mockStats);
        setChartData(mockChartData);
        setRecentReservations(mockRecentReservations);
        // --- END DEVELOPMENT ---

        /* --- PRODUCTION: Real API Call (uncomment when ready) ---
        // You'd likely need to fetch from multiple endpoints
        const statsRes = await API.get("/dashboard/stats");
        const chartRes = await API.get("/dashboard/chart-data");
        const recentRes = await API.get("/reservations?limit=5");
        
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentReservations(recentRes.data);
        */
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Runs once on component mount

  if (loading) {
    return <p className="text-center py-10">Loading dashboard...</p>;
  }

  if (error || !stats) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Stalls"
          value={stats.totalStalls}
          Icon={LayoutGrid}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Reserved Stalls"
          value={stats.reservedStalls}
          Icon={CheckSquare}
          color="text-red-500"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Available Stalls"
          value={stats.availableStalls}
          Icon={ClipboardList}
          color="text-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Publishers"
          value={stats.totalPublishers}
          Icon={Users}
          color="text-yellow-500"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* --- Main Content Area (Chart & Recent List) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stall Status Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Stall Status</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  //label={(entry) => `${entry.name} (${entry.value})`}
                >
                  <Cell fill="#f63f3a" /> {/* Reserved - Red */}
                  <Cell fill="#7AC142" /> {/* Available - Green */}
                  <Cell fill="#FFAB05" /> {/* Maintenance - Grey */}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Reservations</h2>
          <div className="space-y-4">
            {recentReservations.length === 0 ? (
              <p className="text-gray-500">No recent reservations.</p>
            ) : (
              recentReservations.map((res) => (
                <div key={res.id} className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {res.publisherName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Booked {res.stalls.join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            to="/reservations"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-6"
          >
            View All Reservations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------
// --- Stat Card Component ---
// -------------------------------------
function StatCard({
  title,
  value,
  Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
      <div className={`p-3 rounded-full ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}