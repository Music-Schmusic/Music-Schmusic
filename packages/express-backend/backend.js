import express from "express";
import cors from "cors";
import authRoutes from './endpoints/authorize.js';
import connectDB from "./db.js"; // Import the database connection function

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use('/',authRoutes);

app.get("/", (req, res) => res.send("API Running"));

app.listen(port, () => console.log(`Server running on port ${port}`));