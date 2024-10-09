const express = require("express");
const axios = require("axios");
const Transaction = require("../models/Transaction");

const router = express.Router();

// API to initialize the database
router.get("/initialize", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transactions = response.data;

    await Transaction.deleteMany(); // Clear old data
    await Transaction.insertMany(transactions); // Insert new data

    res.status(200).json({ message: "Database initialized with seed data" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to list transactions with search and pagination
router.get("/transactions", async (req, res) => {
  const { search = "", page = 1, perPage = 10, month } = req.query;

  const searchQuery = {
    dateOfSale: { $regex: `^${month}`, $options: "i" },
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const transactions = await Transaction.find(searchQuery)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const total = await Transaction.countDocuments(searchQuery);

    res.status(200).json({ transactions, total, page, perPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for statistics
router.get("/statistics", async (req, res) => {
  const { month } = req.query;

  try {
    const totalSold = await Transaction.countDocuments({
      sold: true,
      dateOfSale: { $regex: `^${month}` },
    });
    const totalUnsold = await Transaction.countDocuments({
      sold: false,
      dateOfSale: { $regex: `^${month}` },
    });
    const totalSales = await Transaction.aggregate([
      { $match: { sold: true, dateOfSale: { $regex: `^${month}` } } },
      { $group: { _id: null, totalAmount: { $sum: "$price" } } },
    ]);

    res.status(200).json({
      totalSold,
      totalUnsold,
      totalSales: totalSales.length ? totalSales[0].totalAmount : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for bar chart
router.get("/price-range", async (req, res) => {
  const { month } = req.query;

  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: 1000 },
  ];

  try {
    const data = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          price: { $gte: range.min, $lte: range.max },
          dateOfSale: { $regex: `^${month}` },
        });
        return { range: `${range.min}-${range.max}`, count };
      })
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API for pie chart
router.get("/categories", async (req, res) => {
  const { month } = req.query;

  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: `^${month}` } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
