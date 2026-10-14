"use client";

import React, { useState, useEffect } from "react";
import { hotelApi, availabilityApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  Hotel,
  Bed,
  Plus,
  Trash2,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Calendar,
  Tag,
  Percent,
  Check,
  Image as ImageIcon,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCheck,
} from "lucide-react";

export default function RoomsTab({ hotels = [], initialHotelId = null }) {
  const { showToast } = useToast();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  // 7.2 Date-Based Availability Inspector State
  const [inspectRoomId, setInspectRoomId] = useState("");
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0];
  const [inspectCheckIn, setInspectCheckIn] = useState(tomorrow);
  const [inspectCheckOut, setInspectCheckOut] = useState(threeDaysLater);
  const [inspectRequestedRooms, setInspectRequestedRooms] = useState(1);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // 7.1 Room Creation Form State
  const initialRoomState = {
    name: "",
    roomType: "DELUXE",
    description: "Spacious, elegantly furnished room featuring premium bedding, climate control, and scenic views.",
    adults: 2,
    children: 1,
    beds: "1 King Bed",
    basePrice: 5000,
    discountPercentage: 10,
    totalRooms: 10,
    amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Bar", "Balcony View"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
    ],
  };

  const [newRoom, setNewRoom] = useState(initialRoomState);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // Bulk Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [bulkFilterMode, setBulkFilterMode] = useState("ALL"); // "ALL" | "SELECTED" | "EXCLUDED" | "ERRORS"
  const [bulkSearch, setBulkSearch] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState(null);

  const popularRoomAmenities = [
    "Free Wi-Fi",
    "Air Conditioning",
    "Flat-screen TV",
    "Mini Bar",
    "Balcony View",
    "Work Desk",
    "Jacuzzi",
    "Coffee Maker",
    "In-room Safe",
    "Complimentary Breakfast",
  ];

  // Set default selected hotel
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      if (initialHotelId) {
        const found = hotels.find((h) => h._id === initialHotelId);
        if (found) {
          setSelectedHotel(found);
          return;
        }
      }
      if (!selectedHotel) {
        setSelectedHotel(hotels[0]);
      }
    }
  }, [hotels, initialHotelId]);

  // Load rooms when selected hotel changes
  useEffect(() => {
    if (selectedHotel?._id) {
      loadRooms(selectedHotel._id);
    }
  }, [selectedHotel]);

  // Automatically select first room for inspection
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      if (!inspectRoomId || !rooms.find((r) => r._id === inspectRoomId)) {
        setInspectRoomId(rooms[0]._id);
      }
    } else {
      setInspectRoomId("");
      setAvailabilityResult(null);
    }
  }, [rooms]);

  const loadRooms = async (hotelId) => {
    try {
      setLoading(true);
      const res = await hotelApi.getRoomsByHotel(hotelId);
      const roomList = res.data || res || [];
      setRooms(roomList);
    } catch (err) {
      console.error("Load rooms error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 7.1 Create Room Handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotel) return;
    setIsSubmitting(true);
    try {
      const bPrice = Number(newRoom.basePrice);
      const disc = Number(newRoom.discountPercentage);
      const fPrice = Math.round(bPrice - (bPrice * disc) / 100);

      const payload = {
        hotelId: selectedHotel._id,
        name: newRoom.name.trim(),
        roomType: newRoom.roomType,
        description: newRoom.description.trim(),
        adults: Number(newRoom.adults),
        children: Number(newRoom.children || 0),
        capacity: {
          adults: Number(newRoom.adults),
          children: Number(newRoom.children || 0),
        },
        beds: newRoom.beds.trim() || "1 King Bed",
        basePrice: bPrice,
        discountPercentage: disc,
        finalPrice: fPrice,
        pricePerNight: fPrice,
        totalRooms: Number(newRoom.totalRooms),
        amenities: newRoom.amenities,
        images: newRoom.images.filter((img) => img.trim().length > 0),
      };

      await hotelApi.createRoom(payload);
      showToast(`Room "${newRoom.name}" successfully added to ${selectedHotel.name}!`, "success");
      setIsAddRoomOpen(false);
      setNewRoom(initialRoomState);
      loadRooms(selectedHotel._id);
    } catch (err) {
      showToast("Failed to create room: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7.2 Run Date-Based Availability Check
  const handleCheckAvailability = async (e) => {
    if (e) e.preventDefault();
    if (!inspectRoomId) {
      showToast("Please select a room to check availability.", "warning");
      return;
    }

    if (new Date(inspectCheckIn) >= new Date(inspectCheckOut)) {
      showToast("Check-out date must be after Check-in date.", "error");
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const res = await availabilityApi.check({
        roomId: inspectRoomId,
        checkIn: inspectCheckIn,
        checkOut: inspectCheckOut,
        rooms: inspectRequestedRooms,
      });

      const data = res.data?.data || res.data || res;
      setAvailabilityResult(data);
    } catch (err) {
      showToast("Availability check failed: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room type? Existing bookings for this room will remain.")) return;
    setDeletingRoomId(roomId);
    try {
      await hotelApi.deleteRoom(roomId);
      showToast("Room listing deleted successfully.", "info");
      loadRooms(selectedHotel._id);
      if (inspectRoomId === roomId) {
        setAvailabilityResult(null);
      }
    } catch (err) {
      showToast("Failed to delete room: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setDeletingRoomId(null);
    }
  };

  const toggleRoomAmenity = (item) => {
    if (newRoom.amenities.includes(item)) {
      setNewRoom({
        ...newRoom,
        amenities: newRoom.amenities.filter((a) => a !== item),
      });
    } else {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, item],
      });
    }
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !newRoom.amenities.includes(trimmed)) {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, trimmed],
      });
      setCustomAmenity("");
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (trimmed && !newRoom.images.includes(trimmed)) {
      setNewRoom({
        ...newRoom,
        images: [...newRoom.images, trimmed],
      });
      setCustomImageUrl("");
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploadingImg(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await hotelApi.uploadImages(formData);
      const uploadedData = res?.data || res || [];
      const newUrls = (Array.isArray(uploadedData) ? uploadedData : [uploadedData])
        .map((item) => (typeof item === "string" ? item : item.url))
        .filter(Boolean);

      if (newUrls.length > 0) {
        setNewRoom((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }));
        showToast(`${newUrls.length} image(s) uploaded successfully!`, "success");
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err) {
      console.warn("Backend upload failed, converting locally:", err);
      const readPromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (loadEvt) => resolve(loadEvt.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const localBase64Urls = (await Promise.all(readPromises)).filter(Boolean);
      if (localBase64Urls.length > 0) {
        setNewRoom((prev) => ({
          ...prev,
          images: [...prev.images, ...localBase64Urls],
        }));
        showToast(`${localBase64Urls.length} image(s) loaded from PC!`, "success");
      } else {
        showToast("Failed to read image files from PC", "error");
      }
    } finally {
      setIsUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setNewRoom({
      ...newRoom,
      images: newRoom.images.filter((_, i) => i !== index),
    });
  };

  // ==================================================
  // BULK ROOM IMPORT HELPERS & SELECTION HANDLERS
  // ==================================================
  const parseCSVText = (text) => {
    const lines = [];
    let row = [];
    let inQuotes = false;
    let currentVal = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = "";
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        row.push(currentVal.trim());
        if (row.some((val) => val !== "")) {
          lines.push(row);
        }
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }

    if (currentVal.trim() !== "" || row.length > 0) {
      row.push(currentVal.trim());
      if (row.some((val) => val !== "")) {
        lines.push(row);
      }
    }

    return lines;
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const rows = parseCSVText(text);

        if (!rows || rows.length < 2) {
          showToast("CSV file must contain a header row and at least 1 data row.", "error");
          setParsedRows([]);
          setSelectedRowIds(new Set());
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

        const findColIndex = (keywords) =>
          headers.findIndex((h) => keywords.some((k) => h.includes(k)));

        const nameIdx = findColIndex(["name", "title", "roomname"]);
        const typeIdx = findColIndex(["roomtype", "type"]);
        const descIdx = findColIndex(["description", "desc"]);
        const adultsIdx = findColIndex(["adults", "adult", "maxadult", "maxguest"]);
        const childrenIdx = findColIndex(["children", "child", "maxchild"]);
        const bedsIdx = findColIndex(["bed", "beds", "bedding"]);
        const totalRoomsIdx = findColIndex(["totalroom", "inventory", "total", "rooms"]);
        const basePriceIdx = findColIndex(["baseprice", "price", "rate", "tariff"]);
        const discountIdx = findColIndex(["discount", "discountpercentage"]);
        const amenitiesIdx = findColIndex(["amenities", "amenity", "features"]);

        const VALID_ROOM_TYPES = [
          "STANDARD",
          "DELUXE",
          "PREMIUM",
          "EXECUTIVE",
          "SUPER_DELUXE",
          "SUITE",
          "FAMILY",
        ];

        const existingNames = new Set((rooms || []).map((r) => r.name.trim().toLowerCase()));
        const seenNamesInFile = new Set();
        const parsed = [];
        const initialSelected = new Set();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || row.every((c) => !c)) continue;

          const originalRowNumber = i + 1; // Excel row number (1-based, header is 1)
          const rowId = `row_${originalRowNumber}`;

          const name = (nameIdx !== -1 && row[nameIdx] !== undefined ? row[nameIdx] : "").trim();
          let rawType = (typeIdx !== -1 && row[typeIdx] !== undefined ? row[typeIdx] : "DELUXE")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
          if (!VALID_ROOM_TYPES.includes(rawType)) {
            rawType = rawType.replace(/-/g, "_");
          }

          const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "";
          const adults = adultsIdx !== -1 && !isNaN(parseInt(row[adultsIdx], 10))
            ? parseInt(row[adultsIdx], 10)
            : 2;
          const children = childrenIdx !== -1 && !isNaN(parseInt(row[childrenIdx], 10))
            ? parseInt(row[childrenIdx], 10)
            : 0;
          const beds = bedsIdx !== -1 && row[bedsIdx] ? row[bedsIdx].trim() : "1 King Bed";
          const totalRooms = totalRoomsIdx !== -1 && !isNaN(parseInt(row[totalRoomsIdx], 10))
            ? parseInt(row[totalRoomsIdx], 10)
            : 5;
          const basePrice = basePriceIdx !== -1 && !isNaN(parseFloat(row[basePriceIdx]))
            ? parseFloat(row[basePriceIdx])
            : 3500;
          const discountPercentage = discountIdx !== -1 && !isNaN(parseFloat(row[discountIdx]))
            ? parseFloat(row[discountIdx])
            : 0;

          const rawAmenities = amenitiesIdx !== -1 && row[amenitiesIdx] ? row[amenitiesIdx] : "";
          const amenities = rawAmenities
            ? rawAmenities.split(/[,;|]/).map((a) => a.trim()).filter(Boolean)
            : ["Free Wi-Fi", "Air Conditioning"];

          const finalPrice = Number(
            (basePrice - (basePrice * discountPercentage) / 100).toFixed(2)
          );

          // Row Validation
          const errors = [];
          if (!name || name.length < 2) {
            errors.push("Name is required (min 2 chars)");
          }
          if (!VALID_ROOM_TYPES.includes(rawType)) {
            errors.push(`Invalid roomType "${rawType}". Must be STANDARD, DELUXE, PREMIUM, EXECUTIVE, SUPER_DELUXE, SUITE, or FAMILY`);
          }
          if (adults < 1) {
            errors.push("Adults capacity must be >= 1");
          }
          if (children < 0) {
            errors.push("Children capacity cannot be negative");
          }
          if (!beds) {
            errors.push("Bed configuration is required");
          }
          if (totalRooms < 1) {
            errors.push("Total rooms inventory must be >= 1");
          }
          if (basePrice < 0) {
            errors.push("Base price cannot be negative");
          }
          if (discountPercentage < 0 || discountPercentage > 100) {
            errors.push("Discount must be 0-100%");
          }

          const lowerName = name.toLowerCase();
          const isDuplicateInFile = seenNamesInFile.has(lowerName);
          if (isDuplicateInFile) {
            errors.push(`Duplicate in file: "${name}" appeared in an earlier row`);
          }
          seenNamesInFile.add(lowerName);

          const isDuplicateExisting = existingNames.has(lowerName);
          if (isDuplicateExisting) {
            errors.push(`Already exists in ${selectedHotel?.name || "this hotel"}`);
          }

          const isValid = errors.length === 0;

          parsed.push({
            id: rowId,
            originalRowNumber,
            name,
            roomType: rawType,
            description,
            adults,
            children,
            beds,
            totalRooms,
            basePrice,
            discountPercentage,
            finalPrice,
            amenities,
            isValid,
            errors,
            isDuplicate: isDuplicateInFile || isDuplicateExisting,
          });

          // Select all valid records by default
          if (isValid) {
            initialSelected.add(rowId);
          }
        }

        setParsedRows(parsed);
        setSelectedRowIds(initialSelected);
        showToast(`Loaded ${parsed.length} room records from CSV!`, "success");
      } catch (err) {
        console.error("Error parsing CSV:", err);
        showToast("Failed to parse CSV file. Please check format.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(parsedRows.map((r) => r.id));
    setSelectedRowIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedRowIds(new Set());
  };

  const handleSelectAllValid = () => {
    const validIds = new Set(
      parsedRows.filter((r) => r.isValid && !r.isDuplicate).map((r) => r.id)
    );
    setSelectedRowIds(validIds);
  };

  const handleSelectPresetRows = (targetRowNumbers) => {
    const targetSet = new Set(targetRowNumbers.map((num) => `row_${num}`));
    const matched = new Set(
      parsedRows.filter((r) => targetSet.has(r.id)).map((r) => r.id)
    );
    setSelectedRowIds(matched);
    showToast(`Selected ${matched.size} preset rows: [${targetRowNumbers.join(", ")}]`, "info");
  };

  const handleDownloadSampleCSV = () => {
    const csvUrl = "/sample_rooms_50.csv";
    const link = document.createElement("a");
    link.href = csvUrl;
    link.setAttribute("download", "sample_rooms_50.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded sample_rooms_50.csv!", "success");
  };

  const handleBulkSubmit = async () => {
    if (!selectedHotel?._id) {
      showToast("No hotel selected", "error");
      return;
    }

    const selectedRowsList = parsedRows.filter((r) => selectedRowIds.has(r.id));
    if (selectedRowsList.length === 0) {
      showToast("No rows selected! Please check at least one row checkbox to import.", "error");
      return;
    }

    setIsBulkSubmitting(true);
    setBulkImportResult(null);

    try {
      const payload = selectedRowsList.map((r) => ({
        name: r.name,
        roomType: r.roomType,
        description: r.description,
        adults: r.adults,
        children: r.children,
        beds: r.beds,
        totalRooms: r.totalRooms,
        basePrice: r.basePrice,
        discountPercentage: r.discountPercentage,
        amenities: r.amenities,
        originalRow: r.originalRowNumber,
      }));

      const res = await hotelApi.bulkCreateRooms(selectedHotel._id, payload);
      const resultData = res?.data || res;
      setBulkImportResult(resultData);

      showToast(
        `Successfully imported ${resultData.insertedCount || selectedRowsList.length} rooms into ${selectedHotel.name}!`,
        "success"
      );

      // Refresh room list
      await loadRooms(selectedHotel._id);

      // Deselect imported rows
      setSelectedRowIds(new Set());
    } catch (err) {
      console.error("Bulk import failed:", err);
      showToast(
        typeof err === "string" ? err : err.message || "Bulk room import failed",
        "error"
      );
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const activeInspectRoom = rooms.find((r) => r._id === inspectRoomId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Room &amp; Inventory Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure room types, tariffs, and inspect real-time booking availability
          </p>
        </div>

        {selectedHotel && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setIsBulkImportOpen(true);
                setBulkImportResult(null);
              }}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk Import CSV / Excel</span>
            </button>
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room Type</span>
            </button>
          </div>
        )}
      </div>

      {hotels && hotels.length > 0 ? (
        <div className="space-y-6">
          {/* Active Managed Property Switcher Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 text-[#5B30D9] flex items-center justify-center shrink-0">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Active Managed Property
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {selectedHotel?.name}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({selectedHotel?.location?.city || selectedHotel?.city}, {selectedHotel?.hotelType || "HOTEL"})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                Switch Property:
              </span>
              <select
                value={selectedHotel?._id || ""}
                onChange={(e) => {
                  const found = hotels.find((h) => h._id === e.target.value);
                  if (found) {
                    setSelectedHotel(found);
                    setAvailabilityResult(null);
                  }
                }}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#5B30D9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
              >
                {hotels.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} — {h.location?.city || h.city} ({h.status || "PENDING"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 7.2 DATE-BASED AVAILABILITY INSPECTOR (Interactive Panel) */}
          {/* ========================================================= */}
          {rooms.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-[#5B30D9] border border-purple-200/80">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>Date-Based Availability Inspector</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verify booking dates and inspect remaining available room inventory in real-time
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspector Controls */}
              <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Room Type</label>
                  <select
                    value={inspectRoomId}
                    onChange={(e) => {
                      setInspectRoomId(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={inspectCheckIn}
                    onChange={(e) => {
                      setInspectCheckIn(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={inspectCheckOut}
                    onChange={(e) => {
                      setInspectCheckOut(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rooms Requested</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={inspectRequestedRooms}
                    onChange={(e) => {
                      setInspectRequestedRooms(Number(e.target.value));
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isCheckingAvailability}
                    className="w-full py-2 px-3 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isCheckingAvailability ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inspect Availability</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Inspector Result Card */}
              {availabilityResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 animate-fadeIn space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                          availabilityResult.available
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-rose-100 text-rose-700 border border-rose-300"
                        }`}
                      >
                        {availabilityResult.available ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            availabilityResult.available
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {availabilityResult.available ? "AVAILABLE FOR BOOKING" : "SOLD OUT / INSUFFICIENT"}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {activeInspectRoom?.name} • {inspectCheckIn} to {inspectCheckOut}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Rate / Night</span>
                      <span className="text-base font-black text-[#5B30D9]">
                        ₹
                        {(
                          availabilityResult.price?.finalPricePerRoom ||
                          activeInspectRoom?.finalPrice ||
                          activeInspectRoom?.basePrice ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 7.2 Conceptual Calculation Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-200/60 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Total Room Inventory
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {availabilityResult.totalRooms ?? activeInspectRoom?.totalRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-amber-600 uppercase font-bold block">
                        Booked Rooms
                      </span>
                      <span className="text-lg font-black text-amber-600">
                        {availabilityResult.bookedRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-emerald-600 uppercase font-bold block">
                        Available Rooms
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {availabilityResult.availableRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-[#5B30D9] uppercase font-bold block">
                        Requested Quantity
                      </span>
                      <span className="text-lg font-black text-[#5B30D9]">
                        {inspectRequestedRooms}
                      </span>
                    </div>
                  </div>

                  {/* Availability Status Callout */}
                  <div className="p-3 bg-white rounded-xl border border-purple-200/80 text-xs text-slate-700 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#5B30D9] shrink-0" />
                      <span>
                        {availabilityResult.availableRooms >= inspectRequestedRooms
                          ? `✓ Inventory Confirmed: ${availabilityResult.availableRooms} room(s) available for selected dates.`
                          : `✗ Insufficient Rooms: Only ${availabilityResult.availableRooms} room(s) available (requested ${inspectRequestedRooms}).`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 7.1 ROOM TYPES LISTING GRID */}
          {/* ========================================================= */}
          {selectedHotel && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-[#5B30D9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Configured Room Types ({rooms.length}) for {selectedHotel.name}
                  </h3>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  {selectedHotel.status || "APPROVED"}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#5B30D9]" />
                  <span className="text-xs">Loading rooms from database...</span>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => {
                    const thumb =
                      (Array.isArray(room.images) && room.images[0]?.url) ||
                      (typeof room.images?.[0] === "string" ? room.images[0] : null) ||
                      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&auto=format&fit=crop&q=80";

                    return (
                      <div
                        key={room._id}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden relative flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition group shadow-xs"
                      >
                        {/* Room Image Banner (Compact h-32) */}
                        <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={thumb}
                            alt={room.name}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[#5B30D9] rounded-lg border border-purple-200 shadow-xs">
                            {room.roomType}
                          </span>

                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            disabled={deletingRoomId === room._id}
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 border border-slate-200 transition disabled:opacity-50 shadow-xs"
                            title="Delete Room"
                          >
                            {deletingRoomId === room._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Room Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#5B30D9] transition">
                              {room.name}
                            </h4>

                            {room.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {room.description}
                              </p>
                            )}

                            {/* Capacity & Beds */}
                            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#5B30D9] shrink-0" />
                                <span>
                                  {room.capacity?.adults || room.adults || 2} Adults
                                  {room.capacity?.children ? `, ${room.capacity.children} Ch` : ""}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-[#5B30D9] shrink-0" />
                                <span className="truncate">{room.beds || "1 King Bed"}</span>
                              </span>
                              <span className="col-span-2 text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                                Inventory: <strong className="text-slate-800">{room.totalRooms || 5} Total Rooms</strong>
                              </span>
                            </div>

                            {/* Amenities Chips */}
                            {room.amenities && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(Array.isArray(room.amenities)
                                  ? room.amenities
                                  : String(room.amenities).split(",")
                                )
                                  .slice(0, 3)
                                  .map((am, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-[#5B30D9] border border-purple-200/60 font-medium"
                                    >
                                      {typeof am === "string" ? am.trim() : ""}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Price per night */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              {room.discountPercentage > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="line-through text-slate-400">
                                    ₹{room.basePrice?.toLocaleString()}
                                  </span>
                                  <span className="text-emerald-600 font-bold">
                                    {room.discountPercentage}% OFF
                                  </span>
                                </div>
                              )}
                              <span className="text-sm font-black text-[#5B30D9]">
                                ₹
                                {(
                                  room.finalPrice ||
                                  room.basePrice ||
                                  room.pricePerNight ||
                                  0
                                ).toLocaleString()}
                                <span className="text-[10px] font-normal text-slate-500"> / night</span>
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setInspectRoomId(room._id);
                                window.scrollTo({ top: 300, behavior: "smooth" });
                              }}
                              className="text-[11px] font-bold text-[#5B30D9] hover:text-[#4C24B8] py-1 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                            >
                              Check Dates →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Bed className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    No room inventory configured
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Add room options so travelers can reserve stays at this property.
                  </p>
                  <button
                    onClick={() => setIsAddRoomOpen(true)}
                    className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#5B30D9]/25"
                  >
                    Add Room Type
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center text-slate-400 shadow-sm">
          <Hotel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No properties registered</p>
          <p className="text-xs text-slate-400 mt-1">
            Create a hotel property in the Properties tab before adding room types.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7.1 ADD ROOM TYPE MODAL */}
      {/* ========================================================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddRoomOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bed className="w-5 h-5 text-[#5B30D9]" />
                Add Room Type &amp; Inventory
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Property: <span className="font-semibold text-slate-900">{selectedHotel?.name}</span>
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              {/* Room Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Room Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Ocean View Suite"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Category *</label>
                  <select
                    value={newRoom.roomType}
                    onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="SUITE">SUITE</option>
                    <option value="FAMILY">FAMILY</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Description</label>
                <textarea
                  rows={2}
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Spacious room featuring floor-to-ceiling windows, king bed, and luxury rain shower."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              {/* Capacity & Beds */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Adults *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newRoom.adults}
                    onChange={(e) => setNewRoom({ ...newRoom, adults: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Children</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newRoom.children}
                    onChange={(e) => setNewRoom({ ...newRoom, children: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Configuration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 King Bed"
                    value={newRoom.beds}
                    onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Discount */}
              <div className="grid grid-cols-3 gap-3 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/70">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price / Night (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newRoom.basePrice}
                    onChange={(e) => setNewRoom({ ...newRoom, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={newRoom.discountPercentage}
                    onChange={(e) => setNewRoom({ ...newRoom, discountPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Final Price / Night</label>
                  <div className="px-3 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 font-black text-sm">
                    ₹
                    {Math.round(
                      newRoom.basePrice - (newRoom.basePrice * (newRoom.discountPercentage || 0)) / 100
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Total Room Inventory */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Room Inventory Count *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={newRoom.totalRooms}
                  onChange={(e) => setNewRoom({ ...newRoom, totalRooms: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Amenities</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {popularRoomAmenities.map((am) => {
                    const isSelected = newRoom.amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleRoomAmenity(am)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#5B30D9] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {am}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] font-bold rounded-xl border border-purple-200"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Room Images */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Room Images ({newRoom.images.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {newRoom.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 group border border-slate-200">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Upload from PC Button */}
                <div className="mt-2.5">
                  <label className="cursor-pointer flex items-center justify-center gap-2.5 px-4 py-3 bg-purple-50/80 hover:bg-purple-100 text-[#5B30D9] border-2 border-dashed border-purple-200 hover:border-purple-300 rounded-xl font-bold text-xs transition active:scale-[0.99] group shadow-sm">
                    {isUploadingImg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#5B30D9]" />
                        <span>Uploading from PC...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-[#5B30D9] group-hover:scale-110 transition-transform" />
                        <span>📁 Upload Images from PC / Computer</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImg}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or via URL divider */}
                <div className="flex items-center gap-2 my-2.5">
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">or add image by URL</span>
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                </div>

                <div className="flex gap-2 mt-1.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] font-bold rounded-xl border border-purple-200"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#5B30D9]/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* BULK ROOM IMPORT MODAL (CSV / EXCEL) */}
      {/* ================================================== */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Bulk Room Import &amp; Flexible Selection
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#5B30D9]">
                      CSV / Excel
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Importing into: <span className="font-semibold text-slate-800">{selectedHotel?.name}</span> ({selectedHotel?.location?.city || selectedHotel?.city})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                  title="Download 50-Row Sample CSV Template"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Sample CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
              {/* File Upload Zone */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {bulkFile ? bulkFile.name : "Select or Drop your Excel / CSV file"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {bulkFile
                        ? `${(bulkFile.size / 1024).toFixed(1)} KB — ${parsedRows.length} room rows parsed`
                        : "Supports .csv files with custom headers (name, roomType, basePrice, beds, adults, totalRooms, etc.)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="flex-1 sm:flex-initial cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition text-center">
                    <span>{bulkFile ? "Change File" : "Browse CSV File"}</span>
                    <input
                      type="file"
                      accept=".csv, text/csv, application/vnd.ms-excel"
                      onChange={handleBulkFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="sm:hidden px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Import Results Banner */}
              {bulkImportResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    bulkImportResult.insertedCount > 0
                      ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                      : "bg-amber-50/90 border-amber-200 text-amber-900"
                  } space-y-2 animate-fadeIn`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm">
                      Import Complete: {bulkImportResult.insertedCount || 0} rooms successfully created in database!
                    </span>
                  </div>
                  <div className="text-xs flex flex-wrap gap-4 pt-1 border-t border-emerald-200/60">
                    <span>✅ Inserted: <strong>{bulkImportResult.insertedCount || 0}</strong></span>
                    <span>⏭️ Skipped / Duplicate: <strong>{bulkImportResult.skippedCount || 0}</strong></span>
                    <span>⚠️ Validation Errors: <strong>{bulkImportResult.errorCount || 0}</strong></span>
                  </div>
                  {bulkImportResult.skipped && bulkImportResult.skipped.length > 0 && (
                    <div className="mt-2 text-xs bg-white/70 p-2.5 rounded-xl space-y-1">
                      <span className="font-bold text-slate-700 block">Skipped Details:</span>
                      {bulkImportResult.skipped.map((s, idx) => (
                        <p key={idx} className="text-slate-600">
                          • Row {s.row} ({s.name}): {s.reason}
                        </p>
                      ))}
                    </div>
                  )}
                  {bulkImportResult.errors && bulkImportResult.errors.length > 0 && (
                    <div className="mt-2 text-xs bg-rose-50/80 border border-rose-200 p-2.5 rounded-xl space-y-1 text-rose-800">
                      <span className="font-bold block">Validation Errors:</span>
                      {bulkImportResult.errors.map((e, idx) => (
                        <p key={idx}>• {typeof e === "string" ? e : e.error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="space-y-3.5">
                  {/* Selection Toolbar & Statistics Bar */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Stat Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                        Total Records: <strong className="text-slate-900">{parsedRows.length}</strong>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-purple-100 text-[#5B30D9] border border-purple-200 text-xs font-bold shadow-2xs">
                        Selected: <strong>{selectedRowIds.size}</strong>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-slate-200/70 text-slate-700 text-xs font-semibold">
                        Excluded: <strong>{parsedRows.length - selectedRowIds.size}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        Valid: <strong>{parsedRows.filter((r) => r.isValid && !r.isDuplicate).length}</strong>
                      </div>
                      {parsedRows.some((r) => !r.isValid || r.isDuplicate) && (
                        <div className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          Warnings/Errors: <strong>{parsedRows.filter((r) => !r.isValid || r.isDuplicate).length}</strong>
                        </div>
                      )}
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                        title="Select every single row in the file"
                      >
                        Select All ({parsedRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAllValid}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-[#5B30D9] border border-purple-200 rounded-lg text-xs font-bold transition"
                        title="Select all rows without validation issues"
                      >
                        Select All Valid
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition"
                        title="Deselect all rows (clear selection)"
                      >
                        Clear Selection
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPresetRows([2, 7, 15])}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition"
                        title="Select exactly rows 2, 7, and 15 (test requirement)"
                      >
                        🎯 Select Rows 2, 7, 15
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setBulkFilterMode("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          bulkFilterMode === "ALL"
                            ? "bg-[#5B30D9] text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All Records ({parsedRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkFilterMode("SELECTED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          bulkFilterMode === "SELECTED"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Selected for Import ({selectedRowIds.size})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkFilterMode("EXCLUDED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          bulkFilterMode === "EXCLUDED"
                            ? "bg-slate-700 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Excluded ({parsedRows.length - selectedRowIds.size})
                      </button>
                      {parsedRows.some((r) => !r.isValid || r.isDuplicate) && (
                        <button
                          type="button"
                          onClick={() => setBulkFilterMode("ERRORS")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            bulkFilterMode === "ERRORS"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          Warnings / Errors ({parsedRows.filter((r) => !r.isValid || r.isDuplicate).length})
                        </button>
                      )}
                    </div>

                    <div className="relative min-w-[200px] sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter rows by name or #..."
                        value={bulkSearch}
                        onChange={(e) => setBulkSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B30D9]"
                      />
                    </div>
                  </div>

                  {/* Preview Notice Banner */}
                  <div className="px-3.5 py-2 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-[#5B30D9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        {bulkFilterMode === "SELECTED" ? (
                          <>
                            <strong>Exact Selection Preview:</strong> Exactly these <strong>{selectedRowIds.size}</strong> records will be sent to the backend. All other <strong>{parsedRows.length - selectedRowIds.size}</strong> records are excluded.
                          </>
                        ) : (
                          <>
                            Check/uncheck any individual row. Only <strong>{selectedRowIds.size}</strong> checked records will be submitted to the backend.
                          </>
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-[11px] shrink-0 hidden md:inline">
                      {selectedRowIds.size} of {parsedRows.length} selected
                    </span>
                  </div>

                  {/* Master Table of Room Records */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-[46vh] scrollbar-thin">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50/90 text-slate-600 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={
                                  parsedRows.length > 0 &&
                                  parsedRows.every((r) => selectedRowIds.has(r.id))
                                }
                                onChange={() => {
                                  if (parsedRows.every((r) => selectedRowIds.has(r.id))) {
                                    handleDeselectAll();
                                  } else {
                                    handleSelectAll();
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#5B30D9] focus:ring-[#5B30D9] cursor-pointer"
                                title="Toggle All Rows"
                              />
                            </th>
                            <th className="py-2.5 px-3 w-16">Row #</th>
                            <th className="py-2.5 px-3 min-w-[200px]">Room Name</th>
                            <th className="py-2.5 px-3">Room Type</th>
                            <th className="py-2.5 px-3">Capacity</th>
                            <th className="py-2.5 px-3">Beds</th>
                            <th className="py-2.5 px-3 text-center">Rooms</th>
                            <th className="py-2.5 px-3">Price / Night</th>
                            <th className="py-2.5 px-3 min-w-[160px]">Amenities</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsedRows
                            .filter((r) => {
                              if (bulkSearch.trim()) {
                                const q = bulkSearch.toLowerCase();
                                const matchName = r.name.toLowerCase().includes(q);
                                const matchType = r.roomType.toLowerCase().includes(q);
                                const matchRow = String(r.originalRowNumber).includes(q);
                                if (!matchName && !matchType && !matchRow) return false;
                              }
                              if (bulkFilterMode === "SELECTED") return selectedRowIds.has(r.id);
                              if (bulkFilterMode === "EXCLUDED") return !selectedRowIds.has(r.id);
                              if (bulkFilterMode === "ERRORS") return !r.isValid || r.isDuplicate;
                              return true;
                            })
                            .map((row) => {
                              const isSelected = selectedRowIds.has(row.id);
                              return (
                                <tr
                                  key={row.id}
                                  onClick={() => toggleRowSelection(row.id)}
                                  className={`cursor-pointer transition select-none ${
                                    isSelected
                                      ? "bg-purple-50/70 hover:bg-purple-100/60 font-medium"
                                      : "hover:bg-slate-50 text-slate-500 opacity-80"
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td
                                    className="py-2 px-3 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleRowSelection(row.id)}
                                      className="w-4 h-4 rounded text-[#5B30D9] focus:ring-[#5B30D9] cursor-pointer"
                                    />
                                  </td>

                                  {/* Row Number */}
                                  <td className="py-2 px-3 font-bold text-slate-600">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                      Row {row.originalRowNumber}
                                    </span>
                                  </td>

                                  {/* Room Name & Desc */}
                                  <td className="py-2 px-3">
                                    <p className={`font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                      {row.name || <span className="text-rose-500 italic">Empty Name</span>}
                                    </p>
                                    {row.description && (
                                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                        {row.description}
                                      </p>
                                    )}
                                  </td>

                                  {/* Room Type */}
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                      {row.roomType}
                                    </span>
                                  </td>

                                  {/* Capacity */}
                                  <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                                    {row.adults} Adults{row.children > 0 ? `, ${row.children} Ch.` : ""}
                                  </td>

                                  {/* Beds */}
                                  <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                                    {row.beds}
                                  </td>

                                  {/* Total Rooms */}
                                  <td className="py-2 px-3 text-center font-bold text-slate-800">
                                    {row.totalRooms}
                                  </td>

                                  {/* Price */}
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="font-bold text-slate-900">₹{row.finalPrice?.toLocaleString("en-IN")}</span>
                                    {row.discountPercentage > 0 && (
                                      <span className="ml-1 text-[10px] text-emerald-600 font-bold">
                                        (-{row.discountPercentage}%)
                                      </span>
                                    )}
                                  </td>

                                  {/* Amenities */}
                                  <td className="py-2 px-3">
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {row.amenities.slice(0, 3).map((a, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600"
                                        >
                                          {a}
                                        </span>
                                      ))}
                                      {row.amenities.length > 3 && (
                                        <span className="text-[9px] text-slate-400">
                                          +{row.amenities.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-2 px-3 text-center whitespace-nowrap">
                                    {row.isValid && !row.isDuplicate ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        <Check className="w-3 h-3" /> Valid
                                      </span>
                                    ) : row.isDuplicate ? (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                                        title={row.errors.join("; ")}
                                      >
                                        <AlertTriangle className="w-3 h-3" /> Duplicate
                                      </span>
                                    ) : (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                        title={row.errors.join("; ")}
                                      >
                                        <XCircle className="w-3 h-3" /> Error
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                {parsedRows.length > 0 ? (
                  <span>
                    Selected: <strong className="text-[#5B30D9] font-bold">{selectedRowIds.size}</strong> of {parsedRows.length} rooms ({parsedRows.length - selectedRowIds.size} excluded)
                  </span>
                ) : (
                  <span>Upload a CSV file or download the template to begin</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold text-xs transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={selectedRowIds.size === 0 || isBulkSubmitting}
                  className="px-6 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isBulkSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing {selectedRowIds.size} Records...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Import Selected ({selectedRowIds.size}) Rooms</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
