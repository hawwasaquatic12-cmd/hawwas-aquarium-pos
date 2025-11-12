import React from 'react'
import PosApp from './PosApp'

export default function App(){
  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <h1>Hawwas Aquarium</h1>
          <div className="subtitle">POS • Penjualan Ikan Hias</div>
        </div>
      </header>
      <main className="main">
        <PosApp />
      </main>
    </div>
  )
}
