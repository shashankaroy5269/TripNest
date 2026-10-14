const Inquiry = require("../models/inquiry.model");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a customer inquiry
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, message, destination, guests, contactMethod } = req.body;

  if (!name || !phone || !message) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: "Name, phone number, and message are required.",
    });
  }

  const inquiry = await Inquiry.create({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : "",
    message: message.trim(),
    destination: destination || "India Escapes",
    guests: Number(guests) || 2,
    contactMethod: contactMethod || "WHATSAPP",
    status: "PENDING",
  });

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Inquiry received with honor! Our team will contact you shortly.",
    data: inquiry,
  });
});

// @desc    Get all inquiries with filter & stats
// @route   GET /api/inquiries
// @access  Private (Admins & Staff)
exports.getAllInquiries = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = {};
  if (status && status !== "ALL") {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { phone: regex }, { email: regex }, { message: regex }];
  }

  const inquiries = await Inquiry.find(query)
    .populate("resolvedBy", "name email role")
    .sort({ createdAt: -1 });

  // Calculate quick stats
  const total = await Inquiry.countDocuments();
  const pending = await Inquiry.countDocuments({ status: "PENDING" });
  const contacted = await Inquiry.countDocuments({ status: "CONTACTED" });
  const resolved = await Inquiry.countDocuments({ status: "RESOLVED" });

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Inquiries retrieved successfully",
    data: inquiries,
    meta: {
      stats: {
        total,
        pending,
        contacted,
        resolved,
      },
    },
  });
});

// @desc    Update inquiry status or add admin notes
// @route   PATCH /api/inquiries/:id
// @access  Private (Admins & Staff)
exports.updateInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const inquiry = await Inquiry.findById(id);
  if (!inquiry) {
    return ApiResponse.error(res, {
      statusCode: 404,
      message: "Inquiry record not found",
    });
  }

  if (status) {
    inquiry.status = status;
    if (status === "RESOLVED") {
      inquiry.resolvedBy = req.user?._id || null;
      inquiry.resolvedAt = new Date();
    }
  }

  if (adminNotes !== undefined) {
    inquiry.adminNotes = adminNotes;
  }

  await inquiry.save();
  await inquiry.populate("resolvedBy", "name email role");

  return ApiResponse.success(res, {
    statusCode: 200,
    message: `Inquiry status updated to ${inquiry.status}`,
    data: inquiry,
  });
});

// @desc    Delete inquiry record
// @route   DELETE /api/inquiries/:id
// @access  Private (Super Admin)
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inquiry = await Inquiry.findByIdAndDelete(id);
  if (!inquiry) {
    return ApiResponse.error(res, {
      statusCode: 404,
      message: "Inquiry record not found",
    });
  }

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Inquiry record removed successfully",
    data: null,
  });
});
