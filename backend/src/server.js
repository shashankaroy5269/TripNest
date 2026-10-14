require("dotenv").config();

const app =
  require("./app");

const Database =
  require("./config/db");


const PORT =
  process.env.PORT || 5000;


const startServer =
  async () => {

    try {

      await Database.connect();


      app.listen(
        PORT,

        () => {

          console.log(
            `TripNest server running on port ${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        "Server startup failed:",
        error.message
      );

      process.exit(1);
    }
  };


startServer();