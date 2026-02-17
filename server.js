const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// BASIC CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/basic', (req, res) => {
  try {
    const { expression } = req.body;
    if (!expression) return res.status(400).json({ error: 'Expression required' });
    // Safe eval using Function
    const sanitized = expression.replace(/[^0-9+\-*/.() %]/g, '');
    const result = Function('"use strict"; return (' + sanitized + ')')();
    if (!isFinite(result)) return res.status(400).json({ error: 'Invalid calculation' });
    res.json({ result: parseFloat(result.toFixed(10)) });
  } catch (e) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// ─────────────────────────────────────────────
// GST CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/gst', (req, res) => {
  try {
    const { amount, rate, type } = req.body; // type: 'exclusive' or 'inclusive'
    const amt = parseFloat(amount);
    const gstRate = parseFloat(rate);
    if (isNaN(amt) || isNaN(gstRate)) return res.status(400).json({ error: 'Invalid values' });

    let result;
    if (type === 'exclusive') {
      const gstAmount = (amt * gstRate) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      result = {
        originalAmount: amt,
        gstRate: gstRate,
        gstAmount: +gstAmount.toFixed(2),
        cgst: +cgst.toFixed(2),
        sgst: +sgst.toFixed(2),
        totalAmount: +(amt + gstAmount).toFixed(2),
        type: 'exclusive'
      };
    } else {
      const originalAmount = (amt * 100) / (100 + gstRate);
      const gstAmount = amt - originalAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      result = {
        originalAmount: +originalAmount.toFixed(2),
        gstRate: gstRate,
        gstAmount: +gstAmount.toFixed(2),
        cgst: +cgst.toFixed(2),
        sgst: +sgst.toFixed(2),
        totalAmount: amt,
        type: 'inclusive'
      };
    }
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

// ─────────────────────────────────────────────
// TDS CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/tds', (req, res) => {
  try {
    const { amount, category } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt)) return res.status(400).json({ error: 'Invalid amount' });

    const tdsRates = {
      salary: { rate: 10, section: '192', description: 'Salary Income' },
      interest: { rate: 10, section: '194A', description: 'Interest on Securities' },
      dividend: { rate: 10, section: '194', description: 'Dividend' },
      contractor: { rate: 1, section: '194C', description: 'Payment to Contractor' },
      professional: { rate: 10, section: '194J', description: 'Professional/Technical Fees' },
      rent: { rate: 10, section: '194I', description: 'Rent' },
      commission: { rate: 5, section: '194H', description: 'Commission/Brokerage' },
      nri: { rate: 30, section: '195', description: 'Payments to NRI' }
    };

    const cat = tdsRates[category] || tdsRates['professional'];
    const tdsAmount = (amt * cat.rate) / 100;
    const netAmount = amt - tdsAmount;
    const surcharge = tdsAmount > 1000000 ? tdsAmount * 0.10 : 0;
    const educationCess = (tdsAmount + surcharge) * 0.04;
    const totalTDS = tdsAmount + surcharge + educationCess;

    res.json({
      grossAmount: amt,
      section: cat.section,
      category: cat.description,
      tdsRate: cat.rate,
      basicTDS: +tdsAmount.toFixed(2),
      surcharge: +surcharge.toFixed(2),
      educationCess: +educationCess.toFixed(2),
      totalTDS: +totalTDS.toFixed(2),
      netAmount: +(amt - totalTDS).toFixed(2)
    });
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

// ─────────────────────────────────────────────
// HEIGHT CONVERTER
// ─────────────────────────────────────────────
app.post('/api/height', (req, res) => {
  try {
    const { value, from } = req.body;
    const val = parseFloat(value);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid value' });

    let cm;
    switch (from) {
      case 'cm': cm = val; break;
      case 'm': cm = val * 100; break;
      case 'ft': cm = val * 30.48; break;
      case 'in': cm = val * 2.54; break;
      case 'mm': cm = val / 10; break;
      default: return res.status(400).json({ error: 'Invalid unit' });
    }

    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = +(totalInches % 12).toFixed(2);

    res.json({
      input: val,
      unit: from,
      cm: +cm.toFixed(4),
      m: +(cm / 100).toFixed(4),
      ft: +(cm / 30.48).toFixed(4),
      ftFormatted: `${feet}' ${inches}"`,
      inches: +totalInches.toFixed(4),
      mm: +(cm * 10).toFixed(4),
      yards: +(cm / 91.44).toFixed(4)
    });
  } catch (e) {
    res.status(400).json({ error: 'Conversion failed' });
  }
});

// ─────────────────────────────────────────────
// LENGTH CONVERTER
// ─────────────────────────────────────────────
app.post('/api/length', (req, res) => {
  try {
    const { value, from } = req.body;
    const val = parseFloat(value);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid value' });

    const toMeter = {
      mm: 0.001, cm: 0.01, m: 1, km: 1000,
      in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
      nm: 1852, ly: 9.461e15
    };

    const meter = val * (toMeter[from] || 1);
    const result = {};
    for (const [unit, factor] of Object.entries(toMeter)) {
      result[unit] = +(meter / factor).toFixed(6);
    }
    result.input = val;
    result.unit = from;
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'Conversion failed' });
  }
});

// ─────────────────────────────────────────────
// WEIGHT CONVERTER
// ─────────────────────────────────────────────
app.post('/api/weight', (req, res) => {
  try {
    const { value, from } = req.body;
    const val = parseFloat(value);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid value' });

    const toKg = {
      kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592,
      oz: 0.0283495, ton: 1000, stone: 6.35029
    };

    const kg = val * (toKg[from] || 1);
    const result = {};
    for (const [unit, factor] of Object.entries(toKg)) {
      result[unit] = +(kg / factor).toFixed(6);
    }
    result.input = val;
    result.unit = from;
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'Conversion failed' });
  }
});

// ─────────────────────────────────────────────
// TEMPERATURE CONVERTER
// ─────────────────────────────────────────────
app.post('/api/temperature', (req, res) => {
  try {
    const { value, from } = req.body;
    const val = parseFloat(value);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid value' });

    let celsius;
    switch (from) {
      case 'c': celsius = val; break;
      case 'f': celsius = (val - 32) * 5 / 9; break;
      case 'k': celsius = val - 273.15; break;
      default: return res.status(400).json({ error: 'Invalid unit' });
    }

    res.json({
      input: val, unit: from,
      celsius: +celsius.toFixed(4),
      fahrenheit: +(celsius * 9 / 5 + 32).toFixed(4),
      kelvin: +(celsius + 273.15).toFixed(4),
      rankine: +((celsius + 273.15) * 9 / 5).toFixed(4)
    });
  } catch (e) {
    res.status(400).json({ error: 'Conversion failed' });
  }
});

// ─────────────────────────────────────────────
// AGE CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/age', (req, res) => {
  try {
    const { dob } = req.body;
    const birth = new Date(dob);
    const now = new Date();
    if (isNaN(birth.getTime())) return res.status(400).json({ error: 'Invalid date' });

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.floor((nextBirthday - now) / (1000 * 60 * 60 * 24));

    res.json({
      years, months, days, totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalHours: totalDays * 24,
      daysToNextBirthday: daysToNext,
      dayOfWeekBorn: birth.toLocaleDateString('en-US', { weekday: 'long' }),
      zodiac: getZodiac(birth.getMonth() + 1, birth.getDate())
    });
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

function getZodiac(month, day) {
  const signs = [
    [1, 20, 'Capricorn'], [2, 19, 'Aquarius'], [3, 20, 'Pisces'], [4, 20, 'Aries'],
    [5, 21, 'Taurus'], [6, 21, 'Gemini'], [7, 22, 'Cancer'], [8, 23, 'Leo'],
    [9, 23, 'Virgo'], [10, 23, 'Libra'], [11, 22, 'Scorpio'], [12, 22, 'Sagittarius'], [12, 31, 'Capricorn']
  ];
  for (const [m, d, sign] of signs) {
    if (month < m || (month === m && day <= d)) return sign;
  }
  return 'Capricorn';
}

// ─────────────────────────────────────────────
// LOAN / EMI CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/emi', (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const n = parseInt(tenure);
    if (isNaN(P) || isNaN(annualRate) || isNaN(n)) return res.status(400).json({ error: 'Invalid values' });

    const r = annualRate / (12 * 100);
    let emi, totalAmount, totalInterest;

    if (r === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    totalAmount = emi * n;
    totalInterest = totalAmount - P;

    // Generate amortization table (first 5 + last row)
    const schedule = [];
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal_paid = emi - interest;
      balance -= principal_paid;
      if (i <= 5 || i === n) {
        schedule.push({
          month: i, emi: +emi.toFixed(2),
          principal: +principal_paid.toFixed(2),
          interest: +interest.toFixed(2),
          balance: +Math.max(balance, 0).toFixed(2)
        });
      }
    }

    res.json({
      emi: +emi.toFixed(2), totalAmount: +totalAmount.toFixed(2),
      totalInterest: +totalInterest.toFixed(2), principal: P,
      tenure: n, rate: annualRate, schedule
    });
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

// ─────────────────────────────────────────────
// PERCENTAGE CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/percentage', (req, res) => {
  try {
    const { type, a, b } = req.body;
    const numA = parseFloat(a), numB = parseFloat(b);

    let result = {};
    switch (type) {
      case 'of': // X% of Y
        result = { answer: +((numA / 100) * numB).toFixed(4), label: `${numA}% of ${numB}` };
        break;
      case 'what': // A is what % of B
        result = { answer: +((numA / numB) * 100).toFixed(4), label: `${numA} is what % of ${numB}` };
        break;
      case 'change': // % change from A to B
        const change = ((numB - numA) / numA) * 100;
        result = { answer: +change.toFixed(4), label: `% change from ${numA} to ${numB}`, isIncrease: change >= 0 };
        break;
      case 'add': // Add X% to Y
        const added = numB * (1 + numA / 100);
        result = { answer: +added.toFixed(4), label: `Add ${numA}% to ${numB}` };
        break;
      case 'subtract': // Subtract X% from Y
        const subtracted = numB * (1 - numA / 100);
        result = { answer: +subtracted.toFixed(4), label: `Subtract ${numA}% from ${numB}` };
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

// ─────────────────────────────────────────────
// AREA CALCULATOR
// ─────────────────────────────────────────────
app.post('/api/area', (req, res) => {
  try {
    const { shape, ...dims } = req.body;
    let area = 0, perimeter = 0, formula = '';

    switch (shape) {
      case 'rectangle':
        area = dims.length * dims.width;
        perimeter = 2 * (parseFloat(dims.length) + parseFloat(dims.width));
        formula = `l × w = ${dims.length} × ${dims.width}`;
        break;
      case 'circle':
        area = Math.PI * dims.radius ** 2;
        perimeter = 2 * Math.PI * dims.radius;
        formula = `π × r² = π × ${dims.radius}²`;
        break;
      case 'triangle':
        area = 0.5 * dims.base * dims.height;
        perimeter = parseFloat(dims.a) + parseFloat(dims.b) + parseFloat(dims.c || dims.base);
        formula = `½ × b × h = ½ × ${dims.base} × ${dims.height}`;
        break;
      case 'square':
        area = dims.side ** 2;
        perimeter = 4 * dims.side;
        formula = `s² = ${dims.side}²`;
        break;
      case 'trapezoid':
        area = 0.5 * (parseFloat(dims.a) + parseFloat(dims.b)) * dims.height;
        perimeter = parseFloat(dims.a) + parseFloat(dims.b) + parseFloat(dims.c) + parseFloat(dims.d);
        formula = `½ × (a+b) × h`;
        break;
      default:
        return res.status(400).json({ error: 'Unknown shape' });
    }

    res.json({
      shape, area: +area.toFixed(6),
      perimeter: +perimeter.toFixed(6), formula,
      areaInSqFt: +(area * 10.7639).toFixed(4),
      areaInSqM: +area.toFixed(4)
    });
  } catch (e) {
    res.status(400).json({ error: 'Calculation failed' });
  }
});

// Catch-all: serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`✅ Calculator App running at http://localhost:${PORT}`));
