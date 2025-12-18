import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Download, TrendingUp, TrendingDown, Wallet, Plus 
} from 'lucide-react';

export default function Dashboard() {
  // --- STATE MANAGEMENT ---
  const [stats, setStats] = useState({ 
    totalIncome: 0, totalExpense: 0, netProfit: 0, salesChart: [], topProducts: [] 
  });
  const [products, setProducts] = useState([]); // List of inventory items
  
  // Form State
  const [type, setType] = useState('income'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // New State for Stock Logic
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // --- NEW: Toggle for "Inventory vs Custom" Logic ---
  const [isInventorySale, setIsInventorySale] = useState(true);

  // ⚠️ CHANGE THIS URL TO YOUR RENDER URL WHEN DEPLOYING
  const API_URL = 'https://budgex-r4do.onrender.com'; 

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get Dashboard Numbers & Chart Data
      const statsRes = await axios.get(`${API_URL}/dashboard-stats`);
      setStats(statsRes.data);

      // 2. Get Products for the Dropdown
      const prodRes = await axios.get(`${API_URL}/products`);
      setProducts(prodRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- SMART FORM LOGIC ---
  const handleProductSelect = (e) => {
    const pId = e.target.value;
    setSelectedProductId(pId);

    if (pId === "") {
      // Reset if user selects empty option
      setDescription("");
      setAmount("");
      return;
    }
    
    // Find the product to get its price and name
    const product = products.find(p => p.id == pId);
    if(product) {
      setDescription(`Sold ${product.name}`);
      setAmount(product.price * quantity); // Auto-calculate Total
    }
  };

  const handleQuantityChange = (e) => {
    const newQty = Number(e.target.value);
    setQuantity(newQty);

    // If a product is already selected, update the price immediately
    if (selectedProductId) {
      const product = products.find(p => p.id == selectedProductId);
      if(product) {
        setAmount(product.price * newQty);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    // --- UPDATED LOGIC ---
    // Only send productId if it is an Income AND "Inventory Sale" is checked
    const finalProductId = (type === 'income' && isInventorySale) ? selectedProductId : null;
    const finalQuantity = (type === 'income' && isInventorySale) ? Number(quantity) : null;

    try {
      await axios.post(`${API_URL}/transactions`, {
        description,
        amount: Number(amount),
        type,
        // Send these to server to update stock (Only if we selected a product)
        productId: finalProductId,
        quantity: finalQuantity
      });

      // Reset Form
      setDescription('');
      setAmount('');
      setQuantity(1);
      setSelectedProductId('');
      fetchData(); // Refresh the dashboard numbers
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // --- PDF EXPORT ---
  const downloadReport = () => {
    const doc = new jsPDF();
    doc.text("Budgemart - Monthly Business Report", 20, 10);
    
    doc.autoTable({
      head: [['Metric', 'Value']],
      body: [
        ['Total Income', `Rs ${stats.totalIncome}`],
        ['Total Expense', `Rs ${stats.totalExpense}`],
        ['Net Profit', `Rs ${stats.netProfit}`],
      ],
      startY: 20
    });

    doc.text("Top Selling Products", 20, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      head: [['Product', 'Sales Count']],
      body: stats.topProducts.map(p => [p.name, p.sales_count]),
      startY: doc.lastAutoTable.finalY + 20
    });

    doc.save("monthly_report.pdf");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, Admin</p>
        </div>
        <button onClick={downloadReport} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Income</p>
            <h3 className="text-2xl font-bold text-gray-900">Rs {stats.totalIncome.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        {/* Expense */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-gray-900">Rs {stats.totalExpense.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-full">
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>

        {/* Profit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium">Net Profit</p>
            <h3 className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
              Rs {stats.netProfit.toLocaleString()}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${stats.netProfit >= 0 ? 'bg-indigo-50' : 'bg-red-50'}`}>
            <Wallet className={`${stats.netProfit >= 0 ? 'text-indigo-600' : 'text-red-500'}`} size={24} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TRANSACTION FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} /> Add Transaction
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${
                    type === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${
                    type === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* --- NEW: CHECKBOX (Only show if Income) --- */}
              {type === 'income' && (
                <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <input 
                    type="checkbox" 
                    id="stockToggle"
                    checked={isInventorySale} 
                    onChange={(e) => setIsInventorySale(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="stockToggle" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                    Sell from Inventory?
                  </label>
                </div>
              )}

              {/* CONDITIONAL INPUTS */}
              {/* Show Dropdown ONLY if Income AND Checkbox is TRUE */}
              {type === 'income' && isInventorySale ? (
                <>
                  {/* Product Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Select Product</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      onChange={handleProductSelect}
                      value={selectedProductId}
                    >
                      <option value="">-- Choose Item --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                // Custom Income OR Expense Description Input
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <input 
                    type="text" 
                    // Change placeholder based on context
                    placeholder={type === 'income' ? "e.g. Service Charge, Repair Fee" : "e.g. Shop Rent, Tea"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {/* Amount Input (Auto-Calculated but Editable) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Amount (Rs)</label>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition active:scale-95">
                {type === 'income' ? 'Confirm Sale' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: CHART */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6">Sales Trends</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{fill: '#4f46e5', r: 4, strokeWidth: 0}} 
                    activeDot={{r: 6}} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table (Mini) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Top Selling Products</h3>
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="p-3 rounded-l-lg">Product Name</th>
                  <th className="p-3 rounded-r-lg text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.topProducts.map((p, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{p.name}</td>
                    <td className="p-3 text-right text-indigo-600 font-bold">{p.sales_count}</td>
                  </tr>
                ))}
                {stats.topProducts.length === 0 && (
                  <tr>
                    <td colSpan="2" className="p-4 text-center text-gray-400 text-sm">No sales yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}