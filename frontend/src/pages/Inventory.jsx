import { useEffect, useState, useCallback } from "react"
import api from "../api/axios"
import toast, { Toaster } from "react-hot-toast"
import Pagination from "../components/Pagination"
import ProductTable from "../components/DataTable"

function Inventory(){

 const [stocks,setStocks] = useState([])
 const [products, setProducts] = useState([])
 const [errors, setErrors] = useState({})
 const [product, setProduct] = useState("")
 const [quantity, setQuantity] = useState("")
 const [minimumStock, setMinimumStock] = useState("")
 const [location, setLocation] = useState("")
 const [editId, setEditId] = useState(null)

 const [search, setSearch] = useState("")
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [currentSearch, setCurrentSearch] = useState("")

 const [ordering, setOrdering] = useState("")

 // =========================
 // Fetch Products
 // =========================

 const fetchProducts = useCallback(async () => {
  try {
   const res = await api.get("/products/");
   setProducts(res.data.results);
  } catch (error) {
   console.error("Product fetch error", error);
  }
 }, []);

 // =========================
 // Pagination + Sort
 // =========================

 const fetchPage = useCallback(async (page) => {

  try {

   const params = new URLSearchParams()

   params.append("page", page)

   if (currentSearch)
    params.append("search", currentSearch)

   if (ordering)
    params.append("ordering", ordering)

   const url = `/inventory/?${params.toString()}`
   const res = await api.get(url)

   setStocks(res.data.results)
   setCurrentPage(page)
   setTotalPages(Math.ceil(res.data.count / 5))

  } catch (error) {

   console.error(error)

  }

 }, [currentSearch, ordering])

 // =========================
 // Fetch stocks
 // =========================

 const fetchStocks = useCallback(async () => {

  await fetchPage(1)

 }, [fetchPage])

 // =========================
 // Search
 // =========================

 const searchStocks = async () => {

  setCurrentSearch(search)
  await fetchPage(1)

 }

 // =========================
 // Validate Form
 // =========================

 const validateForm = () => {
  let newErrors = {};

  if (!product) {
   newErrors.product = "Product required";
  }

  if (!quantity || Number(quantity) < 0) {
   newErrors.quantity = "Quantity must be >= 0";
  }

  if (!minimumStock || Number(minimumStock) < 0) {
   newErrors.minimumStock = "Minimum stock must be >= 0";
  }

  if (!location.trim()) {
   newErrors.location = "Location required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
 };

 // =========================
 // Reset Form
 // =========================

 const resetForm = () => {
  setEditId(null);
  setProduct("");
  setQuantity("");
  setMinimumStock("");
  setLocation("");
 };

 // =========================
 // Create
 // =========================

 const createStock = async () => {
  if (!validateForm()) {
   toast.error("Please fill required fields ❌");
   return;
  }
  const confirmAdd = window.confirm("Add this inventory item?");

  if (!confirmAdd) return;

  try {
   await api.post("/inventory/", {
    product,
    quantity,
    minimum_stock: minimumStock,
    location,
   });

   toast.success("Inventory item added");
   window.location.reload();
   resetForm();
  } catch (error) {
   toast.error("Add failed");
   console.error(error);
  }
 };

 // =========================
 // Edit
 // =========================

 const editStock = (stock) => {
  setEditId(stock.id);
  setProduct(stock.product);
  setQuantity(stock.quantity);
  setMinimumStock(stock.minimum_stock);
  setLocation(stock.location);
 };

 // =========================
 // Update
 // =========================

 const updateStock = async () => {
  if (!validateForm()) {
   toast.error("Please fill required fields ❌");
   return;
  }
  const confirmUpdate = window.confirm("Update this inventory item?");

  if (!confirmUpdate) return;

  try {
   await api.put(`/inventory/${editId}/`, {
    product,
    quantity,
    minimum_stock: minimumStock,
    location,
   });

   toast.success("Inventory item updated");
   window.location.reload();
   resetForm();
  } catch (error) {
   toast.error("Update failed");
   console.error(error);
  }
 };

 // =========================
 // Delete
 // =========================

 const deleteStock = async (id) => {
  const confirmDelete = window.confirm("Delete this inventory item?");

  if (!confirmDelete) return;

  try {
   await api.delete(`/inventory/${id}/`);

   toast.success("Inventory item deleted");
   window.location.reload();
  } catch (error) {
   toast.error("Delete failed");
   console.error(error);
  }
 };

 useEffect(()=>{

  const loadData = async () => {

   await fetchStocks()
   await fetchProducts()

  }

  loadData()

 },[fetchStocks, fetchProducts])

 // =========================
 // Table Columns
 // =========================

 const columns = [

  { key: "product_name", label: "Product Name" },

  { key: "sku", label: "SKU" },

  { key: "supplier", label: "Supplier" },

  { key: "quantity", label: "Stock Quantity" },

  { key: "minimum_stock", label: "Minimum Stock" },

  {
   key: "stock_status",
   label: "Status",
   render: (item) => (

    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
     item.stock_status === "In Stock"
      ? "bg-green-100 text-green-800"
      : item.stock_status === "Low Stock"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800"
    }`}>

     {item.stock_status}

    </span>

   )
  }

 ]

 const actions = [
  { label: 'Edit', onClick: editStock, className: 'bg-yellow-400 text-white px-3 py-1 rounded' },
  { label: 'Delete', onClick: (stock) => deleteStock(stock.id), className: 'bg-red-500 text-white px-3 py-1 rounded' }
 ]

 return(

  <div className="max-w-6xl mx-auto p-6 text-gray-800">

   <Toaster position="top-right" />

   <h1 className="text-3xl font-semibold mb-6">
    Inventory
   </h1>

   {/* Search */}

   <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">

    <div className="flex gap-3 flex-wrap">

     <input
      type="text"
      placeholder="Search inventory..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg px-3 py-2 flex-1"
     />

     <button
      onClick={searchStocks}
      className="bg-blue-500 text-white px-5 py-2 rounded-lg"
     >
      Search
     </button>

     <button
      onClick={() => {

       setSearch("")
       setCurrentSearch("")
       setOrdering("")
       fetchPage(1)

      }}
      className="bg-gray-500 text-white px-5 py-2 rounded-lg"
     >
      Reset
     </button>

    </div>

   </div>

   {/* Form */}

   <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
    <div className="flex flex-wrap gap-3">
     <select
      value={product}
      onChange={(e) => setProduct(e.target.value)}
      className={`border rounded-lg px-3 py-2 flex-1
      ${errors.product ? "border-red-500 bg-red-50" : "border-gray-300"}
      focus:outline-none focus:ring-2 focus:ring-blue-400`}
     >
      <option value="">Select Product</option>
      {products.map((p) => (
       <option key={p.id} value={p.id}>
        {p.name} ({p.sku})
       </option>
      ))}
     </select>

     <input
      type="number"
      placeholder="Stock Quantity"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className={`border rounded-lg px-3 py-2 flex-1
      ${errors.quantity ? "border-red-500 bg-red-50" : "border-gray-300"}
      focus:outline-none focus:ring-2 focus:ring-blue-400`}
     />

     <input
      type="number"
      placeholder="Minimum Stock"
      value={minimumStock}
      onChange={(e) => setMinimumStock(e.target.value)}
      className={`border rounded-lg px-3 py-2 flex-1
      ${errors.minimumStock ? "border-red-500 bg-red-50" : "border-gray-300"}
      focus:outline-none focus:ring-2 focus:ring-blue-400`}
     />

     <input
      type="text"
      placeholder="Location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      className={`border rounded-lg px-3 py-2 flex-1
      ${errors.location ? "border-red-500 bg-red-50" : "border-gray-300"}
      focus:outline-none focus:ring-2 focus:ring-blue-400`}
     />

     <button
      onClick={editId ? updateStock : createStock}
      className="bg-green-500 text-white px-5 py-2 rounded-lg"
     >
      {editId ? "Update" : "Add"}
     </button>

     {editId && (
      <button
       onClick={resetForm}
       className="bg-gray-400 text-white px-5 py-2 rounded-lg"
      >
       Cancel
      </button>
     )}
    </div>
   </div>

   {/* Table */}

   <div className="bg-white border rounded-xl shadow-sm p-6">

    <ProductTable
     data={stocks}
     columns={columns}
     actions={actions}
     onSort={(key, direction) => {
      const keyMap = {
        'product_name': 'product__name',
        'sku': 'product__sku',
        'supplier': 'product__supplier__name',
        'quantity': 'quantity',
        'minimum_stock': 'minimum_stock'
      };
      const backendKey = keyMap[key] || key;
      const order = direction === "asc" ? backendKey : `-${backendKey}`;
      setOrdering(order);
      fetchPage(1);
     }}
    />

   </div>

   {/* Pagination */}

   <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={fetchPage}
   />

  </div>

 )

}

export default Inventory