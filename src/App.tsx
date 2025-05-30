import React from 'react';
import Header from './components/Header';
import Overview from './components/Overview';
import DailyForecast from './components/DailyForecast';
import MonthlyForecast from './components/MonthlyForecast';
import Footer from './components/Footer';
function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Overview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <DailyForecast />
          <MonthlyForecast />
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default App;