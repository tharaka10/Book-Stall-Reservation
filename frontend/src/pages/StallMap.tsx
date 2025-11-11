import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface Stall {
  id: string;
  isReserved: boolean;
}

const StallMap: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStalls();
  }, []);

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

const handleReserve = async () => {
  if (selected.length === 0) return toast.error("Select at least one stall");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/reservations/confirm",
      {
        reservationId: Date.now().toString(), // or from DB if you generate it
        email: "publisher@example.com",        // replace with logged-in user's email
        stalls: selected,
        publisherName: "ABC Publications",     // can fetch from user profile
      }
    );

    toast.success(res.data.message);
    console.log("QR URL:", res.data.qrUrl);

    // Optionally, show the QR code after success
    alert("Reservation successful! QR Code: " + res.data.qrUrl);
    setSelected([]);
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
      <div className="grid grid-cols-5 gap-6">
        {stalls.map((stall) => (
          <div
            key={stall.id}
            onClick={() => handleSelect(stall.id, stall.isReserved)}
            className={`cursor-pointer w-24 h-16 flex items-center justify-center text-lg font-semibold rounded-lg shadow-md transition 
              ${
                stall.isReserved
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : selected.includes(stall.id)
                  ? "bg-yellow-500 text-white scale-105"
                  : "bg-amber-200 hover:bg-amber-300"
              }`}
          >
            {stall.id}
          </div>
        ))}
      </div>

      <button
        onClick={handleReserve}
        disabled={selected.length === 0}
        className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
      >
        Confirm Reservation ({selected.length}/3)
      </button>
    </div>
  );
};

export default StallMap;
