import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, products, dailyTransactions, transactionItems } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getSessionId, validateSession } from '$lib/server/auth';
import * as XLSX from 'xlsx';

export const GET: RequestHandler = async (event) => {
  try {
    const sessionId = getSessionId(event);
    if (!sessionId) throw error(401, 'Unauthorized');

    const user = await validateSession(sessionId);
    if (!user || user.role !== 'admin') {
      throw error(403, 'Forbidden');
    }

    // Get date range from query params
    const url = event.url;
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(today.getDate() - 7);

    const dateFrom = url.searchParams.get('from') || defaultFrom.toISOString().split('T')[0];
    const dateTo = url.searchParams.get('to') || today.toISOString().split('T')[0];

    // Get all transactions in date range
    const transactions = await db
      .select({
        id: dailyTransactions.id,
        date: dailyTransactions.date,
        supplierId: dailyTransactions.supplierId,
        supplierName: users.name,
        totalItemsIn: dailyTransactions.totalItemsIn,
        totalItemsSold: dailyTransactions.totalItemsSold,
        totalPayout: dailyTransactions.totalPayout,
        status: dailyTransactions.status,
      })
      .from(dailyTransactions)
      .leftJoin(users, eq(dailyTransactions.supplierId, users.id))
      .where(and(
        gte(dailyTransactions.date, dateFrom),
        lte(dailyTransactions.date, dateTo)
      ));

    // Get all products
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        priceBuy: products.priceBuy,
        priceSell: products.priceSell,
        supplierName: users.name,
        status: products.status,
      })
      .from(products)
      .leftJoin(users, eq(products.supplierId, users.id));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Daily Summary
    const dailySummaryData = transactions.map(tx => ({
      'Tanggal': tx.date,
      'Penyetor': tx.supplierName || 'Unknown',
      'Item Masuk': tx.totalItemsIn,
      'Item Terjual': tx.totalItemsSold,
      'Sisa': tx.totalItemsIn - tx.totalItemsSold,
      'Bayar Penyetor (Rp)': tx.totalPayout,
      'Status': tx.status === 'completed' ? 'Selesai' : tx.status === 'verified' ? 'Terverifikasi' : 'Draft',
    }));

    const wsDailySummary = XLSX.utils.json_to_sheet(dailySummaryData);
    XLSX.utils.book_append_sheet(wb, wsDailySummary, 'Laporan Harian');

    // Sheet 2: Supplier Summary
    const supplierMap = new Map<string, {
      transactionCount: number;
      totalIn: number;
      totalSold: number;
      totalPayout: number;
    }>();

    transactions.forEach(tx => {
      const name = tx.supplierName || 'Unknown';
      const existing = supplierMap.get(name);
      if (existing) {
        existing.transactionCount++;
        existing.totalIn += tx.totalItemsIn;
        existing.totalSold += tx.totalItemsSold;
        existing.totalPayout += tx.totalPayout;
      } else {
        supplierMap.set(name, {
          transactionCount: 1,
          totalIn: tx.totalItemsIn,
          totalSold: tx.totalItemsSold,
          totalPayout: tx.totalPayout,
        });
      }
    });

    const supplierSummaryData = Array.from(supplierMap.entries()).map(([name, data]) => ({
      'Penyetor': name,
      'Jumlah Transaksi': data.transactionCount,
      'Total Setor': data.totalIn,
      'Total Terjual': data.totalSold,
      'Total Bayar (Rp)': data.totalPayout,
    }));

    const wsSupplierSummary = XLSX.utils.json_to_sheet(supplierSummaryData);
    XLSX.utils.book_append_sheet(wb, wsSupplierSummary, 'Rekap Penyetor');

    // Sheet 3: Products
    const productsData = allProducts.map(p => ({
      'Nama Produk': p.name,
      'Penyetor': p.supplierName || 'Unknown',
      'Harga Beli (Rp)': p.priceBuy,
      'Harga Jual (Rp)': p.priceSell,
      'Margin (Rp)': p.priceSell - p.priceBuy,
      'Status': p.status === 'approved' ? 'Aktif' : p.status === 'pending' ? 'Pending' : p.status,
    }));

    const wsProducts = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Daftar Produk');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    const filename = `Laporan_MakUnyil_${dateFrom}_${dateTo}.xlsx`;

    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    throw error(500, 'Failed to export');
  }
};
