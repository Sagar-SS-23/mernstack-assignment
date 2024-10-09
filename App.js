import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [priceRanges, setPriceRanges] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/transactions?month=March"
      );
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/statistics?month=March"
      );
      setStatistics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPriceRangeData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/price-range?month=March"
      );
      setPriceRanges(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/categories?month=March"
      );
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchPriceRangeData();
    fetchCategoriesData();
  }, []);

  return (
    <div>
      <h1>Transactions</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Statistics</h2>
      <div>Total Sales: {statistics.totalSales}</div>
      <div>Sold Items: {statistics.totalSold}</div>
      <div>Unsold Items: {statistics.totalUnsold}</div>

      <h2>Bar Chart - Price Ranges</h2>
      <BarChart width={600} height={300} data={priceRanges}>
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>

      <h2>Pie Chart - Categories</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={categories}
          dataKey="count"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        />
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default App;
