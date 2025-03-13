import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Sale } from '../db';
import { translations } from '../translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const allSales = useLiveQuery(() => db.sales.toArray());
  
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  // Filter sales by date range
  const filteredSales = allSales?.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
  });
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredSales || filteredSales.length === 0) return [];
    
    // Group sales by date
    const salesByDate = filteredSales.reduce((acc: Record<string, any>, sale) => {
      const dateStr = new Date(sale.date).toLocaleDateString('fr-FR');
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          sales: 0,
          profit: 0,
          items: 0
        };
      }
      
      acc[dateStr].sales += sale.finalAmount;
      acc[dateStr].profit += sale.profit;
      acc[dateStr].items += sale.products.reduce((sum, item) => sum + item.quantity, 0);
      
      return acc;
    }, {});
    
    return Object.values(salesByDate);
  };
  
  const chartData = prepareChartData();
  
  // Calculate summary statistics
  const totalSales = filteredSales?.reduce((sum, sale) => sum + sale.finalAmount, 0) || 0;
  const totalProfit = filteredSales?.reduce((sum, sale) => sum + sale.profit, 0) || 0;
  const totalItems = filteredSales?.reduce(
    (sum, sale) => sum + sale.products.reduce((itemSum, item) => itemSum + item.quantity, 0), 
    0
  ) || 0;
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
  };
  
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">{translations.salesReport}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.startDate}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.endDate}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{translations.totalSales}</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalSales)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{translations.totalProfit}</p>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalProfit)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{translations.products}</p>
          <p className="text-2xl font-semibold">{totalItems}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">{translations.salesReport}</h3>
        
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name={translations.sales} fill="#8884d8" />
                <Bar yAxisId="right" dataKey="profit" name={translations.profit} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{translations.noData}</p>
        )}
      </div>
      
      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{translations.salesReport}</h3>
        </div>
        
        {filteredSales && filteredSales.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.saleDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.products}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.discount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.finalAmount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.profit}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sale.products.reduce((sum, item) => sum + item.quantity, 0)} {translations.products}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sale.discountPercentage}%</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(sale.discountAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(sale.finalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(sale.profit)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-4">{translations.noData}</p>
        )}
      </div>
    </div>
  );
};

export default Reports;