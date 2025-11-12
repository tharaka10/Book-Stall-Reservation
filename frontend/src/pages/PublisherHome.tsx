import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Reservation {
  id: string;
  stalls: string[];
  qrUrl?: string;
  createdAt?: string;
}

interface DecodedToken {
  email: string;
  name?: string;
  role?: string;
  exp: number;
}

const PublisherHome: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const token = localStorage.getItem("token");

  let publisherEmail = "";
  let publisherName = "Unknown Publisher";

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      publisherEmail = decoded.email;
      publisherName = decoded.name || "Unknown Publisher";
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  // 🔹 Fetch reservations for this publisher
  useEffect(() => {
    if (publisherEmail) fetchReservations();
  }, [publisherEmail]);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reservations/user/${publisherEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservations");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      {/* Header Section */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 mb-10 text-center">
        <h1 className="text-3xl font-bold text-yellow-700 mb-2">
          Welcome, {publisherName}! 👋
        </h1>
        <p className="text-gray-600 mb-6">{publisherEmail}</p>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => navigate("/stallmap")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            🏠 Reserve Stalls
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Reservations Section */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
          Your Reservations 🧾
        </h2>

        {reservations.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            You haven’t reserved any stalls yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="border border-yellow-300 rounded-lg p-4 bg-amber-50 shadow-sm"
              >
                <h3 className="font-bold text-lg text-yellow-800">
                  Reservation #{res.id}
                </h3>
                <p className="text-gray-700 mt-1">
                  <strong>Stalls:</strong> {res.stalls.join(", ")}
                </p>
                {res.qrUrl ? (
                  <div className="mt-3 flex flex-col items-center">
                    <img
                      src={res.qrUrl}
                      alt="QR"
                      className="w-32 h-32 border-2 border-yellow-500 rounded-lg mb-2"
                    />
                    <a
                      href={res.qrUrl}
                      download={`QR_${res.id}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-700 font-semibold hover:underline"
                    >
                      ⬇️ Download QR
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    QR code not available.
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {res.createdAt
                    ? new Date(res.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublisherHome;
