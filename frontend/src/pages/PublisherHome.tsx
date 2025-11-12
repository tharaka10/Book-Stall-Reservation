// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// interface Reservation {
//   id: string;
//   stalls: string[];
//   qrUrl?: string;
//   createdAt?: string;
//   publisherName?: string;
//   email?: string;
// }

// interface DecodedToken {
//   email: string;
//   name?: string;
//   role?: string;
//   exp: number;
// }

// const PublisherHome: React.FC = () => {
//   const navigate = useNavigate();
//   const [reservations, setReservations] = useState<Reservation[]>([]);
//   const token = localStorage.getItem("token");

//   let publisherEmail = "";
//   let publisherName = "Unknown Publisher";

//   if (token) {
//     try {
//       const decoded: DecodedToken = jwtDecode(token);
//       publisherEmail = decoded.email;
//       publisherName = decoded.name || "Unknown Publisher";
//     } catch (error) {
//       console.error("Invalid token:", error);
//     }
//   }

//   // 🔹 Fetch reservations for this publisher
//   useEffect(() => {
//     if (publisherEmail) fetchReservations();
//   }, [publisherEmail]);

//   const fetchReservations = async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/reservations/user/${publisherEmail}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Ensure data exists
//       if (!Array.isArray(res.data)) {
//         console.warn("Unexpected data format:", res.data);
//         return toast.error("Error loading reservation data");
//       }

//       setReservations(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load reservations");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//     toast.success("Logged out successfully!");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
//       {/* Header Section */}
//       <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 mb-10 text-center">
//         <h1 className="text-3xl font-bold text-yellow-700 mb-2">
//           Welcome, {publisherName}! 👋
//         </h1>
//         <p className="text-gray-600 mb-6">{publisherEmail}</p>

//         <div className="flex justify-center gap-6">
//           <button
//             onClick={() => navigate("/stallmap")}
//             className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
//           >
//             🏠 Reserve Stalls
//           </button>

//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
//           >
//             🚪 Logout
//           </button>
//         </div>
//       </div>

//       {/* Reservations Section */}
//       <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8">
//         <h2 className="text-2xl font-semibold text-yellow-700 mb-6 text-center">
//           Your Reservations 🧾
//         </h2>

//         {reservations.length === 0 ? (
//           <p className="text-gray-600 text-center py-8">
//             You haven’t reserved any stalls yet.
//           </p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {reservations.map((res) => (
//               <div
//                 key={res.id}
//                 className="border border-yellow-300 rounded-xl p-5 bg-amber-50 shadow-sm transition hover:shadow-md flex flex-col items-center"
//               >
//                 <h3 className="font-bold text-lg text-yellow-800 mb-2">
//                   Reservation #{res.id}
//                 </h3>

//                 {/* QR Code */}
//                 {res.qrUrl ? (
//                   <div className="mt-2 flex flex-col items-center">
//                     <img
//                       src={res.qrUrl}
//                       alt="QR"
//                       className="w-36 h-36 border-4 border-yellow-500 rounded-lg shadow-md mb-3"
//                     />
//                     <a
//                       href={res.qrUrl}
//                       download={`QR_${res.id}.png`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
//                     >
//                       ⬇️ Download QR Code
//                     </a>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-500 mt-4">
//                     QR code not available.
//                   </p>
//                 )}

//                 {/* Reservation Details */}
//                 <div className="mt-4 w-full text-sm text-gray-700 bg-yellow-100 p-3 rounded-lg border border-yellow-300">
//                   <p>
//                     <strong>Publisher:</strong> {res.publisherName || publisherName}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {res.email || publisherEmail}
//                   </p>
//                   <p>
//                     <strong>Stalls:</strong> {res.stalls.join(", ")}
//                   </p>
//                   <p>
//                     <strong>Date:</strong>{" "}
//                     {res.createdAt
//                       ? new Date(res.createdAt).toLocaleString()
//                       : "—"}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PublisherHome;

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
  publisherName?: string;
  email?: string;
}

interface DecodedToken {
  email: string;
  name?: string;
  role?: string;
  exp: number;
}

const PublisherHome: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  // 🔹 Fetch reservations + genres
  useEffect(() => {
    if (publisherEmail) {
      fetchReservations();
      fetchGenres();
    }
  }, [publisherEmail]);

  /** Fetch reservations for this publisher */
  const fetchReservations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reservations/user/${publisherEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (Array.isArray(res.data)) setReservations(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservations");
    }
  };

  /** Fetch genres */
  const fetchGenres = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/publishers/${publisherEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetched = res.data.genres || [];
      setGenres(fetched);
      // 👇 Auto-prompt modal if first time / empty
      if (fetched.length === 0) {
        setTimeout(() => setShowGenreModal(true), 500);
      }
    } catch (err) {
      console.error("Failed to fetch genres", err);
    }
  };

  /** Save genres to Firestore */
  const saveGenres = async (updated: string[]) => {
    try {
      await axios.post(
        "http://localhost:5000/api/publishers/update-genres",
        {
          email: publisherEmail,
          name: publisherName,
          genres: updated,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGenres(updated);
      toast.success("Genres updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update genres");
    }
  };

  const handleAddGenre = () => {
    if (!newGenre.trim()) return toast.error("Enter a genre name");
    const updated = [...new Set([...genres, newGenre.trim()])];
    saveGenres(updated);
    setNewGenre("");
    setShowGenreModal(false); // Close modal if user adds genres
  };

  const handleDeleteGenre = (genre: string) => {
    const updated = genres.filter((g) => g !== genre);
    saveGenres(updated);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 relative">
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
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Literary Genres Section */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 mb-10">
        <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
          Your Literary Genres 📚
        </h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            placeholder="Enter a new genre..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleAddGenre}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            ➕ Add
          </button>
        </div>

        {genres.length === 0 ? (
          <p className="text-gray-600">You haven’t added any genres yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <li
                key={genre}
                className="bg-amber-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
              >
                {genre}
                <button
                  onClick={() => handleDeleteGenre(genre)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reservations Section */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-yellow-700 mb-6 text-center">
          Your Reservations 🧾
        </h2>

        {reservations.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            You haven’t reserved any stalls yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="border border-yellow-300 rounded-xl p-5 bg-amber-50 shadow-sm transition hover:shadow-md flex flex-col items-center"
              >
                <h3 className="font-bold text-lg text-yellow-800 mb-2">
                  Reservation #{res.id}
                </h3>

                {/* QR Code */}
                {res.qrUrl ? (
                  <div className="mt-2 flex flex-col items-center">
                    <img
                      src={res.qrUrl}
                      alt="QR"
                      className="w-36 h-36 border-4 border-yellow-500 rounded-lg shadow-md mb-3"
                    />
                    <a
                      href={res.qrUrl}
                      download={`QR_${res.id}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                    >
                      ⬇️ Download QR Code
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">
                    QR code not available.
                  </p>
                )}

                {/* Reservation Details */}
                <div className="mt-4 w-full text-sm text-gray-700 bg-yellow-100 p-3 rounded-lg border border-yellow-300">
                  <p>
                    <strong>Publisher:</strong>{" "}
                    {res.publisherName || publisherName}
                  </p>
                  <p>
                    <strong>Email:</strong> {res.email || publisherEmail}
                  </p>
                  <p>
                    <strong>Stalls:</strong> {res.stalls.join(", ")}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {res.createdAt
                      ? new Date(res.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📍 Modal: Add Genres (Blurred Background) */}
      {showGenreModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full text-center border border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-700 mb-3">
              Add Your Literary Genres 📚
            </h2>
            <p className="text-gray-600 mb-4">
              Please add the types of books or content you’ll be displaying at
              the exhibition.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="e.g. Fiction, Science..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleAddGenre}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
              >
                ➕ Add
              </button>
            </div>
            <button
              onClick={() => setShowGenreModal(false)}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* 📍 Logout Confirmation Popup */}
      {showLogoutModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-red-400">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Confirm Logout 🚪
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
                <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg"
              >
                Confirm
              </button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublisherHome;
