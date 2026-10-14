require("dotenv").config();

const bcrypt =
  require("bcryptjs");


const Database =
  require("../config/db");


const User =
  require("../models/user.model");


const ROLES =
  require("../constants/roles");


const ACCOUNT_STATUS =
  require("../constants/status");


const seedSuperAdmin =
  async () => {

    try {

      await Database.connect();


      const email =
        "admin@tripnest.com";


      const existingAdmin =
        await User.findOne({
          email
        });


      if (existingAdmin) {

        console.log(
          "Super Admin already exists"
        );

        process.exit(0);
      }


      const passwordHash =
        await bcrypt.hash(
          "Admin@123456",
          12
        );


      const admin =
        await User.create({

          name:
            "TripNest Super Admin",

          email,

          passwordHash,

          role:
            ROLES.SUPER_ADMIN,

          status:
            ACCOUNT_STATUS.ACTIVE,

          emailVerified:
            true

        });


      console.log(
        "Super Admin created successfully"
      );


      console.log(
        "Email:",
        admin.email
      );


      console.log(
        "Role:",
        admin.role
      );


      process.exit(0);


    } catch (error) {

      console.error(
        "Super Admin seed failed:",
        error.message
      );

      process.exit(1);
    }
  };


seedSuperAdmin();