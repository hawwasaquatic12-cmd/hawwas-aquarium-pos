import React, { useState, useEffect } from 'react';
const INITIAL_INVENTORY = [
  { id: 'p1', name: "Komet", cost: 2000, price: 3000, stock: 200, category: "Ikan" },
  { id: 'p2', name: "Koki SM", cost: 3500, price: 5000, stock: 100, category: "Ikan" },
  { id: 'p3', name: "Cupang HM", cost: 3500, price: 5000, stock: 80, category: "Ikan" },
  { id: 'p4', name: "Cupang Betina", cost: 3000, price: 4500, stock: 70, category: "Ikan" },
  { id: 'p5', name: "Cupang Bagan", cost: 5000, price: 7500, stock: 40, category: "Ikan" },
  { id: 'p6', name: "Channa Maru", cost: 25000, price: 37500, stock: 10, category: "Ikan" },
  { id: 'p7', name: "Channa BP", cost: 30000, price: 45000, stock: 8, category: "Ikan" },
  { id: 'p8', name: "Glowfish", cost: 2500, price: 3800, stock: 60, category: "Ikan" },
  { id: 'p9', name: "Sumatera Glow", cost: 3000, price: 4500, stock: 50, category: "Ikan" },
  { id: 'p10', name: "Manfish", cost: 2500, price: 3800, stock: 100, category: "Ikan" },
  { id: 'p11', name: "Cupang Multi", cost: 10000, price: 15000, stock: 25, category: "Ikan" },
  { id: 'p12', name: "Takari", cost: 4000, price: 6000, stock: 100, category: "Pakan" },
  { id: 'p13', name: "Agarau", cost: 8500, price: 12500, stock: 50, category: "Pakan" },
  { id: 'p14', name: "Pelet Botol", cost: 3500, price: 5000, stock: 50, category: "Pakan" },
  { id: 'p15', name: "Obat Biru", cost: 38000, price: 57000, stock: 5, category: "Obat" },
  { id: 'p16', name: "Tanaman Plastik", cost: 1500, price: 2500, stock: 100, category: "Pernak" },
  { id: 'p17', name: "Batu Hias", cost: 10000, price: 15000, stock: 20, category: "Pernak" },
  { id: 'p18', name: "Aquarium Cupang", cost: 10000, price: 15000, stock: 30, category: "Pernak" },
  { id: 'p19', name: "Aerator", cost: 20000, price: 30000, stock: 10, category: "Pernak" },
  { id: 'p20', name: "Serokan", cost: 2500, price: 3800, stock: 60, category: "Pernak" }
];
export default function PosIkan({ mode, userEmail }){
  const [inventory, setInventory] = useState(()=>{
    const saved = localStorage.getItem('hawwas_inventory_v1');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [cart, setCart] = useState([]);
  const [cash, setCash] = useState('');
  const [transactions, setTransactions] = useState(()=>{
    const saved = localStorage.getItem('hawwas_txns_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [keyword, setKeyword] = useState('');
  useEffect(()=>{ localStorage.setItem('hawwas_inventory_v1', JSON.stringify(inventory)); }, [inventory]);
  useEffect(()=>{ localStorage.setItem('hawwas_txns_v1', JSON.stringify(transactions)); }, [transactions]);
  function addToCart(p){
    if(p.stock <= 0){ alert('Stok habis'); return; }
    setCart(c=>{
      const f = c.find(x=>x.id===p.id);
      if(f) return c.map(x=> x.id===p.id ? {...x, qty: x.qty+1} : x);
      return [...c, {...p, qty:1}];
    });
  }
  function changeQty(id, qty){
    if(qty<=0) setCart(c=>c.filter(x=>x.id!==id));
    else setCart(c=>c.map(x=> x.id===id?{...x, qty}:x));
  }
  function subtotal(){ return cart.reduce((s,it)=> s + it.price*it.qty, 0); }
  function complete(){
    if(cart.length===0) { alert('Keranjang kosong'); return; }
    const total = subtotal();
    const cashNum = Number(cash || 0);
    if(cashNum < total){ alert('Uang kurang'); return; }
    const newInv = inventory.map(it=>{
      const sold = cart.find(c=>c.id===it.id);
      if(!sold) return it;
      return {...it, stock: Math.max(0, it.stock - sold.qty)};
    });
    setInventory(newInv);
    const txn = { id: Date.now().toString(), date: new Date().toLocaleString(), items: cart, total, cash: cashNum, change: cashNum - total, cashier: userEmail || 'Kasir' };
    setTransactions(t=> [txn, ...t]);
    const html = `<html><body><pre style="font-family:monospace">Hawwas Aquarium
Jl. Girimaya No.70
WA: 082282147465
----------------------
${cart.map(i=> i.name+' x'+i.qty+' = Rp '+(i.price*i.qty)).join('
')}
----------------------
TOTAL: Rp ${total}
Tunai: Rp ${cashNum}
Kembali: Rp ${cashNum - total}

Terima kasih!</pre></body></html>`;
    const w = window.open('','_blank','width=300,height=600'); if(w){ w.document.write(html); w.document.close(); setTimeout(()=>w.print(),500); }
    setCart([]); setCash('');
  }
  function exportCSV(){
    if(transactions.length===0){ alert('Belum ada transaksi'); return; }
    const rows = ['id,date,cashier,total,cash,change,items'];
    for(const t of transactions){
      const items = t.items.map(i=>`${i.name} x${i.qty}`).join(' | ');
      rows.push([t.id,`"${t.date}"`,t.cashier,t.total,t.cash,t.change,`"${items}"`].join(','));
    }
    const blob = new Blob([rows.join('
')], {type:'text/csv'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='transactions.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="pos-root">
      <div className="controls">
        <input placeholder="Cari produk..." value={keyword} onChange={(e)=>setKeyword(e.target.value)} className="search" />
        <div className="mode">Mode: {mode}</div>
      </div>
      <div className="grid">
        <div className="catalog">
          {inventory.filter(p=> p.name.toLowerCase().includes(keyword.toLowerCase())).map(p => (
            <div key={p.id} className="card">
              <div className="title">{p.name}</div>
              <div className="meta">Stok: {p.stock}</div>
              <div className="price">Rp {p.price}</div>
              <div className="actions"><button onClick={()=>addToCart(p)}>Tambah</button></div>
            </div>
          ))}
        </div>
        <div className="checkout">
          <h3>Keranjang</h3>
          <div className="items">
            {cart.map(c=> (
              <div key={c.id} className="item">
                <div>{c.name} x{c.qty}</div>
                <div>
                  <input type="number" value={c.qty} min={1} onChange={(e)=>changeQty(c.id, Number(e.target.value))} className="qty" />
                  <div className="line">Rp {c.price * c.qty}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="summary">
            <div>Subtotal: Rp {subtotal()}</div>
            <input placeholder="Tunai diterima" value={cash} onChange={(e)=>setCash(e.target.value)} className="cash" />
            <div>Kembalian: Rp {Math.max(0, Number(cash || 0) - subtotal())}</div>
            <button onClick={complete} className="pay">Selesai & Cetak</button>
            <button onClick={exportCSV} className="csv">Ekspor CSV</button>
          </div>
        </div>
      </div>
    </div>
  )
}
