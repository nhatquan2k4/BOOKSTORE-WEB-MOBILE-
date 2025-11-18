import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard_Mock';
import Books from './pages/Books_Mock';
import Categories from './pages/Categories_Mock';
import Authors from './pages/Authors_Mock';
import Publishers from './pages/Publishers';
import Orders from './pages/Orders_Mock';
import Users from './pages/Users';
import Stock from './pages/Stock';
import Reviews from './pages/Reviews';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/publishers" element={<Publishers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/reviews" element={<Reviews />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
