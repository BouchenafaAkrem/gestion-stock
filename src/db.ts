import Dexie, { Table } from 'dexie';

// Définition des types
export interface Product {
  id?: number;
  name: string;
  description: string;
  wholesalePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  createdAt: Date;
}

export interface Sale {
  id?: number;
  date: Date;
  products: SaleItem[];
  totalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
  profit: number;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  wholesalePrice: number;
  sellingPrice: number;
  totalPrice: number;
}

// Création de la base de données
class StockManagerDB extends Dexie {
  products!: Table<Product, number>;
  sales!: Table<Sale, number>;

  constructor() {
    super('StockManagerDB');
    this.version(1).stores({
      products: '++id, name, category',
      sales: '++id, date'
    });
  }
}

export const db = new StockManagerDB();

// Fonctions utilitaires pour la base de données
export async function addProduct(product: Product): Promise<number> {
  return await db.products.add({
    ...product,
    createdAt: new Date()
  });
}

export async function updateProduct(id: number, changes: Partial<Product>): Promise<number> {
  return await db.products.update(id, changes);
}

export async function deleteProduct(id: number): Promise<void> {
  await db.products.delete(id);
}

export async function getProduct(id: number): Promise<Product | undefined> {
  return await db.products.get(id);
}

export async function getAllProducts(): Promise<Product[]> {
  return await db.products.toArray();
}

export async function addSale(sale: Sale): Promise<number> {
  // Mise à jour du stock pour chaque produit vendu
  for (const item of sale.products) {
    const product = await getProduct(item.productId);
    if (product) {
      await updateProduct(item.productId, {
        stock: product.stock - item.quantity
      });
    }
  }
  
  return await db.sales.add(sale);
}

export async function getAllSales(): Promise<Sale[]> {
  return await db.sales.toArray();
}

export async function getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
  return await db.sales
    .where('date')
    .between(startDate, endDate)
    .toArray();
}

export function calculateProfit(wholesalePrice: number, sellingPrice: number, quantity: number, discountPercentage: number = 0): number {
  const discount = (sellingPrice * quantity) * (discountPercentage / 100);
  return (sellingPrice * quantity - discount) - (wholesalePrice * quantity);
}