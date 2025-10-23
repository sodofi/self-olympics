"use client";

import { useState } from "react";

// Mock country data with registration counts
const INITIAL_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸", registrations: 1247 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", registrations: 892 },
  { code: "IN", name: "India", flag: "🇮🇳", registrations: 756 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", registrations: 634 },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", registrations: 521 },
  { code: "MX", name: "Mexico", flag: "🇲🇽", registrations: 487 },
  { code: "DE", name: "Germany", flag: "🇩🇪", registrations: 423 },
  { code: "FR", name: "France", flag: "🇫🇷", registrations: 389 },
  { code: "JP", name: "Japan", flag: "🇯🇵", registrations: 312 },
  { code: "CA", name: "Canada", flag: "🇨🇦", registrations: 298 },
];

// All available countries for selection
const ALL_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
];

export default function Home() {
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const handleRegister = (countryCode: string) => {
    const country = ALL_COUNTRIES.find(c => c.code === countryCode);
    if (!country) return;

    setIsRegistered(true);
    setSelectedCountry(countryCode);
    setShowSelector(false);

    // Update or add country to leaderboard
    setCountries(prev => {
      const existing = prev.find(c => c.code === countryCode);
      if (existing) {
        return prev
          .map(c => c.code === countryCode ? { ...c, registrations: c.registrations + 1 } : c)
          .sort((a, b) => b.registrations - a.registrations);
      } else {
        const newCountry = { ...country, registrations: 1 };
        return [...prev, newCountry].sort((a, b) => b.registrations - a.registrations);
      }
    });
  };

  return (
    <main className="min-h-screen bg-celo-tan-light pb-20">
      {/* Hero Section */}
      <section className="bg-celo-purple text-white px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl leading-[0.9] tracking-tight mb-6">
            <span className="block">SELF</span>
            <span className="block italic">OLYMPICS</span>
          </h1>
          <p className="font-sans text-base sm:text-lg font-medium text-celo-tan-dark max-w-2xl">
            Which country will have the most humans? Register your nationality and help your country climb the leaderboard.
          </p>
        </div>
      </section>

      {/* Register Button Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => !isRegistered && setShowSelector(true)}
          disabled={isRegistered}
          className={`w-full py-6 sm:py-8 text-xl sm:text-2xl font-sans font-bold tracking-tight transition-all border-4 ${
            isRegistered
              ? 'bg-celo-forest text-white border-celo-forest cursor-not-allowed'
              : 'bg-celo-yellow text-black border-black hover:bg-black hover:text-celo-yellow hover:border-celo-yellow'
          }`}
        >
          {isRegistered ? '✓ REGISTERED' : 'REGISTER YOUR NATIONALITY'}
        </button>
      </section>

      {/* Leaderboard Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="font-serif text-4xl sm:text-6xl leading-tight tracking-tight mb-2">
            Country <span className="italic">Leaderboard</span>
          </h2>
          <div className="h-1 w-24 bg-black"></div>
        </div>

        <div className="space-y-0 border-4 border-black">
          {countries.map((country, index) => (
            <div
              key={country.code}
              className={`flex items-center justify-between p-4 sm:p-6 border-b-4 border-black last:border-b-0 transition-colors ${
                selectedCountry === country.code
                  ? 'bg-celo-yellow'
                  : index % 2 === 0
                  ? 'bg-white'
                  : 'bg-celo-tan-dark'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                <div className="text-3xl sm:text-4xl font-sans font-black w-12 sm:w-16 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-3xl sm:text-4xl flex-shrink-0">
                  {country.flag}
                </div>
                <div className="font-sans text-base sm:text-xl font-bold uppercase tracking-tight truncate">
                  {country.name}
                </div>
              </div>
              <div className="text-2xl sm:text-4xl font-sans font-black flex-shrink-0 ml-4">
                {country.registrations.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Country Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-celo-tan-light w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[70vh] flex flex-col border-4 border-black sm:rounded-none">
            {/* Header */}
            <div className="bg-celo-purple text-white p-6 border-b-4 border-black flex justify-between items-start">
              <h3 className="font-serif text-3xl sm:text-4xl leading-tight">
                Select Your <span className="italic">Nationality</span>
              </h3>
              <button
                onClick={() => setShowSelector(false)}
                className="text-3xl sm:text-4xl leading-none hover:text-celo-yellow transition-colors"
              >
                ×
              </button>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto flex-1">
              {ALL_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleRegister(country.code)}
                  className="w-full flex items-center gap-4 p-5 sm:p-6 border-b-4 border-black last:border-b-0 hover:bg-celo-yellow transition-colors text-left"
                >
                  <div className="text-3xl sm:text-4xl">{country.flag}</div>
                  <div className="font-sans text-lg sm:text-xl font-bold uppercase tracking-tight">
                    {country.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
