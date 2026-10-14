const express =
  require("express");


const authenticate =
  require(
    "../middlewares/auth.middleware"
  );


const validate =
  require(
    "../middlewares/validate.middleware"
  );


const upload =
  require(
    "../middlewares/upload.middleware"
  );


const asyncHandler =
  require(
    "../utils/asyncHandler"
  );


const userController =
  require(
    "../controllers/user.controller"
  );
const adminController =
  require(
    "../controllers/admin.controller"
  );
const authorize =
  require(
    "../middlewares/role.middleware"
  );
const ROLES =
  require(
    "../constants/roles"
  );


const {
  updateProfileSchema,
  changePasswordSchema
} =
  require(
    "../validators/user.validator"
  );


const router =
  express.Router();


// GET PROFILE
router.get(

  "/me",

  authenticate,

  asyncHandler(
    userController.getProfile
  )

);


// UPDATE PROFILE
router.put(

  "/profile",

  authenticate,

  validate(
    updateProfileSchema
  ),

  asyncHandler(
    userController.updateProfile
  )

);


// CHANGE PASSWORD
router.put(

  "/change-password",

  authenticate,

  validate(
    changePasswordSchema
  ),

  asyncHandler(
    userController.changePassword
  )

);


// PROFILE IMAGE
router.post(

  "/profile-image",

  authenticate,

  upload.single(
    "profileImage"
  ),

  asyncHandler(
    userController.uploadProfileImage
  )

);


// TOGGLE USER STATUS (ADMIN)
router.patch(
  "/:id/toggle-status",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.toggleUserStatus)
);

router.post(
  "/:id/toggle-status",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.toggleUserStatus)
);

module.exports =
  router;