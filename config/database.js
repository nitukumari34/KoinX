

const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {

        useNewUrlParser: true,
        useUnifiedTopology: true

    })

        .then(() => console.log("DB Ka connection is successfully"))
        .catch((error) => {
            console.log("Issue in DB Connection");

            // Used to log error message to the console. Useful in the testing of code. By default, the error message will be highlighted with red color
            console.error(error.message);
            process.exit(1);
        });

}

module.exports = dbConnect;