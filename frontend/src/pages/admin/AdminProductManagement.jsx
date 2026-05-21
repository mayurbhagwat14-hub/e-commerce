import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, fetchCategories } from '../../features/products/productSlice';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Plus, Edit, Trash2, X, PlusCircle, MinusCircle, Upload, Eye, Loader2 } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

export const AdminProductManagement = () => {
  const dispatch = useDispatch();
  
  const { products, categories, loading } = useSelector((state) => state.products);

  // Modal open states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [inventory, setInventory] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);
  const [images, setImages] = useState([]); // [{ url, publicId }]
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 })); // Load all products for list
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setShowModal(true);
    // Reset fields
    setName('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setDiscountPrice('');
    setInventory('');
    setDescription('');
    setSpecifications([{ name: '', value: '' }]);
    setImages([]);
  };

  const handleOpenEdit = (prod) => {
    setIsEditMode(true);
    setCurrentProductId(prod._id);
    setShowModal(true);
    
    setName(prod.name);
    setCategory(prod.category?._id || prod.category || '');
    setPrice(prod.price);
    setDiscountPrice(prod.discountPrice || '');
    setInventory(prod.inventory);
    setDescription(prod.description);
    setSpecifications(prod.specifications?.length > 0 ? prod.specifications : [{ name: '', value: '' }]);
    setImages(prod.images || []);
  };

  const handleSpecChange = (index, field, val) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = val;
    setSpecifications(updatedSpecs);
  };

  const addSpecRow = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
  };

  const removeSpecRow = (index) => {
    const updatedSpecs = [...specifications];
    updatedSpecs.splice(index, 1);
    setSpecifications(updatedSpecs);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setUploading(true);
    try {
      const { data } = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Append newly uploaded images
      setImages((prev) => [...prev, ...data]);
      toast.success('Images uploaded successfully to Cloudinary!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleDelete = async (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(adminDeleteProduct(prodId)).unwrap();
        toast.success('Product deleted successfully');
        dispatch(fetchProducts({ limit: 100 }));
      } catch (err) {
        toast.error(err || 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !price || !inventory || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // filter empty specification keys
    const filteredSpecs = specifications.filter(spec => spec.name.trim() && spec.value.trim());

    const productPayload = {
      name,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      inventory: Number(inventory),
      description,
      specifications: filteredSpecs,
      images,
    };

    try {
      if (isEditMode) {
        await dispatch(adminUpdateProduct({ productId: currentProductId, productData: productPayload })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(adminCreateProduct(productPayload)).unwrap();
        toast.success('Product created successfully');
      }
      setShowModal(false);
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  return (
    <div className="py-6 flex flex-col md:flex-row gap-8 items-start">
      <AdminSidebar />

      <main className="flex-1 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Product Management</h1>
            <p className="text-xs text-slate-400 mt-1">Add, update, or remove products from the storefront inventory catalog.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center space-x-1.5"
          >
            <Plus className="h-4.5 w-4.5" /> <span>Add Product</span>
          </button>
        </div>

        {/* Product Table */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading products catalog...</div>
          ) : products.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No products configured yet.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-2.5 font-bold uppercase">Image</th>
                  <th className="py-2.5 font-bold uppercase">Product Name</th>
                  <th className="py-2.5 font-bold uppercase">Category</th>
                  <th className="py-2.5 font-bold uppercase">Price</th>
                  <th className="py-2.5 font-bold uppercase">Stock</th>
                  <th className="py-2.5 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2">
                      <img src={prod.images[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} alt="" className="h-10 w-10 object-cover rounded-lg bg-slate-950/20" />
                    </td>
                    <td className="py-2 font-semibold text-white truncate max-w-[200px]">{prod.name}</td>
                    <td className="py-2 text-slate-400">{prod.category?.name || 'Category'}</td>
                    <td className="py-2 text-slate-200 font-bold">₹{prod.price.toLocaleString('en-IN')}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${prod.inventory > 10 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {prod.inventory} Units
                      </span>
                    </td>
                    <td className="py-2 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-slate-400 hover:text-secondary bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors inline-flex"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors inline-flex"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isEditMode ? 'Modify Catalog Product' : 'Add New storefront Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mechanical Gaming Keyboard"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Category *</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Retail Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  {/* Discount Price */}
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Discounted Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Discount Price"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  {/* Inventory */}
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Inventory Count *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Inventory units"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Detailed Description *</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Product features, parameters, or descriptive details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full glass-input p-3 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cloudinary Multi-Image Uploader */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <label className="text-xxs text-slate-400 uppercase font-semibold block">Product Images</label>
                  
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Upload button wrapper */}
                    <label className="h-16 w-16 rounded-xl border border-dashed border-white/10 hover:border-secondary flex flex-col justify-center items-center cursor-pointer transition-colors text-slate-400">
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-4.5 w-4.5" />
                          <span className="text-[8px] font-bold mt-1">Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>

                    {/* Previews */}
                    {images.map((img, idx) => (
                      <div key={idx} className="h-16 w-16 rounded-xl overflow-hidden relative group border border-white/5 bg-slate-950/20">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Specifications */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xxs text-slate-400 uppercase font-semibold">Technical Specifications</label>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="text-xxs font-bold text-secondary hover:text-secondary-light flex items-center space-x-0.5"
                    >
                      <PlusCircle className="h-4 w-4" /> <span>Add Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {specifications.map((spec, idx) => (
                      <div key={idx} className="flex space-x-3 items-center">
                        <input
                          type="text"
                          placeholder="e.g. Battery Capacity"
                          value={spec.name}
                          onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                          className="w-1/2 glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="e.g. 5000 mAh"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          className="w-1/2 glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecRow(idx)}
                          disabled={specifications.length === 1}
                          className="text-slate-500 hover:text-red-400 disabled:opacity-30"
                        >
                          <MinusCircle className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-slate-800 text-xs rounded-xl font-bold text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-xl font-bold shadow transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductManagement;
