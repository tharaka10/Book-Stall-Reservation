// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// interface Stall {
//   id: string;
//   isReserved: boolean;
//   reservedBy?: string | null;
//   publisherName?: string | null;
// }

// const StallMap: React.FC = () => {
//   const [stalls, setStalls] = useState<Stall[]>([]);
//   const [selected, setSelected] = useState<string[]>([]);
//   const [qrUrl, setQrUrl] = useState<string | null>(null);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetchStalls();
//   }, []);

//   const fetchStalls = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/stalls", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setStalls(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load stalls");
//     }
//   };

//   const handleSelect = (id: string, isReserved: boolean) => {
//     if (isReserved) return toast.error("This stall is already reserved");
//     if (selected.includes(id)) {
//       setSelected(selected.filter((s) => s !== id));
//     } else if (selected.length < 3) {
//       setSelected([...selected, id]);
//     } else {
//       toast.error("You can select a maximum of 3 stalls");
//     }
//   };

//   const handleReserve = async () => {
//     if (selected.length === 0) return toast.error("Select at least one stall");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/reservations/confirm",
//         {
//           reservationId: Date.now().toString(),
//           email: "publisher@example.com", // replace with real logged-in email
//           stalls: selected,
//           publisherName: "ABC Publications", // replace with real publisher name
//         }
//       );

//       toast.success(res.data.message);
//       console.log("QR URL:", res.data.qrUrl);

//       setQrUrl(res.data.qrUrl);
//       setSelected([]);

//       // ✅ Refresh stall map so reserved ones turn gray
//       await fetchStalls();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Reservation failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold mb-6 text-yellow-700">
//         Stall Selection Map
//       </h1>

//       {/* Stall grid */}
//       <div className="grid grid-cols-5 gap-6">
//         {stalls.map((stall) => (
//           <div
//             key={stall.id}
//             onClick={() => handleSelect(stall.id, stall.isReserved)}
//             className={`cursor-pointer w-24 h-20 flex flex-col items-center justify-center rounded-lg shadow-md transition-all duration-200
//               ${
//                 stall.isReserved
//                   ? "bg-gray-400 text-white cursor-not-allowed"
//                   : selected.includes(stall.id)
//                   ? "bg-yellow-500 text-white scale-105"
//                   : "bg-amber-200 hover:bg-amber-300"
//               }`}
//           >
//             <span className="text-lg font-bold">{stall.id}</span>
//             {stall.isReserved && (
//               <span className="text-xs mt-1 text-gray-100 text-center break-words">
//                 {stall.reservedBy
//                   ? stall.reservedBy.split("@")[0]
//                   : "Reserved"}
//               </span>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Reserve button */}
//       <button
//         onClick={handleReserve}
//         disabled={selected.length === 0}
//         className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
//       >
//         Confirm Reservation ({selected.length}/3)
//       </button>

//       {/* QR download section */}
//       {qrUrl && (
//         <div className="mt-10 text-center flex flex-col items-center">
//           <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
//             Reservation Confirmed 🎉
//           </h2>
//           <p className="text-gray-600 mb-2">
//             Scan or download your reservation QR code below:
//           </p>

//           <img
//             src={qrUrl}
//             alt="Reservation QR"
//             className="w-40 h-40 mb-4 border-4 border-yellow-500 rounded-lg shadow-md"
//           />

//           <a
//             href={qrUrl}
//             download="Reservation_QR.png"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg transition"
//           >
//             ⬇️ Download QR Code
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StallMap;

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";


interface Stall {
  id: string;
  isReserved: boolean;
  reservedBy?: string | null;
  publisherName?: string | null;
}

interface DecodedToken {
  email: string;
  name?: string;
  role?: string;
  exp: number;
}

const StallMap: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  // 🔹 Decode publisher details from JWT token
  let publisherEmail = "";
  let publisherName = "";

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      publisherEmail = decoded.email;
      publisherName = decoded.name || "Unknown Publisher";
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  useEffect(() => {
    fetchStalls();
  }, []);

  // 🔹 Fetch all stalls from backend
  const fetchStalls = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stalls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStalls(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stalls");
    }
  };

  // 🔹 Handle stall selection (max 3)
  const handleSelect = (id: string, isReserved: boolean) => {
    if (isReserved) return toast.error("This stall is already reserved");
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    } else {
      toast.error("You can select a maximum of 3 stalls");
    }
  };

  // 🔹 Reserve stalls
  const handleReserve = async () => {
    if (selected.length === 0)
      return toast.error("Select at least one stall");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/reservations/reserve",
        {
          reservationId: Date.now().toString(),
          email: publisherEmail,
          stalls: selected,
          publisherName: publisherName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      console.log("QR URL:", res.data.qrUrl);

      setQrUrl(res.data.qrUrl);
      setSelected([]);
      await fetchStalls(); // Refresh stall map so new ones turn gray
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Reservation failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-700">
        Stall Selection Map
      </h1>

      {/* Legend */}
      <div className="flex gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-200 border border-gray-400 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-500 border border-gray-400 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-400 border border-gray-400 rounded"></div>
          <span>Reserved</span>
        </div>
      </div>

      {/* Stall grid */}
      <div className="grid grid-cols-5 gap-6">
        {stalls.map((stall) => (
          <div
            key={stall.id}
            onClick={() => handleSelect(stall.id, stall.isReserved)}
            title={
              stall.isReserved && stall.publisherName
                ? `Reserved by ${stall.publisherName}`
                : ""
            }
            className={`cursor-pointer w-24 h-20 flex flex-col items-center justify-center rounded-lg shadow-md transition-all duration-200
              ${
                stall.isReserved
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : selected.includes(stall.id)
                  ? "bg-yellow-500 text-white scale-105"
                  : "bg-amber-200 hover:bg-amber-300"
              }`}
          >
            <span className="text-lg font-bold">{stall.id}</span>
            {stall.isReserved && (
              <span className="text-xs mt-1 text-gray-100 text-center break-words">
                {stall.reservedBy
                  ? stall.reservedBy.split("@")[0]
                  : "Reserved"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={selected.length === 0}
        className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
      >
        Confirm Reservation ({selected.length}/3)
      </button>

      {/* QR download section */}
      {qrUrl && (
        <div className="mt-10 text-center flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
            Reservation Confirmed 🎉
          </h2>
          <p className="text-gray-600 mb-2">
            Scan or download your reservation QR code below:
          </p>

          <img
            src={qrUrl}
            alt="Reservation QR"
            className="w-40 h-40 mb-4 border-4 border-yellow-500 rounded-lg shadow-md"
          />

          <a
            href={qrUrl}
            download="Reservation_QR.png"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            ⬇️ Download QR Code
          </a>
        </div>
      )}
    </div>
  );
};

export default StallMap;
