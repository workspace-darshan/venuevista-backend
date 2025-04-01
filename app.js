// require("dotenv").config({ path: "./.env" });
// const express = require("express");
// const app = express();
// const Router = require("./Router/authRoutes.js");
// const connectDB = require("./Utils/db.js");

// app.use(express.json());
// app.use("/api", Router);
// // app.use(errorMiddleware);
// connectDB().then(() => {
//   app.listen(3000, () => {
//     console.log(`app is runin 3000`);
//   });
// });

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./allRoutes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
