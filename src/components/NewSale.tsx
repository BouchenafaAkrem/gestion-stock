import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, Sale, SaleItem, addSale, calculateProfit } from '../db';
import { translations } from '../translations';
import { X, Plus, Trash2 } from 'lucide-react';

interface NewSaleProps {
  onClose: () => void;
}

const NewSale: React.FC<NewSaleProps> = ({ onClose }) => {
  const products = useLiveQuery(() => db.products.toArray());
  
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newItem, setNewItem] = useState({
    productId: 0,
    quantity: 1
  });
  
  // Calculate totals
  const totalAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = totalAmount * (discountPercentage / 100);
  const finalAmount = totalAmount - discountAmount;
  
  // Calculate total profit
  const totalProfit = saleItems.reduce((sum, item) => {
    return sum + calculateProfit(
      item.wholesalePrice, 
      item.sellingPrice, 
      item.quantity, 
      discountPercentage
    );
  }, 0);
  
  const handleAddItem = () => {
    if (newItem.productId === 0 || newItem.quantity <= 0) return;
    
    const selectedProduct = products?.find(p => p.id === newItem.productId);
    if (!selectedProduct) return;
    
    // Check if product already exists in sale items
    const existingItemIndex = saleItems.findIndex(item => item.productId === newItem.productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...saleItems];
      const item = updatedItems[existingItemIndex];
      item.quantity += newItem.quantity;
      item.totalPrice = item.sellingPrice * item.quantity;
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const newSaleItem: SaleItem = {
        productId: selectedProduct.id!,
        productName: selectedProduct.name,
        quantity: newItem.quantity,
        wholesalePrice: selectedProduct.wholesalePrice,
        sellingPrice: selectedProduct.sellingPrice,
        totalPrice: selectedProduct.sellingPrice * newItem.quantity
      };
      
      setSaleItems([...saleItems, newSaleItem]);
    }
    
    // Reset new item form
    setNewItem({
      productId: 0,
      quantity: 1
    });
  };
  
  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };
  
  const handleCompleteSale = async () => {
    if (saleItems.length === 0) return;
    
    const sale: Sale = {
      date: new Date(),
      products: saleItems,
      totalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
      profit: totalProfit
    };
    
    try {
      await addSale(sale);
      setSuccessMessage(translations.saleCompleted);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error completing sale:', error);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{translations.newSale}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      
      {successMessage ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      ) : (
        <>
          {/* Add Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.product}
                </label>
                <select
                  value={newItem.productId}
                  onChange={(e) => setNewItem({...newItem, productId: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>-- {translations.product} --</option>
                  {products?.map(product => (
                    <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                      {product.name} {product.stock <= 0 ? `(${translations.stock}: 0)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.quantity}
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  disabled={newItem.productId === 0 || newItem.quantity <= 0}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Plus size={20} />
                  <span>{translations.addItem}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{translations.products}</h3>
            
            {saleItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.product}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.price}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.total}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saleItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.sellingPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.totalPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{translations.noData}</p>
            )}
          </div>
          
          {/* Discount and Totals */}
          {saleItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.discount} (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{translations.total}:</span>
                  <span className="text-sm font-medium">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{translations.discountAmount}:</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">{translations.finalAmount}:</span>
                  <span className="text-sm font-bold">{formatCurrency(finalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{translations.profit}:</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totalProfit)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {translations.cancel}
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={saleItems.length === 0}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {translations.completeSale}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewSale;