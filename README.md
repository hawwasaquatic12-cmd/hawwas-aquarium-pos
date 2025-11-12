# hawwas-aquarium-pos
Aplikasi Penjualan Ikan Hias - Hawwas Aquarium
import React, { useState, useEffect, useRef } from "react";

// POS sederhana untuk usaha ikan hias Mr.F
// - Single-file React component
// - Tailwind CSS utility classes assumed available in hosting app
// - Fitur: katalog inventory, tambah ke keranjang, cetak struk (print-friendly)
// - Menyimpan data transaksi di localStorage

const INITIAL_INVENTORY = [
  { id: 1, name: "Komet", cost: 2000, price: 3000, stock: 200, category: "Ikan" },
  { id: 2, name: "Koki SM", cost: 3500, price: 5000, stock: 100, category: "Ikan" },
  { id: 3, name: "Cupang HM", cost: 3500, price: 5000, stock: 80, category: "Ikan" },
  { id: 4, name: "Cupang Betina", cost: 3000, price: 4500, stock: 70, category: "Ikan" },
  { id: 5, name: "Cupang Bagan", cost: 5000, price: 7500, stock: 40, category: "Ikan" },
  { id: 6, name: "Channa Maru", cost: 25000, price: 37500, stock: 10, category: "Ikan" },
  { id: 7, name: "Channa BP", cost: 30000, price: 45000, stock: 8, category: "Ikan" },
  { id: 8, name: "Glowfish", cost: 2500, price: 3800, stock: 60, category: "Ikan" },
  { id: 9, name: "Sumatera Glow", cost: 3000, price: 4500, stock: 50, category: "Ikan" },
  { id: 10, name: "Manfish", cost: 2500, price: 3800, stock: 100, category: "Ikan" },
  { id: 11, name: "Cupang Multi", cost: 10000, price: 15000, stock: 25, category: "Ikan" },
  { id: 12, name: "Takari (pakan)", cost: 4000, price: 6000, stock: 100, category: "Pakan" },
  { id: 13, name: "Agarau (pakan)", cost: 8500, price: 12500, stock: 50, category: "Pakan" },
  { id: 14, name: "Pelet Botol", cost: 3500, price: 5000, stock: 50, category: "Pakan" },
  { id: 15, name: "Obat Biru (pack)", cost: 38000, price: 57000, stock: 5, category: "Obat" },
  { id: 16, name: "Tanaman Plastik", cost: 1500, price: 2500, stock: 100, category: "Pernak" },
  { id: 17, name: "Batu Hias (/kg)", cost: 10000, price: 15000, stock: 20, category: "Pernak" },
  { id: 18, name: "Aquarium Cupang", cost: 10000, price: 15000, stock: 30, category: "Pernak" },
  { id: 19, name: "Aerator (1 lubang)", cost: 20000, price: 30000, stock: 10, category: "Pernak" },
  { id: 20, name: "Serokan (rata-rata)", cost: 2500, price: 3800, stock: 60, category: "Pernak" }
];

export default function PosIkanHiasMrF() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("pos_inventory_v1");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [cart, setCart] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cashReceived, setCashReceived] = useState(0);
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("pos_txns_v1");
    return saved ? JSON.parse(saved) : [];
  });

  const receiptRef = useRef();

  useEffect(() => {
    localStorage.setItem("pos_inventory_v1", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("pos_txns_v1", JSON.stringify(transactions));
  }, [transactions]);

  const filtered = inventory.filter((it) => {
    const matchKeyword = it.name.toLowerCase().includes(keyword.toLowerCase());
    const matchCategory = categoryFilter === "All" || it.category === categoryFilter;
    return matchKeyword && matchCategory;
  });

  function addToCart(item) {
    if (item.stock <= 0) return alert("Stok habis");
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      if (found) {
        if (found.qty + 1 > item.stock) return c;
        return c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...c, { ...item, qty: 1 }];
    });
  }

  function changeQty(id, qty) {
    if (qty < 1) return removeFromCart(id);
    const invItem = inventory.find((i) => i.id === id);
    if (qty > invItem.stock) return alert("Melebihi stok");
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  }

  function removeFromCart(id) {
    setCart((c) => c.filter((x) => x.id !== id));
  }

  function subtotal() {
    return cart.reduce((s, it) => s + it.price * it.qty, 0);
  }

  function completeSale() {
    if (cart.length === 0) return alert("Keranjang kosong");
    const total = subtotal();
    if (cashReceived < total) return alert("Uang tunai kurang");

    // kurangi stok
    const newInventory = inventory.map((it) => {
      const sold = cart.find((c) => c.id === it.id);
      if (!sold) return it;
      return { ...it, stock: it.stock - sold.qty };
    });
    setInventory(newInventory);

    // buat transaksi
    const txn = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      total,
      cash: cashReceived,
      change: cashReceived - total
    };
    setTransactions((t) => [txn, ...t]);

    // cetak struk (menggunakan window.open untuk area print-friendly)
    printReceipt(txn);

    // reset
    setCart([]);
    setCashReceived(0);
  }

  function printReceipt(txn) {
    const printContent = renderReceiptHtml(txn);
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return alert("Pop-up diblokir. Izinkan pop-up untuk mencetak struk.");
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      // w.close(); // optional
    }, 500);
  }

  function renderReceiptHtml(txn) {
    const storeName = "Toko Ikan Hias Mr.F";
    const header = `<div style="font-family: Arial, Helvetica, sans-serif; width:300px;">
      <h2 style="margin:0;">${storeName}</h2>
      <div style="font-size:12px;">Jl. Contoh No.1 — Pangkalpinang</div>
      <div style="font-size:12px;">${txn.date}</div>
      <hr/>
    `;

    const itemsHtml = txn.items
      .map(
        (it) =>
          `<div style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0;"><div>${it.name} x${it.qty}</div><div>Rp ${formatNumber(
            it.price * it.qty
          )}</div></div>`
      )
      .join("");

    const footer = `
      <hr/>
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold;"><div>Total</div><div>Rp ${formatNumber(
        txn.total
      )}</div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;"><div>Tunai</div><div>Rp ${formatNumber(txn.cash)}</div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;"><div>Kembali</div><div>Rp ${formatNumber(txn.change)}</div></div>
      <p style="font-size:11px;text-align:center;margin-top:10px;">Terima kasih! Kunjungi lagi ❤️</p>
      </div>
    `;

    return `<html><head><title>Struk ${txn.id}</title><style>@media print{body{margin:0}} body{padding:8px}</style></head><body>${header}${itemsHtml}${footer}</body></html>`;
  }

  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function quickAddStock(id, delta) {
    setInventory((inv) => inv.map((it) => (it.id === id ? { ...it, stock: Math.max(0, it.stock + delta) } : it)));
  }

  function exportTransactionsCSV() {
    if (transactions.length === 0) return alert("Belum ada transaksi");
    const rows = [
      ["id", "date", "items", "total", "cash", "change"].join(",")
    ];
    transactions.forEach((t) => {
      const items = t.items.map((i) => `${i.name} x${i.qty}`).join(" | ");
      rows.push([t.id, `"${t.date}"`, `"${items}"`, t.total, t.cash, t.change].join(","));
    });
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-start gap-4">
        {/* Left: katalog */}
        <div className="w-2/3 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 items-center">
              <input className="border rounded px-2 py-1" placeholder="Cari..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-2 py-1">
                <option>All</option>
                <option>Ikan</option>
                <option>Pakan</option>
                <option>Obat</option>
                <option>Pernak</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">Transaksi: {transactions.length}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {filtered.map((it) => (
              <div key={it.id} className="border rounded p-2 flex flex-col justify-between">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-xs text-gray-600">Kategori: {it.category}</div>
                  <div className="mt-1 text-sm">Stok: {it.stock}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm">Rp {formatNumber(it.price)}</div>
                    <div className="text-xs text-gray-500">Modal Rp {formatNumber(it.cost)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => addToCart(it)} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm">Tambah</button>
                    <div className="flex gap-1">
                      <button onClick={() => quickAddStock(it.id, 1)} className="px-2 py-0.5 border rounded text-xs">+st</button>
                      <button onClick={() => quickAddStock(it.id, -1)} className="px-2 py-0.5 border rounded text-xs">-st</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: keranjang & aksi */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4 flex flex-col gap-3">
          <h3 className="font-bold text-lg">Keranjang</h3>
          <div className="flex-1 overflow-auto">
            {cart.length === 0 && <div className="text-sm text-gray-500">Keranjang kosong</div>}
            {cart.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b py-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">Rp {formatNumber(c.price)} x {c.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={c.qty} min={1} onChange={(e) => changeQty(c.id, Number(e.target.value))} className="w-16 border rounded px-2 py-1 text-right text-sm" />
                  <div className="text-sm">Rp {formatNumber(c.price * c.qty)}</div>
                  <button onClick={() => removeFromCart(c.id)} className="text-red-500 text-xs">hapus</button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-sm"><div>Subtotal</div><div>Rp {formatNumber(subtotal())}</div></div>
            <div className="flex justify-between text-sm"><div>Diskon</div><div>-</div></div>
            <div className="flex justify-between text-lg font-bold mt-2"><div>Total</div><div>Rp {formatNumber(subtotal())}</div></div>

            <div className="mt-2">
              <input type="number" placeholder="Tunai diterima" value={cashReceived} onChange={(e) => setCashReceived(Number(e.target.value))} className="w-full border rounded px-2 py-1" />
              <div className="text-sm mt-1">Kembalian: Rp {formatNumber(Math.max(0, cashReceived - subtotal()))}</div>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={completeSale} className="flex-1 bg-blue-600 text-white rounded px-3 py-2">Selesai & Cetak</button>
              <button onClick={() => { setCart([]); setCashReceived(0); }} className="bg-gray-200 px-3 py-2 rounded">Bersihkan</button>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={exportTransactionsCSV} className="flex-1 bg-yellow-500 text-white rounded px-3 py-2 text-sm">Ekspor Transaksi</button>
              <button onClick={() => { localStorage.removeItem('pos_txns_v1'); setTransactions([]); }} className="bg-red-500 text-white px-3 py-2 rounded text-sm">Hapus Riwayat</button>
            </div>

            <div className="mt-3 text-xs text-gray-500">Struk akan terbuka di jendela baru untuk dicetak. Izinkan pop-up jika diblokir.</div>
          </div>
        </div>
      </div>

      {/* Riwayat transaksi singkat bawah */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold">Riwayat Transaksi (terbaru)</h4>
          <div className="text-sm text-gray-600">{transactions.length} transaksi</div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {transactions.slice(0, 8).map((t) => (
            <div key={t.id} className="border rounded p-2">
              <div className="text-xs text-gray-500">{t.date}</div>
              <div className="font-medium">Total: Rp {formatNumber(t.total)}</div>
              <div className="text-xs">Items: {t.items.length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
