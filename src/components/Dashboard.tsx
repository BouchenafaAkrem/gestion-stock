import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, Sale } from '../db';
import { translations } from '../translations';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const sales = useLiveQuery(() => db.sales.toArray());
  
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  
  useEffect(() => {
    if (products) {
      setTotalProducts(products.length);
      setLowStockProducts(products.filter(p => p.stock < 5));
    }
  }, [products]);
  
  useEffect(() => {
    if (sales) {
      setTotalSales(sales.reduce((sum, sale) => sum + sale.finalAmount, 0));
      setTotalProfit(sales.reduce((sum, sale) => sum + sale.profit, 0));
      
      // Get 5 most recent sales
      const sortedSales = [...sales].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentSales(sortedSales.slice(0, 5));
    }
  }, [sales]);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
  };
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Package className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{translations.totalProducts}</p>
            <p className="text-2xl font-semibold">{totalProducts}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <ShoppingCart className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{translations.totalSales}</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalSales)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{translations.totalProfit}</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Sales & Low Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">{translations.recentSales}</h3>
          </div>
          <div className="p-4">
            {recentSales.length > 0 ? (
              <div className="divide-y">
                {recentSales.map(sale => (
                  <div key={sale.id} className="py-3 flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                      <p>{sale.products.length} {translations.products}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(sale.finalAmount)}</p>
                      <p className="text-sm text-green-600">{formatCurrency(sale.profit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{translations.noData}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">{translations.lowStock}</h3>
          </div>
          <div className="p-4">
            {lowStockProducts.length > 0 ? (
              <div className="divide-y">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p>{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-orange-500" />
                      <span className="font-medium">{product.stock} {translations.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{translations.noData}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;