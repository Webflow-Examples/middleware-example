const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://yourdomain.com",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/books", async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;

    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await axios.get(
      "https://api.airtable.com/v0/appiV3xCQ0KsaZS0g/books",
      {
        headers,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
