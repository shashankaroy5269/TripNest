const httpStatus =
  require("http-status-codes");

  const cloudinary =
  require("../config/cloudinary");

const hotelRepository =
  require(
    "../repositories/hotel.repository"
  );

const AppError =
  require("../utils/appError");

const {
  HOTEL_STATUS
} =
  require("../models/hotel.model");


class HotelService {

  // ==================================================
  // CREATE HOTEL
  // ==================================================

  async createHotel(
    ownerId,
    data
  ) {

    const hotel =
      await hotelRepository.create({

        name: data.name,

        description:
          data.description,

        hotelType:
          data.hotelType,

        owner:
          ownerId,

        location: {

          address:
            data.address,

          city:
            data.city,

          state:
            data.state,

          country:
            data.country || "India",

          pincode:
            data.pincode,

          coordinates: {

            latitude:
              data.latitude,

            longitude:
              data.longitude

          }

        },

        contact: {
          phone: data.phone || data.contactPhone || "",
          email: data.email || data.contactEmail || ""
        },

        amenities:
          data.amenities || [],

        policies: {

          checkIn:
            data.checkIn ||
            "12:00 PM",

          checkOut:
            data.checkOut ||
            "11:00 AM",

          cancellation:
            data.cancellation || "",

          childrenAllowed:
            data.childrenAllowed ??
            true,

          petsAllowed:
            data.petsAllowed ??
            false

        },

        images: Array.isArray(data.images) && data.images.length > 0
          ? data.images.map((img, idx) =>
              typeof img === "string"
                ? { url: img, publicId: `hotel_img_${Date.now()}_${idx}` }
                : img
            )
          : [
              {
                url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                publicId: "default_hotel_1"
              },
              {
                url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                publicId: "default_hotel_2"
              }
            ],

        status:
          HOTEL_STATUS.PENDING

      });

    return hotel;
  }


  // ==================================================
  // GET HOTEL
  // ==================================================

  async getHotel(
    hotelId
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    return hotel;
  }


  // ==================================================
  // GET MY HOTELS
  // ==================================================

  async getMyHotels(
    ownerId
  ) {

    return hotelRepository
      .findByOwner(
        ownerId
      );
  }


  // ==================================================
  // GET ALL HOTELS
  // ==================================================

  async getAllHotels(
    queryParams = {},
    isAdmin = false
  ) {

    const filter = {};

    if (!isAdmin) {
      filter.status = HOTEL_STATUS.APPROVED;
    } else if (queryParams.status) {
      filter.status = queryParams.status;
    }

    if (queryParams.city) {
      filter["location.city"] = {
        $regex: new RegExp(queryParams.city.trim(), "i")
      };
    }

    if (queryParams.search) {
      const regex = new RegExp(queryParams.search.trim(), "i");
      filter.$or = [
        { name: regex },
        { "location.city": regex },
        { "location.state": regex },
        { "location.address": regex },
        { description: regex }
      ];
    }

    if (queryParams.hotelType) {
      const types = Array.isArray(queryParams.hotelType)
        ? queryParams.hotelType
        : queryParams.hotelType.split(",");
      filter.hotelType = {
        $in: types.map((t) => t.trim().toLowerCase())
      };
    }

    if (queryParams.rating) {
      filter.rating = {
        $gte: Number(queryParams.rating)
      };
    }

    if (queryParams.amenities) {
      const amenitiesList = Array.isArray(queryParams.amenities)
        ? queryParams.amenities
        : queryParams.amenities.split(",");
      filter.amenities = {
        $all: amenitiesList.map((a) => a.trim())
      };
    }

    let sort = { createdAt: -1 };
    if (queryParams.sort === "rating_desc") {
      sort = { rating: -1, totalReviews: -1 };
    } else if (queryParams.sort === "newest") {
      sort = { createdAt: -1 };
    }

    return hotelRepository.findAll(filter, sort);
  }


  // ==================================================
  // UPDATE HOTEL
  // ==================================================

  async updateHotel(
    hotelId,
    ownerId,
    data
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    if (
      hotel.owner.toString() !==
      ownerId.toString()
    ) {

      throw new AppError(
        "You can only update your own hotel",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    if (
      hotel.status ===
      HOTEL_STATUS.BLOCKED
    ) {

      throw new AppError(
        "Blocked hotel cannot be updated",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    const updateData = {};


    if (data.name !== undefined) {
      updateData.name =
        data.name;
    }

    if (
      data.description !==
      undefined
    ) {
      updateData.description =
        data.description;
    }

    if (
      data.hotelType !==
      undefined
    ) {
      updateData.hotelType =
        data.hotelType;
    }

    if (
      data.amenities !==
      undefined
    ) {
      updateData.amenities =
        data.amenities;
    }


    if (
      data.address !== undefined ||
      data.city !== undefined ||
      data.state !== undefined ||
      data.country !== undefined ||
      data.pincode !== undefined ||
      data.latitude !== undefined ||
      data.longitude !== undefined
    ) {

      updateData.location = {

        ...hotel.location.toObject(),

        ...(data.address !== undefined && {
          address: data.address
        }),

        ...(data.city !== undefined && {
          city: data.city
        }),

        ...(data.state !== undefined && {
          state: data.state
        }),

        ...(data.country !== undefined && {
          country: data.country
        }),

        ...(data.pincode !== undefined && {
          pincode: data.pincode
        }),

        coordinates: {

          ...(
            hotel.location.coordinates
              ?.toObject?.() ||
            hotel.location.coordinates ||
            {}
          ),

          ...(data.latitude !== undefined && {
            latitude:
              data.latitude
          }),

          ...(data.longitude !== undefined && {
            longitude:
              data.longitude
          })

        }

      };
    }


    if (
      data.checkIn !== undefined ||
      data.checkOut !== undefined ||
      data.cancellation !== undefined ||
      data.childrenAllowed !== undefined ||
      data.petsAllowed !== undefined
    ) {

      updateData.policies = {

        ...hotel.policies.toObject(),

        ...(data.checkIn !== undefined && {
          checkIn:
            data.checkIn
        }),

        ...(data.checkOut !== undefined && {
          checkOut:
            data.checkOut
        }),

        ...(data.cancellation !== undefined && {
          cancellation:
            data.cancellation
        }),

        ...(data.childrenAllowed !== undefined && {
          childrenAllowed:
            data.childrenAllowed
        }),

        ...(data.petsAllowed !== undefined && {
          petsAllowed:
            data.petsAllowed
        })

      };
    }


    /*
      Whenever HOTEL_ADMIN changes
      an approved hotel, send it back
      to PENDING so Super Admin can
      review the changes.
    */

    if (
      hotel.status ===
      HOTEL_STATUS.APPROVED
    ) {

      updateData.status =
        HOTEL_STATUS.PENDING;

      updateData.approvedAt =
        null;

      updateData.approvedBy =
        null;
    }


    return hotelRepository.updateById(
      hotelId,
      updateData
    );
  }


  // ==================================================
  // APPROVE HOTEL
  // ==================================================

  async approveHotel(
    hotelId,
    adminId
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    if (
      hotel.status ===
      HOTEL_STATUS.APPROVED
    ) {

      throw new AppError(
        "Hotel is already approved",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    const updatedHotel =
      await hotelRepository.updateById(

        hotelId,

        {

          status:
            HOTEL_STATUS.APPROVED,

          approvedAt:
            new Date(),

          approvedBy:
            adminId,

          rejectionReason:
            null

        }

      );


    return updatedHotel;
  }


  // ==================================================
  // REJECT HOTEL
  // ==================================================

  async rejectHotel(
    hotelId,
    reason
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    return hotelRepository.updateById(

      hotelId,

      {

        status:
          HOTEL_STATUS.REJECTED,

        rejectionReason:
          reason,

        approvedAt:
          null,

        approvedBy:
          null

      }

    );
  }


  // ==================================================
  // BLOCK HOTEL
  // ==================================================

  async blockHotel(
    hotelId
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    return hotelRepository.updateById(

      hotelId,

      {
        status:
          HOTEL_STATUS.BLOCKED
      }

    );
  }


  // ==================================================
  // DELETE HOTEL
  // ==================================================

  async deleteHotel(
    hotelId,
    ownerId
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }


    if (
      hotel.owner.toString() !==
      ownerId.toString()
    ) {

      throw new AppError(
        "You can only delete your own hotel",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    if (
      hotel.status ===
      HOTEL_STATUS.APPROVED
    ) {

      throw new AppError(
        "Approved hotel cannot be deleted",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }


    await hotelRepository.deleteById(
      hotelId
    );


    return true;
  }


  // ==================================================
// ADD HOTEL IMAGES
// ==================================================

async addHotelImages(
  hotelId,
  ownerId,
  files
) {

  if (!files || files.length === 0) {

    throw new AppError(
      "At least one image is required",
      httpStatus.StatusCodes.BAD_REQUEST
    );
  }

  const hotel =
    await hotelRepository.findById(
      hotelId
    );

  if (!hotel) {

    throw new AppError(
      "Hotel not found",
      httpStatus.StatusCodes.NOT_FOUND
    );
  }

  if (
    hotel.owner.toString() !==
    ownerId.toString()
  ) {

    throw new AppError(
      "You can only update your own hotel",
      httpStatus.StatusCodes.FORBIDDEN
    );
  }

  if (
    hotel.status ===
    HOTEL_STATUS.BLOCKED
  ) {

    throw new AppError(
      "Blocked hotel cannot be updated",
      httpStatus.StatusCodes.FORBIDDEN
    );
  }

  if (
    hotel.images.length +
    files.length > 10
  ) {

    throw new AppError(
      "A hotel can have maximum 10 images",
      httpStatus.StatusCodes.BAD_REQUEST
    );
  }

  const uploadedImages = [];

  try {

    for (const file of files) {

      const result =
        await new Promise(
          (resolve, reject) => {

            const stream =
              cloudinary.uploader
                .upload_stream(

                  {
                    folder:
                      "tripnest/hotels"
                  },

                  (
                    error,
                    result
                  ) => {

                    if (error) {
                      reject(error);
                    } else {
                      resolve(result);
                    }

                  }

                );

            stream.end(
              file.buffer
            );

          }
        );

      uploadedImages.push({

        url:
          result.secure_url,

        publicId:
          result.public_id

      });
    }

  } catch (error) {

    /*
      If one upload fails,
      remove already uploaded
      images from Cloudinary.
    */

    for (
      const image
      of uploadedImages
    ) {

      try {

        await cloudinary.uploader
          .destroy(
            image.publicId
          );

      } catch (deleteError) {

        console.error(
          "Cloudinary cleanup failed:",
          deleteError.message
        );

      }

    }

    throw new AppError(
      "Hotel image upload failed",
      httpStatus.StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const updateData = {

    $push: {

      images: {

        $each:
          uploadedImages

      }

    }

  };

  /*
    Approved hotel changes
    require re-approval.
  */

  if (
    hotel.status ===
    HOTEL_STATUS.APPROVED
  ) {

    updateData.$set = {

      status:
        HOTEL_STATUS.PENDING,

      approvedAt:
        null,

      approvedBy:
        null

    };

  }

  return hotelRepository.updateOne(

    {
      _id: hotelId
    },

    updateData

  );
}

// ==================================================
// DELETE HOTEL IMAGE
// ==================================================

async deleteHotelImage(
  hotelId,
  ownerId,
  publicId
) {

  const hotel =
    await hotelRepository.findById(
      hotelId
    );

  if (!hotel) {

    throw new AppError(
      "Hotel not found",
      httpStatus.StatusCodes.NOT_FOUND
    );
  }

  if (
    hotel.owner.toString() !==
    ownerId.toString()
  ) {

    throw new AppError(
      "You can only update your own hotel",
      httpStatus.StatusCodes.FORBIDDEN
    );
  }

  const image =
    hotel.images.find(
      (item) =>
        item.publicId === publicId
    );

  if (!image) {

    throw new AppError(
      "Hotel image not found",
      httpStatus.StatusCodes.NOT_FOUND
    );
  }

  /*
    Delete from Cloudinary first
  */

  await cloudinary.uploader.destroy(
    publicId
  );

  /*
    Remove image from MongoDB
  */

  const updateData = {

    $pull: {

      images: {

        publicId

      }

    }

  };

  /*
    Approved hotel image change
    requires re-approval.
  */

  if (
    hotel.status ===
    HOTEL_STATUS.APPROVED
  ) {

    updateData.$set = {

      status:
        HOTEL_STATUS.PENDING,

      approvedAt:
        null,

      approvedBy:
        null

    };

  }

  return hotelRepository.updateOne(

    {
      _id: hotelId
    },

    updateData
  );
}

  // ==================================================
  // UPLOAD FILES TO CLOUDINARY (OR BASE64 FALLBACK)
  // ==================================================
  async uploadFilesToCloudinary(files) {
    if (!files || files.length === 0) {
      throw new AppError("No files provided", httpStatus.StatusCodes.BAD_REQUEST);
    }

    const uploadedImages = [];

    for (const file of files) {
      try {
        if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "tripnest/hotels"
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(file.buffer);
          });

          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        } else {
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
          uploadedImages.push({
            url: base64,
            publicId: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`
          });
        }
      } catch (err) {
        console.warn("Cloudinary upload failed, falling back to base64:", err.message);
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        uploadedImages.push({
          url: base64,
          publicId: `fallback_${Date.now()}_${Math.random().toString(36).substring(7)}`
        });
      }
    }

    return uploadedImages;
  }

  // ==================================================
  // BULK CREATE HOTELS
  // ==================================================

  async bulkCreateHotels(ownerId, userRole, hotelsArray) {
    if (!Array.isArray(hotelsArray) || hotelsArray.length === 0) {
      throw new AppError("No hotel records provided for bulk import", httpStatus.StatusCodes.BAD_REQUEST);
    }

    const defaultImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80"
    ];

    const validHotelsToInsert = [];
    const errors = [];
    const seenNames = new Set();

    for (let i = 0; i < hotelsArray.length; i++) {
      const h = hotelsArray[i];
      const rowNum = h.originalRow || i + 2;

      const name = (h.name || "").trim();
      if (!name || name.length < 3) {
        errors.push({ row: rowNum, error: "Hotel name must be at least 3 characters." });
        continue;
      }

      const city = (h.city || "").trim();
      if (!city) {
        errors.push({ row: rowNum, error: "City is required." });
        continue;
      }

      const address = (h.address || "").trim();
      if (!address) {
        errors.push({ row: rowNum, error: "Street address is required." });
        continue;
      }

      const state = (h.state || "").trim() || "State";
      const key = `${name.toLowerCase()}:::${city.toLowerCase()}`;

      if (seenNames.has(key)) {
        errors.push({ row: rowNum, error: `Duplicate hotel in file: "${name}" in ${city}.` });
        continue;
      }
      seenNames.add(key);

      // Check if already in database
      const existing = await hotelRepository.findByNameAndCity(name, city);
      if (existing) {
        errors.push({ row: rowNum, error: `Hotel "${name}" in ${city} already exists in database.` });
        continue;
      }

      // Amenities parsing
      let amenitiesList = [];
      if (Array.isArray(h.amenities)) {
        amenitiesList = h.amenities.map(a => String(a).trim()).filter(Boolean);
      } else if (typeof h.amenities === "string" && h.amenities.trim()) {
        amenitiesList = h.amenities.split(",").map(a => a.trim()).filter(Boolean);
      }
      if (amenitiesList.length === 0) {
        amenitiesList = ["Free Wi-Fi", "Air Conditioning", "Parking", "24/7 Front Desk"];
      }

      // Valid hotel types
      const validTypes = ["HOTEL", "RESORT", "VILLA", "HOMESTAY", "GUEST_HOUSE", "APARTMENT"];
      const rawType = (h.hotelType || "HOTEL").toUpperCase().replace(/\s+/g, "_");
      const hotelType = validTypes.includes(rawType) ? rawType : "HOTEL";

      const description = (h.description || "").trim().length >= 20
        ? h.description.trim()
        : `A distinguished ${hotelType.toLowerCase()} accommodation offering comfortable stays and attentive guest services at ${name}, ${city}.`;

      // Images
      let imgArray = [];
      if (Array.isArray(h.images) && h.images.length > 0) {
        imgArray = h.images.map((img, idx) =>
          typeof img === "string"
            ? { url: img, publicId: `bulk_hotel_img_${Date.now()}_${idx}` }
            : img
        );
      } else {
        imgArray = defaultImages.map((url, idx) => ({
          url,
          publicId: `default_bulk_hotel_${Date.now()}_${idx}`
        }));
      }

      validHotelsToInsert.push({
        name,
        description,
        hotelType,
        owner: ownerId,
        location: {
          address,
          city,
          state,
          country: (h.country || "India").trim(),
          pincode: (h.pincode || "400001").trim(),
          coordinates: {
            latitude: h.latitude ? Number(h.latitude) : undefined,
            longitude: h.longitude ? Number(h.longitude) : undefined,
          }
        },
        contact: {
          phone: (h.phone || "").trim(),
          email: (h.email || "").toLowerCase().trim()
        },
        amenities: amenitiesList,
        policies: {
          checkIn: (h.checkIn || "14:00").trim(),
          checkOut: (h.checkOut || "11:00").trim(),
          cancellation: (h.cancellation || "Free cancellation up to 48 hours before check-in.").trim(),
          childrenAllowed: h.childrenAllowed !== undefined ? Boolean(h.childrenAllowed) : true,
          petsAllowed: h.petsAllowed !== undefined ? Boolean(h.petsAllowed) : false,
        },
        images: imgArray,
        status: HOTEL_STATUS.APPROVED,
      });
    }

    let insertedHotels = [];
    if (validHotelsToInsert.length > 0) {
      insertedHotels = await hotelRepository.insertMany(validHotelsToInsert);
    }

    return {
      totalReceived: hotelsArray.length,
      insertedCount: insertedHotels.length,
      errors,
      insertedHotels,
    };
  }
}


module.exports =
  new HotelService();