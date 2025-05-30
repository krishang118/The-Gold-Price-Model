import React from 'react';

const Header = () => {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
  const formattedDate = `${day}/${month}`;
  let hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm} IST`;
  return (
    <header className="bg-gray-900 shadow-lg border-b border-amber-600/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                The Gold Price Predictor
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Predicting what's precious.
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-gray-300 text-sm">Last Updated {formattedDate}, {formattedTime}.</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;