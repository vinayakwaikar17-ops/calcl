const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// --------------------
// API ROUTES
// --------------------

// Basic calculator API
app.post("/api/basic", (req, res) => {
  const { a, b, operator } = req.body;

  let result;

  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      result = b !== 0 ? a / b : "Division by zero";
      break;
    default:
      return res.status(400).json({ error: "Invalid operator" });
  }

  res.json({ result });
});

// GST calculator API
app.post("/api/gst", (req, res) => {
  const { amount, rate, type } = req.body;

  const gst = (amount * rate) / 100;

  let response = {
    baseAmount: amount,
    gstRate: rate,
    gstAmount: gst
  };

  if (type === "inclusive") {
    response.total = amount;
  } else {
    response.total = amount + gst;
  }

  res.json(response);
});

// --------------------
// FRONTEND
// --------------------
app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --------------------
app.listen(PORT, () => {
  console.log(`Calculator App running on port ${PORT}`);
});

