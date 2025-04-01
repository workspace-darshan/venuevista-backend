const mongoose  = require("mongoose")

const URI = "mongodb://127.0.0.1:27017/Booking_panel";
// const URI ="mongodb+srv://pariharpratham12:n9D4UiSirs2X6uQa@cluster0.ltnsz.mongodb.net/Admin_panel?retryWrites=true&w=majority&appName=Cluster0"

const connectDB = async(req,res)=>{
    try {
    await mongoose.connect(URI)
       console.log("database connect") 
    } catch (error) {
        console.log("database not connect")
    }
}

module.exports = connectDB;



