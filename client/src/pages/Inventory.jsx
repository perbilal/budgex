import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Trash2 } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: '', cost: '', stock: '' });

  // ⚠️ CHANGE THIS URL TO YOUR RENDER URL WHEN DEPLOYING
  const API_URL = 'https://budgex-r4do.onrender.com';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if(!form.name || !form.price) return; 
    
    await axios.post(`${API_URL}/products`, form);
    setForm({ name: '', category: '', price: '', cost: '', stock: '' });
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Package /> Inventory Management
      </h2>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 text-sm uppercase text-gray-500">Add New Product</h3>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input className="p-2 border rounded md:col-span-2" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input className="p-2 border rounded" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
          <input className="p-2 border rounded" type="number" placeholder="Price (Sale)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          <input className="p-2 border rounded" type="number" placeholder="Cost (Buy)" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
          <input className="p-2 border rounded" type="number" placeholder="Stock Qty" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
          <button className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 flex justify-center items-center gap-2 md:col-span-1">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4">Profit Margin</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{p.name}</td>
                <td className="p-4 text-gray-500">{p.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                {/* Fixed the invisible text here by adding text-gray-900 */}
                <td className="p-4 text-gray-900 font-medium">Rs {p.price}</td>
                <td className="p-4 text-green-600 font-bold">Rs {p.price - p.cost}</td>
                <td className="p-4">
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-gray-400">No products found.</p>}
      </div>
    </div>
  );
}