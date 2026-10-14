const hotelService =
  require(
    "../services/hotel.service"
  );

const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class HotelController {

    // CREATE HOTEL
    createHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.createHotel(

        req.user.userId,

        req.body

      );


    return ApiResponse.success(
      res,
      {

        statusCode: 201,

        message:
          "Hotel created successfully and sent for approval",

        data: hotel

      }
    );
  };


    // GET HOTEL
    getHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.getHotel(
        req.params.id
      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel fetched successfully",

        data: hotel

      }
    );
  };


    // GET MY HOTELS
    getMyHotels = async (
    req,
    res
  ) => {

    let hotels =
      await hotelService.getMyHotels(
        req.user.userId
      );

    if ((!hotels || hotels.length === 0) && req.user.role === "SUPER_ADMIN") {
      const allResult = await hotelService.getAllHotels({}, true);
      hotels = allResult.hotels || allResult;
    }

    return ApiResponse.success(
      res,
      {
        message:
          "Hotels fetched successfully",
        data: hotels
      }
    );
  };


    // GET ALL HOTELS
    getAllHotels = async (
    req,
    res
  ) => {

    const isAdmin =
      req.user?.role === "SUPER_ADMIN" || req.user?.role === "HOTEL_ADMIN";

    const hotels =
      await hotelService.getAllHotels(
        req.query,
        isAdmin
      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotels fetched successfully",

        data: hotels

      }
    );
  };


    // UPDATE HOTEL
    updateHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.updateHotel(

        req.params.id,

        req.user.userId,

        req.body

      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel updated successfully",

        data: hotel

      }
    );
  };


    // APPROVE HOTEL
    approveHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.approveHotel(

        req.params.id,

        req.user.userId

      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel approved successfully",

        data: hotel

      }
    );
  };


    // REJECT HOTEL
    rejectHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.rejectHotel(

        req.params.id,

        req.body.reason

      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel rejected successfully",

        data: hotel

      }
    );
  };


    // BLOCK HOTEL
    blockHotel = async (
    req,
    res
  ) => {

    const hotel =
      await hotelService.blockHotel(
        req.params.id
      );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel blocked successfully",

        data: hotel

      }
    );
  };


    // DELETE HOTEL
    deleteHotel = async (
    req,
    res
  ) => {

    await hotelService.deleteHotel(

      req.params.id,

      req.user.userId

    );


    return ApiResponse.success(
      res,
      {

        message:
          "Hotel deleted successfully"

      }
    );
  };

  // ADD HOTEL IMAGES
addHotelImages = async (
  req,
  res
) => {

  const hotel =
    await hotelService.addHotelImages(

      req.params.id,

      req.user.userId,

      req.files

    );

  return ApiResponse.success(
    res,
    {

      message:
        "Hotel images uploaded successfully",

      data:
        hotel

    }
  );
};

// DELETE HOTEL IMAGE
deleteHotelImage = async (
  req,
  res
) => {

  const hotel =
    await hotelService
      .deleteHotelImage(

        req.params.id,

        req.user.userId,

        req.body.publicId

      );

  return ApiResponse.success(
    res,
    {

      message:
        "Hotel image deleted successfully",

      data:
        hotel

    }
  );
};

// UPLOAD IMAGES STANDALONE (PC / FILE UPLOAD)
uploadImagesStandalone = async (
  req,
  res
) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    throw new AppError(
      "Please select at least one image file",
      httpStatus.StatusCodes.BAD_REQUEST
    );
  }

  const uploadedImages = await hotelService.uploadFilesToCloudinary(files);

  return ApiResponse.success(
    res,
    {
      message: "Images uploaded successfully",
      data: uploadedImages
    }
  );
};

    // BULK CREATE HOTELS
    bulkCreateHotels = async (req, res) => {
    const hotels = req.body.hotels || req.body;
    const result = await hotelService.bulkCreateHotels(
      req.user.userId,
      req.user.role,
      hotels
    );

    return ApiResponse.success(res, {
      statusCode: 201,
      message: `Successfully imported ${result.insertedCount} hotel(s)`,
      data: result,
    });
  };

}


module.exports =
  new HotelController();