const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --------------------
// BASIC CALCULATOR API
// --------------------
app.post("/api/basic", (req, res) => {
  let { a, b, operator, num1, num2, op } = req.body;

  // Support multiple frontend payload styles
  const x = Number(a ?? num1);
  const y = Number(b ?? num2);
  const operation = operator ?? op;

  if (isNaN(x) || isNaN(y) || !operation) {
    return res.json({
      error: "Invalid input",
      received: req.body
    });
  }

  let result;

  switch (operation) {
    case "+":
    case "add":
      result = x + y;
      break;
    case "-":
    case "sub":
      result = x - y;
      break;
    case "*":
    case "mul":
      result = x * y;
      break;
    case "/":
    case "div":
      result = y !== 0 ? x / y : "Division by zero";
      break;
    default:
      return res.json({ error: "Unknown operator" });
  }

  res.json({ result });
});

// --------------------
// GST CALCULATOR API
// --------------------
app.post("/api/gst", (req, res) => {
  let { amount, rate, type } = req.body;

  const base = Number(amount);
  const gstRate = Number(rate);

  if (isNaN(base) || isNaN(gstRate)) {
    return res.json({
      error: "Invalid GST input",
      received: req.body
    });
  }

  const gst = (base * gstRate) / 100;

  res.json({
    baseAmount: base,
    gstRate,
    gstAmount: gst,
    total:
      type === "inclusive"
        ? base
        : base + gst
  });
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
