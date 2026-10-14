"use client";

import React, { useState, useEffect } from "react";
import { hotelApi } from "../../lib/api";
import { useAuth } from "../../lib/authContext";
import { useToast } from "../Toast";
import {
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Loader2,
  Search,
  Filter,
  MapPin,
  Star,
  X,
  Phone,
  Mail,
  Clock,
  ShieldAlert,
  Sparkles,
  Image as ImageIcon,
  Compass,
  ExternalLink,
  Bed,
  Check,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  CheckCheck,
  Info,
  Crown,
  Layers,
} from "lucide-react";

export default function HotelsTab({
  hotels = [],
  onRefresh,
  searchQuery = "",
  onSelectHotelForRooms,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject Modal State
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Detail Modal State (6.3 Hotel Detail View)
  const [detailHotel, setDetailHotel] = useState(null);
  const [detailRooms, setDetailRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // 6.1 Hotel Registration Form State
  const initialHotelState = {
    name: "",
    description: "A premier hospitality destination offering luxurious accommodations, world-class amenities, and picturesque surroundings for leisure and business travelers.",
    hotelType: "HOTEL",
    address: "",
    city: "Goa",
    state: "Goa",
    country: "India",
    pincode: "403516",
    phone: "+91 98765 43210",
    email: "reservations@tripnest.com",
    latitude: "15.5494",
    longitude: "73.7535",
    checkIn: "14:00",
    checkOut: "11:00",
    cancellation: "Free cancellation up to 48 hours before check-in. Non-refundable thereafter.",
    childrenAllowed: true,
    petsAllowed: false,
    amenities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Air Conditioning", "Beach Access"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80"
    ],
  };

  const [newHotel, setNewHotel] = useState(initialHotelState);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const popularAmenities = [
    "Free Wi-Fi",
    "Swimming Pool",
    "Spa & Wellness",
    "Restaurant",
    "Air Conditioning",
    "Beach Access",
    "Fitness Center",
    "24/7 Front Desk",
    "Free Breakfast",
    "Parking",
    "Airport Shuttle",
    "Bar & Lounge",
  ];

  // Bulk Hotel Import State
  const [isBulkHotelImportOpen, setIsBulkHotelImportOpen] = useState(false);
  const [bulkHotelFile, setBulkHotelFile] = useState(null);
  const [parsedHotelRows, setParsedHotelRows] = useState([]);
  const [selectedHotelRowIds, setSelectedHotelRowIds] = useState(new Set());
  const [bulkHotelFilterMode, setBulkHotelFilterMode] = useState("ALL"); // "ALL" | "SELECTED" | "EXCLUDED" | "ERRORS"
  const [bulkHotelSearch, setBulkHotelSearch] = useState("");
  const [isBulkHotelSubmitting, setIsBulkHotelSubmitting] = useState(false);
  const [bulkHotelImportResult, setBulkHotelImportResult] = useState(null);

  // CSV Text Parser supporting quotes, commas, and newlines
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
        currentVal = "";
        if (row.length > 0 && row.some((c) => c !== "")) {
          lines.push(row);
        }
        row = [];
      } else {
        currentVal += char;
      }
    }

    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      if (row.some((c) => c !== "")) {
        lines.push(row);
      }
    }

    return lines;
  };

  const handleBulkHotelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkHotelFile(file);
    setBulkHotelImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const matrix = parseCSVText(text);

        if (!matrix || matrix.length < 2) {
          showToast("CSV file must contain a header row and at least 1 hotel record", "error");
          return;
        }

        const header = matrix[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const findCol = (keywords) =>
          header.findIndex((h) => keywords.some((k) => h.includes(k)));

        const nameIdx = findCol(["name", "hotelname", "title", "property"]);
        const typeIdx = findCol(["type", "hoteltype", "category"]);
        const descIdx = findCol(["description", "desc", "about"]);
        const addrIdx = findCol(["address", "street", "location"]);
        const cityIdx = findCol(["city", "town"]);
        const stateIdx = findCol(["state", "province"]);
        const countryIdx = findCol(["country"]);
        const pincodeIdx = findCol(["pincode", "zip", "postal"]);
        const phoneIdx = findCol(["phone", "contactphone", "mobile", "tel"]);
        const emailIdx = findCol(["email", "contactemail", "mail"]);
        const amenitiesIdx = findCol(["amenities", "facilities", "features"]);
        const checkInIdx = findCol(["checkin", "checkintime", "in"]);
        const checkOutIdx = findCol(["checkout", "checkouttime", "out"]);
        const cancellationIdx = findCol(["cancellation", "cancel", "refund"]);

        const parsed = [];
        const initialSelected = new Set();
        const seenNamesInFile = new Set();

        const validTypes = ["HOTEL", "RESORT", "VILLA", "HOMESTAY", "GUEST_HOUSE", "APARTMENT"];

        for (let i = 1; i < matrix.length; i++) {
          const rowVals = matrix[i];
          if (!rowVals || rowVals.length === 0 || rowVals.every((c) => !c)) continue;

          const rowNum = i + 1;
          const rowId = `hotel_row_${rowNum}`;

          const name = nameIdx !== -1 && rowVals[nameIdx] ? rowVals[nameIdx].trim() : `Hotel Row ${rowNum}`;
          const rawType = typeIdx !== -1 && rowVals[typeIdx] ? rowVals[typeIdx].trim().toUpperCase().replace(/\s+/g, "_") : "HOTEL";
          const hotelType = validTypes.includes(rawType) ? rawType : "HOTEL";
          const description = descIdx !== -1 && rowVals[descIdx] ? rowVals[descIdx].trim() : `Experience comfortable accommodations and warm hospitality at ${name}.`;
          const address = addrIdx !== -1 && rowVals[addrIdx] ? rowVals[addrIdx].trim() : "";
          const city = cityIdx !== -1 && rowVals[cityIdx] ? rowVals[cityIdx].trim() : "";
          const state = stateIdx !== -1 && rowVals[stateIdx] ? rowVals[stateIdx].trim() : "State";
          const country = countryIdx !== -1 && rowVals[countryIdx] ? rowVals[countryIdx].trim() : "India";
          const pincode = pincodeIdx !== -1 && rowVals[pincodeIdx] ? rowVals[pincodeIdx].trim() : "400001";
          const phone = phoneIdx !== -1 && rowVals[phoneIdx] ? rowVals[phoneIdx].trim() : "";
          const email = emailIdx !== -1 && rowVals[emailIdx] ? rowVals[emailIdx].trim() : "";
          const amenities = amenitiesIdx !== -1 && rowVals[amenitiesIdx] ? rowVals[amenitiesIdx].trim() : "Free Wi-Fi, Parking, Air Conditioning";
          const checkIn = checkInIdx !== -1 && rowVals[checkInIdx] ? rowVals[checkInIdx].trim() : "14:00";
          const checkOut = checkOutIdx !== -1 && rowVals[checkOutIdx] ? rowVals[checkOutIdx].trim() : "11:00";
          const cancellation = cancellationIdx !== -1 && rowVals[cancellationIdx] ? rowVals[cancellationIdx].trim() : "Free cancellation up to 48 hours before check-in.";

          // Validation
          const errors = [];
          if (!name || name.length < 3) errors.push("Name must be at least 3 characters");
          if (!city) errors.push("City is required");
          if (!address) errors.push("Address is required");

          const dupKey = `${name.toLowerCase()}:::${city.toLowerCase()}`;
          const isDupInFile = seenNamesInFile.has(dupKey);
          if (isDupInFile) {
            errors.push("Duplicate hotel in file (same name & city)");
          }
          seenNamesInFile.add(dupKey);

          const isDupExisting = (hotels || []).some(
            (h) =>
              (h.name || "").toLowerCase() === name.toLowerCase() &&
              (h.location?.city || h.city || "").toLowerCase() === city.toLowerCase()
          );
          if (isDupExisting) {
            errors.push("Hotel already exists in database");
          }

          const isValid = errors.length === 0;

          parsed.push({
            id: rowId,
            originalRowNumber: rowNum,
            name,
            hotelType,
            description,
            address,
            city,
            state,
            country,
            pincode,
            phone,
            email,
            amenities,
            checkIn,
            checkOut,
            cancellation,
            isValid,
            errors,
            isDuplicate: isDupInFile || isDupExisting,
          });

          if (isValid) {
            initialSelected.add(rowId);
          }
        }

        setParsedHotelRows(parsed);
        setSelectedHotelRowIds(initialSelected);
        showToast(`Loaded ${parsed.length} hotel records from CSV!`, "success");
      } catch (err) {
        console.error("Error parsing CSV:", err);
        showToast("Failed to parse CSV file. Please check format.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleHotelRowSelection = (rowId) => {
    setSelectedHotelRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleSelectAllHotels = () => {
    const allIds = new Set(parsedHotelRows.map((r) => r.id));
    setSelectedHotelRowIds(allIds);
  };

  const handleDeselectAllHotels = () => {
    setSelectedHotelRowIds(new Set());
  };

  const handleSelectAllValidHotels = () => {
    const validIds = new Set(
      parsedHotelRows.filter((r) => r.isValid && !r.isDuplicate).map((r) => r.id)
    );
    setSelectedHotelRowIds(validIds);
  };

  const handleDownloadSampleHotelCSV = () => {
    const csvUrl = "/sample_hotels.csv";
    const link = document.createElement("a");
    link.href = csvUrl;
    link.setAttribute("download", "sample_hotels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded sample_hotels.csv template!", "success");
  };

  const handleBulkHotelSubmit = async () => {
    const selectedRowsList = parsedHotelRows.filter((r) => selectedHotelRowIds.has(r.id));
    if (selectedRowsList.length === 0) {
      showToast("No hotels selected! Please check at least one hotel row to import.", "error");
      return;
    }

    setIsBulkHotelSubmitting(true);
    setBulkHotelImportResult(null);

    try {
      const payload = selectedRowsList.map((r) => ({
        name: r.name,
        hotelType: r.hotelType,
        description: r.description,
        address: r.address,
        city: r.city,
        state: r.state,
        country: r.country,
        pincode: r.pincode,
        phone: r.phone,
        email: r.email,
        amenities: r.amenities,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        cancellation: r.cancellation,
        originalRow: r.originalRowNumber,
      }));

      const res = await hotelApi.bulkCreateHotels(payload);
      const resultData = res?.data || res;
      setBulkHotelImportResult(resultData);

      showToast(
        `Successfully imported ${resultData.insertedCount || selectedRowsList.length} hotel properties!`,
        "success"
      );

      // Refresh hotels
      if (onRefresh) onRefresh();

      // Clear imported selection
      setSelectedHotelRowIds(new Set());
    } catch (err) {
      console.error("Bulk hotel import failed:", err);
      showToast(
        typeof err === "string" ? err : err.message || "Bulk hotel import failed",
        "error"
      );
    } finally {
      setIsBulkHotelSubmitting(false);
    }
  };

  const isMyHotel = (h) => {
    if (!user) return false;
    const currentUserId = String(user._id || user.id || "");
    const currentUserEmail = (user.email || "").toLowerCase().trim();

    const ownerId = h.owner
      ? String(h.owner._id || h.owner.id || (typeof h.owner === "string" ? h.owner : ""))
      : "";
    const ownerEmail = (h.owner?.email || "").toLowerCase().trim();
    const contactEmail = (h.contact?.email || "").toLowerCase().trim();

    if (currentUserId && ownerId && currentUserId === ownerId) return true;
    if (currentUserEmail && (ownerEmail === currentUserEmail || contactEmail === currentUserEmail)) return true;
    return false;
  };

  const filteredHotels = (hotels || []).filter((h) => {
    let matchesStatus = false;
    if (statusFilter === "ALL") {
      matchesStatus = true;
    } else if (statusFilter === "MY PROPERTIES") {
      matchesStatus = isMyHotel(h);
    } else {
      matchesStatus = h.status === statusFilter;
    }

    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus;

    const name = (h.name || "").toLowerCase();
    const city = (h.location?.city || h.city || "").toLowerCase();
    const state = (h.location?.state || h.state || "").toLowerCase();
    const type = (h.hotelType || "").toLowerCase();

    return matchesStatus && (name.includes(term) || city.includes(term) || state.includes(term) || type.includes(term));
  });

  // 6.2 Approval Workflow Handlers
  const handleApproveHotel = async (hotelId) => {
    try {
      setActionLoadingId(hotelId);
      await hotelApi.approve(hotelId);
      showToast("Hotel property approved successfully! Status: APPROVED", "success");
      if (detailHotel && detailHotel._id === hotelId) {
        setDetailHotel((prev) => ({ ...prev, status: "APPROVED" }));
      }
      onRefresh();
    } catch (err) {
      showToast("Approval error: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (hotel) => {
    setRejectModalData(hotel);
    setRejectionReason("Documentation incomplete or property standards unmet.");
  };

  const handleConfirmReject = async () => {
    if (!rejectModalData) return;
    try {
      setActionLoadingId(rejectModalData._id);
      await hotelApi.reject(rejectModalData._id, rejectionReason || "Policy requirements unmet");
      showToast("Hotel property rejected. Status: REJECTED", "info");
      if (detailHotel && detailHotel._id === rejectModalData._id) {
        setDetailHotel((prev) => ({ ...prev, status: "REJECTED", rejectionReason }));
      }
      setRejectModalData(null);
      onRefresh();
    } catch (err) {
      showToast("Rejection error: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockHotel = async (hotelId) => {
    if (!confirm("Are you sure you want to BLOCK this hotel listing? Travelers will not be able to book rooms.")) {
      return;
    }
    try {
      setActionLoadingId(hotelId);
      await hotelApi.block(hotelId);
      showToast("Hotel property blocked. Status: BLOCKED", "warning");
      if (detailHotel && detailHotel._id === hotelId) {
        setDetailHotel((prev) => ({ ...prev, status: "BLOCKED" }));
      }
      onRefresh();
    } catch (err) {
      showToast("Block error: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6.3 Open Hotel Detail Modal
  const handleOpenDetailModal = async (hotel) => {
    setDetailHotel(hotel);
    setActiveGalleryIndex(0);
    try {
      setLoadingRooms(true);
      const res = await hotelApi.getRoomsByHotel(hotel._id);
      setDetailRooms(res.data || res || []);
    } catch (err) {
      console.error("Failed to load rooms for hotel detail:", err);
      setDetailRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // 6.1 Hotel Registration Handler
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newHotel.name.trim(),
        description: newHotel.description.trim(),
        hotelType: newHotel.hotelType,
        address: newHotel.address.trim(),
        city: newHotel.city.trim(),
        state: newHotel.state.trim(),
        country: newHotel.country.trim() || "India",
        pincode: newHotel.pincode.trim(),
        phone: newHotel.phone.trim(),
        email: newHotel.email.trim(),
        latitude: newHotel.latitude ? Number(newHotel.latitude) : undefined,
        longitude: newHotel.longitude ? Number(newHotel.longitude) : undefined,
        checkIn: newHotel.checkIn,
        checkOut: newHotel.checkOut,
        cancellation: newHotel.cancellation,
        childrenAllowed: Boolean(newHotel.childrenAllowed),
        petsAllowed: Boolean(newHotel.petsAllowed),
        amenities: newHotel.amenities,
        images: newHotel.images.filter((img) => img.trim().length > 0),
      };

      await hotelApi.create(payload);
      showToast("Hotel property registered successfully! Submitted for approval.", "success");
      setIsAddHotelOpen(false);
      setNewHotel(initialHotelState);
      setStatusFilter("PENDING");
      onRefresh();
    } catch (err) {
      showToast("Failed to register hotel: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (item) => {
    if (newHotel.amenities.includes(item)) {
      setNewHotel({
        ...newHotel,
        amenities: newHotel.amenities.filter((a) => a !== item),
      });
    } else {
      setNewHotel({
        ...newHotel,
        amenities: [...newHotel.amenities, item],
      });
    }
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !newHotel.amenities.includes(trimmed)) {
      setNewHotel({
        ...newHotel,
        amenities: [...newHotel.amenities, trimmed],
      });
      setCustomAmenity("");
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (trimmed && !newHotel.images.includes(trimmed)) {
      setNewHotel({
        ...newHotel,
        images: [...newHotel.images, trimmed],
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
        setNewHotel((prev) => ({
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
        setNewHotel((prev) => ({
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
    setNewHotel({
      ...newHotel,
      images: newHotel.images.filter((_, i) => i !== index),
    });
  };

  const loadPresetGallery = () => {
    setNewHotel((prev) => ({
      ...prev,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
      ],
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Hotel Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hotel listings, approval workflows, and property configurations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm">
            {["ALL", "APPROVED", "PENDING", "REJECTED", "BLOCKED", "MY PROPERTIES"].map((st) => {
              const count =
                st === "ALL"
                  ? (hotels || []).length
                  : st === "MY PROPERTIES"
                  ? (hotels || []).filter(isMyHotel).length
                  : (hotels || []).filter((h) => h.status === st).length;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    statusFilter === st
                      ? "bg-[#5B30D9] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#5B30D9] hover:bg-purple-50/70"
                  }`}
                >
                  <span>{st === "MY PROPERTIES" ? "My Properties" : st}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        statusFilter === st
                          ? "bg-white/20 text-white"
                          : st === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : st === "MY PROPERTIES"
                          ? "bg-purple-100 text-[#5B30D9]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsBulkHotelImportOpen(true);
                setBulkHotelImportResult(null);
              }}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk Import CSV / Excel</span>
            </button>
            <button
              onClick={() => setIsAddHotelOpen(true)}
              className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Hotel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Listings Table (Clean White Card) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3.5">Property &amp; Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Contact &amp; Timings</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Approval Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHotels && filteredHotels.length > 0 ? (
                filteredHotels.map((h) => {
                  const isActing = actionLoadingId === h._id;
                  const thumb =
                    (Array.isArray(h.images) && h.images[0]?.url) ||
                    (typeof h.images?.[0] === "string" ? h.images[0] : null) ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80";

                  return (
                    <tr key={h._id} className="hover:bg-slate-50/80 transition">
                      {/* Property */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={h.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                              <span>{h.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#5B30D9] border border-purple-200/80">
                                {h.hotelType || "HOTEL"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                              {h.description || "Luxury stay accommodation"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#5B30D9] shrink-0" />
                          <span>
                            {h.location?.city || h.city}, {h.location?.state || h.state}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-4.5 line-clamp-1 max-w-xs">
                          {h.location?.address || h.address || "Main Road"}
                        </div>
                      </td>

                      {/* Contact & Hours */}
                      <td className="p-3.5">
                        <div className="text-slate-700 font-medium text-xs">
                          {h.contact?.phone || h.phone || "N/A"}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>In: {h.policies?.checkIn || h.checkIn || "14:00"}</span>
                          <span>•</span>
                          <span>Out: {h.policies?.checkOut || h.checkOut || "11:00"}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="p-3.5">
                        <div className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{h.rating || 4.5}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({h.totalReviews || 0})
                          </span>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            h.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : h.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : h.status === "BLOCKED"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              h.status === "APPROVED"
                                ? "bg-emerald-500"
                                : h.status === "PENDING"
                                ? "bg-amber-500"
                                : h.status === "BLOCKED"
                                ? "bg-slate-400"
                                : "bg-rose-500"
                            }`}
                          />
                          {h.status || "PENDING"}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#5B30D9]" />
                          ) : (
                            <>
                              {/* Detail Inspection Button */}
                              <button
                                onClick={() => handleOpenDetailModal(h)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                                title="View Hotel Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#5B30D9]" />
                                <span>Details</span>
                              </button>

                              {/* Rooms Management Button */}
                              {h.status === "APPROVED" && onSelectHotelForRooms && (
                                <button
                                  onClick={() => onSelectHotelForRooms(h)}
                                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] border border-purple-200 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                                  title="Manage Rooms & Tariffs"
                                >
                                  <Bed className="w-3.5 h-3.5 text-[#5B30D9]" />
                                  <span>Rooms</span>
                                </button>
                              )}

                              {/* Super Admin Approval Workflow Buttons */}
                              {user?.role === "SUPER_ADMIN" ? (
                                <>
                                  {h.status !== "APPROVED" && (
                                    <button
                                      onClick={() => handleApproveHotel(h._id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition inline-flex items-center gap-1"
                                      title="Approve Property"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                  )}

                                  {h.status !== "REJECTED" && (
                                    <button
                                      onClick={() => handleOpenRejectModal(h)}
                                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                                      title="Reject Property with Reason"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  )}

                                  {h.status !== "BLOCKED" && (
                                    <button
                                      onClick={() => handleBlockHotel(h._id)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                                      title="Block Property"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      <span>Block</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                h.status === "PENDING" && (
                                  <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                                    Under Review
                                  </span>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No hotel listings found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your filter or click &quot;Register Hotel&quot; to onboard an accommodation.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6.3 HOTEL DETAIL PAGE / MODAL (Executive Inspection View) */}
      {/* ========================================================= */}
      {detailHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200/80 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailHotel(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-[#5B30D9] border border-purple-200">
                    {detailHotel.hotelType || "HOTEL"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      detailHotel.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : detailHotel.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : detailHotel.status === "BLOCKED"
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {detailHotel.status || "PENDING"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#5B30D9]" />
                  {detailHotel.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#5B30D9]" />
                    {detailHotel.location?.city || detailHotel.city}, {detailHotel.location?.state || detailHotel.state}, {detailHotel.location?.country || detailHotel.country || "India"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {detailHotel.rating || 4.5} ({detailHotel.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {detailHotel.status !== "APPROVED" && (
                  <button
                    onClick={() => handleApproveHotel(detailHotel._id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}
                {detailHotel.status !== "REJECTED" && (
                  <button
                    onClick={() => handleOpenRejectModal(detailHotel)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                {detailHotel.status !== "BLOCKED" && (
                  <button
                    onClick={() => handleBlockHotel(detailHotel._id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Block</span>
                  </button>
                )}
              </div>
            </div>

            {/* Gallery of Hotel Images */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#5B30D9]" />
                Hotel Image Gallery
              </h4>
              {Array.isArray(detailHotel.images) && detailHotel.images.length > 0 ? (
                <div>
                  <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img
                      src={
                        detailHotel.images[activeGalleryIndex]?.url ||
                        (typeof detailHotel.images[activeGalleryIndex] === "string"
                          ? detailHotel.images[activeGalleryIndex]
                          : detailHotel.images[0]?.url)
                      }
                      alt={detailHotel.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pt-2.5 pb-1">
                    {detailHotel.images.map((img, idx) => {
                      const url = img?.url || (typeof img === "string" ? img : null);
                      if (!url) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={`w-16 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                            activeGalleryIndex === idx
                              ? "border-[#5B30D9] scale-105 shadow-md shadow-[#5B30D9]/25"
                              : "border-slate-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No images uploaded for this hotel
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* Left Column: Description & Location */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Property Description
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    {detailHotel.description || "No description provided."}
                  </p>
                </div>

                {/* Location & GPS */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#5B30D9]" />
                    Location & GPS Coordinates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Street Address:</span>
                      <span className="font-semibold text-slate-800">
                        {detailHotel.location?.address || detailHotel.address || "Main Road"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pincode / Zip:</span>
                      <span className="font-semibold text-slate-800">
                        {detailHotel.location?.pincode || detailHotel.pincode || "403516"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Latitude:</span>
                      <span className="font-mono text-[#5B30D9] font-semibold">
                        {detailHotel.location?.coordinates?.latitude ||
                          detailHotel.location?.coordinates?.[1] ||
                          detailHotel.latitude ||
                          "15.5494"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Longitude:</span>
                      <span className="font-mono text-[#5B30D9] font-semibold">
                        {detailHotel.location?.coordinates?.longitude ||
                          detailHotel.location?.coordinates?.[0] ||
                          detailHotel.longitude ||
                          "73.7535"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Amenities & Facilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(detailHotel.amenities) ? detailHotel.amenities : []).map(
                      (am, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-50 text-[#5B30D9] text-xs rounded-xl border border-purple-200 font-medium"
                        >
                          ✓ {typeof am === "string" ? am : am?.name || ""}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Contact, Timings & Policies */}
              <div className="space-y-4">
                {/* Contact */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Contact Information
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-[#5B30D9]" />
                    <span>{detailHotel.contact?.phone || detailHotel.phone || "+91 98765 43210"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-[#5B30D9]" />
                    <span>{detailHotel.contact?.email || detailHotel.email || "partner@tripnest.com"}</span>
                  </div>
                </div>

                {/* Policies */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Check-in & Policies
                  </h4>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">Check-In:</span>
                    <span className="font-semibold">{detailHotel.policies?.checkIn || detailHotel.checkIn || "14:00"}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-400">Check-Out:</span>
                    <span className="font-semibold">{detailHotel.policies?.checkOut || detailHotel.checkOut || "11:00"}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                    <span className="text-slate-700 font-semibold block mb-0.5">Cancellation Policy:</span>
                    {detailHotel.policies?.cancellation || "Free cancellation up to 48 hours before check-in."}
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-[11px]">
                    <span className="text-slate-500">
                      Children:{" "}
                      <strong className="text-emerald-600">
                        {detailHotel.policies?.childrenAllowed ?? true ? "Allowed" : "Not Allowed"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Pets:{" "}
                      <strong className="text-slate-700">
                        {detailHotel.policies?.petsAllowed ? "Allowed" : "No Pets"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Manage Rooms Action Shortcut */}
                {onSelectHotelForRooms && (
                  <button
                    onClick={() => {
                      onSelectHotelForRooms(detailHotel);
                      setDetailHotel(null);
                    }}
                    className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] border border-purple-200 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Bed className="w-4 h-4 text-[#5B30D9]" />
                    <span>Manage Rooms for this Hotel →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Available Room Types in this Hotel */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#5B30D9]" />
                  Available Room Types ({detailRooms.length})
                </h4>
                {onSelectHotelForRooms && (
                  <button
                    onClick={() => {
                      onSelectHotelForRooms(detailHotel);
                      setDetailHotel(null);
                    }}
                    className="text-xs text-[#5B30D9] hover:text-[#4C24B8] font-bold transition flex items-center gap-1"
                  >
                    <span>+ Add New Room</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loadingRooms ? (
                <div className="p-6 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#5B30D9]" />
                  <span className="text-xs">Loading rooms...</span>
                </div>
              ) : detailRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {detailRooms.map((room) => (
                    <div
                      key={room._id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#5B30D9] border border-purple-200">
                          {room.roomType}
                        </span>
                        <span className="text-xs font-black text-[#5B30D9]">
                          ₹{(room.finalPrice || room.basePrice || 0).toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-400">/night</span>
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs">{room.name}</h5>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Max {room.capacity?.adults || room.adults || 2} Adults</span>
                        <span>•</span>
                        <span>{room.totalRooms || 5} Inventory</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                  No rooms have been added to this hotel yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6.2 REJECT HOTEL REASON MODAL */}
      {/* ========================================================= */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setRejectModalData(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black mb-1 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Reject Property Listing
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Property: <strong className="text-slate-900">{rejectModalData.name}</strong>. Provide an official reason for rejection to send to the partner.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Inadequate licensing documentation, pricing inconsistency, or missing high-resolution property imagery."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoadingId === rejectModalData._id}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition disabled:opacity-50"
                >
                  {actionLoadingId === rejectModalData._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6.1 HOTEL REGISTRATION MODAL */}
      {/* ========================================================= */}
      {isAddHotelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddHotelOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#5B30D9]" />
                Hotel Registration Form
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Submit comprehensive hotel property information, contact details, geolocation coordinates, policies, and photos.
            </p>

            {/* CSV / Excel Bulk Upload Banner */}
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Have multiple hotels to onboard?
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Upload an Excel or CSV file to register multiple hotel properties at once.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddHotelOpen(false);
                  setIsBulkHotelImportOpen(true);
                  setBulkHotelImportResult(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV / Excel</span>
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-4 text-xs">
              {/* Hotel Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hotel / Resort Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Grand Azure Oceanfront Resort"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25 focus:border-[#5B30D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hotel Type *</label>
                  <select
                    value={newHotel.hotelType}
                    onChange={(e) => setNewHotel({ ...newHotel, hotelType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    <option value="HOTEL">HOTEL</option>
                    <option value="RESORT">RESORT</option>
                    <option value="VILLA">VILLA</option>
                    <option value="APARTMENT">APARTMENT</option>
                    <option value="GUEST_HOUSE">GUEST HOUSE</option>
                    <option value="HOMESTAY">HOMESTAY</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotel Description * (Min 20 chars)</label>
                <textarea
                  rows={2}
                  required
                  value={newHotel.description}
                  onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25 leading-relaxed"
                />
              </div>

              {/* Address & City/State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calangute Baga Road, Beachside Lane"
                    value={newHotel.address}
                    onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newHotel.city}
                    onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newHotel.state}
                    onChange={(e) => setNewHotel({ ...newHotel, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newHotel.pincode}
                    onChange={(e) => setNewHotel({ ...newHotel, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newHotel.phone}
                    onChange={(e) => setNewHotel({ ...newHotel, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="reservations@hotel.com"
                    value={newHotel.email}
                    onChange={(e) => setNewHotel({ ...newHotel, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              {/* Coordinates (Lat / Long) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude (for Maps)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="15.5494"
                    value={newHotel.latitude}
                    onChange={(e) => setNewHotel({ ...newHotel, latitude: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude (for Maps)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="73.7535"
                    value={newHotel.longitude}
                    onChange={(e) => setNewHotel({ ...newHotel, longitude: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              {/* Check-in / Check-out & Policies */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={newHotel.checkIn}
                    onChange={(e) => setNewHotel({ ...newHotel, checkIn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Time</label>
                  <input
                    type="text"
                    value={newHotel.checkOut}
                    onChange={(e) => setNewHotel({ ...newHotel, checkOut: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="childrenAllowed"
                    checked={newHotel.childrenAllowed}
                    onChange={(e) => setNewHotel({ ...newHotel, childrenAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B30D9] accent-[#5B30D9] border-slate-300"
                  />
                  <label htmlFor="childrenAllowed" className="font-bold text-slate-700">
                    Children Allowed
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="petsAllowed"
                    checked={newHotel.petsAllowed}
                    onChange={(e) => setNewHotel({ ...newHotel, petsAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B30D9] accent-[#5B30D9] border-slate-300"
                  />
                  <label htmlFor="petsAllowed" className="font-bold text-slate-700">
                    Pet Friendly
                  </label>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cancellation Policy</label>
                <input
                  type="text"
                  value={newHotel.cancellation}
                  onChange={(e) => setNewHotel({ ...newHotel, cancellation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Amenities (Select or add custom)</label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {popularAmenities.map((am) => {
                    const isSelected = newHotel.amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleAmenity(am)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#5B30D9] text-white shadow-sm shadow-[#5B30D9]/25"
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

              {/* Multiple Hotel Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">
                    Multiple Hotel Images ({newHotel.images.length})
                  </label>
                  <button
                    type="button"
                    onClick={loadPresetGallery}
                    className="text-[11px] text-[#5B30D9] hover:text-[#4C24B8] font-semibold"
                  >
                    Load Sample HD Gallery
                  </button>
                </div>

                {/* Thumbnails preview */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {newHotel.images.map((img, i) => (
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

                <div className="flex gap-2">
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
                    className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] font-bold rounded-xl border border-purple-200"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddHotelOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#5B30D9]/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* ================================================== */}
      {/* BULK HOTEL IMPORT MODAL (CSV / EXCEL) */}
      {/* ================================================== */}
      {isBulkHotelImportOpen && (
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
                      Bulk Hotel Property Registration &amp; Flexible Selection
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#5B30D9]">
                      CSV / Excel
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Upload your hotel catalog to inspect, validate, and onboard multiple accommodations in bulk.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleHotelCSV}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                  title="Download Sample Hotel CSV Template"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Sample CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkHotelImportOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-3xl p-5 text-center transition bg-slate-50/50 hover:bg-emerald-50/20 group">
                <input
                  type="file"
                  id="bulkHotelFileInput"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleBulkHotelFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="bulkHotelFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      {bulkHotelFile ? bulkHotelFile.name : "Click to browse or drop your Hotel CSV file here"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Supports .csv or .xlsx (format: name, hotelType, description, address, city, state, country, pincode, phone, email, amenities)
                    </span>
                  </div>
                  {bulkHotelFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full mt-1">
                      <CheckCircle2 className="w-3 h-3" /> File loaded ({parsedHotelRows.length} rows detected)
                    </span>
                  )}
                </label>
              </div>

              {/* Success Result Banner */}
              {bulkHotelImportResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">
                        Successfully imported {bulkHotelImportResult.insertedCount || 0} hotel properties!
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Hotels have been added and registered under your account. You can now configure rooms for them.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkHotelImportOpen(false);
                      setBulkHotelImportResult(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    Close &amp; View Hotels
                  </button>
                </div>
              )}

              {/* Data Table Preview & Selection */}
              {parsedHotelRows.length > 0 && (
                <div className="space-y-4">
                  {/* Stats & Selection Controls Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {selectedHotelRowIds.size} of {parsedHotelRows.length} Selected
                      </span>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleSelectAllHotels}
                        className="text-xs font-bold text-[#5B30D9] hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllHotels}
                        className="text-xs font-bold text-slate-600 hover:underline"
                      >
                        Deselect All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleSelectAllValidHotels}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Select Valid Only
                      </button>
                    </div>

                    {/* Filter Mode & Search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        {["ALL", "SELECTED", "EXCLUDED", "ERRORS"].map((mode) => {
                          const count =
                            mode === "ALL"
                              ? parsedHotelRows.length
                              : mode === "SELECTED"
                              ? selectedHotelRowIds.size
                              : mode === "EXCLUDED"
                              ? parsedHotelRows.length - selectedHotelRowIds.size
                              : parsedHotelRows.filter((r) => !r.isValid || r.isDuplicate).length;

                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setBulkHotelFilterMode(mode)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                                bulkHotelFilterMode === mode
                                  ? "bg-[#5B30D9] text-white"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <span>{mode}</span>
                              <span
                                className={`text-[9px] px-1 rounded-full ${
                                  bulkHotelFilterMode === mode
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search hotels..."
                          value={bulkHotelSearch}
                          onChange={(e) => setBulkHotelSearch(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-36 sm:w-48"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                parsedHotelRows.length > 0 &&
                                selectedHotelRowIds.size === parsedHotelRows.length
                              }
                              onChange={(e) => {
                                if (e.target.checked) handleSelectAllHotels();
                                else handleDeselectAllHotels();
                              }}
                              className="w-4 h-4 rounded text-[#5B30D9] accent-[#5B30D9] cursor-pointer"
                            />
                          </th>
                          <th className="p-3 w-14">Row</th>
                          <th className="p-3">Hotel Property Name</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Status / Validation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedHotelRows
                          .filter((row) => {
                            if (bulkHotelFilterMode === "SELECTED" && !selectedHotelRowIds.has(row.id)) return false;
                            if (bulkHotelFilterMode === "EXCLUDED" && selectedHotelRowIds.has(row.id)) return false;
                            if (bulkHotelFilterMode === "ERRORS" && row.isValid && !row.isDuplicate) return false;
                            if (bulkHotelSearch) {
                              const q = bulkHotelSearch.toLowerCase().trim();
                              const matchName = (row.name || "").toLowerCase().includes(q);
                              const matchCity = (row.city || "").toLowerCase().includes(q);
                              const matchType = (row.hotelType || "").toLowerCase().includes(q);
                              if (!matchName && !matchCity && !matchType) return false;
                            }
                            return true;
                          })
                          .map((r) => {
                            const isSelected = selectedHotelRowIds.has(r.id);
                            return (
                              <tr
                                key={r.id}
                                className={`transition ${
                                  isSelected ? "bg-purple-50/40" : "hover:bg-slate-50/70"
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleHotelRowSelection(r.id)}
                                    className="w-4 h-4 rounded text-[#5B30D9] accent-[#5B30D9] cursor-pointer"
                                  />
                                </td>
                                <td className="p-3 font-mono text-[11px] text-slate-400">
                                  #{r.originalRowNumber}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{r.name}</span>
                                  {r.description && (
                                    <span className="text-[10px] text-slate-400 line-clamp-1">
                                      {r.description}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-[#5B30D9] border border-purple-200">
                                    {r.hotelType}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-slate-800 font-medium block">
                                    {r.city}, {r.state}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate block max-w-xs">
                                    {r.address}
                                  </span>
                                </td>
                                <td className="p-3 text-[11px] text-slate-600">
                                  {r.phone && <div>{r.phone}</div>}
                                  {r.email && <div className="text-slate-400 text-[10px]">{r.email}</div>}
                                </td>
                                <td className="p-3">
                                  {r.isValid && !r.isDuplicate ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Valid
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                                      title={r.errors?.join("; ") || "Invalid data"}
                                    >
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      {r.errors?.[0] || "Invalid"}
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
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                {selectedHotelRowIds.size > 0 ? (
                  <>
                    Ready to import <strong className="text-slate-800 font-bold">{selectedHotelRowIds.size}</strong> hotel properties into your account.
                  </>
                ) : (
                  "Select at least 1 hotel to proceed with import."
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkHotelImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleBulkHotelSubmit}
                  disabled={isBulkHotelSubmitting || selectedHotelRowIds.size === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isBulkHotelSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing Hotels...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import {selectedHotelRowIds.size} Selected Hotel(s)</span>
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
