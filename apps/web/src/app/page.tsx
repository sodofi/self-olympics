"use client";

import { useState, useEffect } from "react";

// All available countries for selection
const ALL_COUNTRIES = [
  { code: "USA", name: "United States", flag: "🇺🇸" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷" },
  { code: "IND", name: "India", flag: "🇮🇳" },
  { code: "GBR", name: "United Kingdom", flag: "🇬🇧" },
  { code: "NGA", name: "Nigeria", flag: "🇳🇬" },
  { code: "MEX", name: "Mexico", flag: "🇲🇽" },
  { code: "DEU", name: "Germany", flag: "🇩🇪" },
  { code: "FRA", name: "France", flag: "🇫🇷" },
  { code: "JPN", name: "Japan", flag: "🇯🇵" },
  { code: "CAN", name: "Canada", flag: "🇨🇦" },
  { code: "AUS", name: "Australia", flag: "🇦🇺" },
  { code: "ZAF", name: "South Africa", flag: "🇿🇦" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  { code: "ESP", name: "Spain", flag: "🇪🇸" },
  { code: "ITA", name: "Italy", flag: "🇮🇹" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷" },
  { code: "CHN", name: "China", flag: "🇨🇳" },
  { code: "RUS", name: "Russia", flag: "🇷🇺" },
  { code: "PHL", name: "Philippines", flag: "🇵🇭" },
  { code: "IDN", name: "Indonesia", flag: "🇮🇩" },
];

// Helper to get flag emoji for a country code
const getCountryFlag = (code: string) => {
  const country = ALL_COUNTRIES.find(c => c.code === code);
  return country?.flag || "🌍";
};

export default function Home() {
  const [countries, setCountries] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Function to fetch leaderboard from API
  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      
      if (data.success) {
        setCountries(data.leaderboard);
        console.log('✅ Leaderboard loaded:', data.leaderboard.length, 'countries');
      } else {
        setError('Failed to load leaderboard');
        console.error('❌ Leaderboard error:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching leaderboard:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Function to register a country
  const handleRegister = async (countryCode: string) => {
    const country = ALL_COUNTRIES.find(c => c.code === countryCode);
    if (!country) return;

    setRegistering(true);
    setError(null);

    try {
      console.log('📤 Registering country:', country.name);
      
      // Call the register API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: country.code,
          countryName: country.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Registration successful:', data);
        setIsRegistered(true);
        setSelectedCountry(countryCode);
        setShowSelector(false);
        
        // Refresh leaderboard to show updated count
        await fetchLeaderboard();
      } else {
        console.error('❌ Registration failed:', data.error);
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Error registering:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-celo-tan-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-black mb-4"></div>
          <p className="font-sans text-lg font-bold">LOADING LEADERBOARD...</p>
        </div>
      </main>
    );
  }

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
            Which country will have the most registrations? Click to register your country and help it climb the leaderboard.
          </p>
        </div>
      </section>

      {/* Register Button Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => !isRegistered && setShowSelector(true)}
          disabled={isRegistered || registering}
          className={`w-full py-6 sm:py-8 text-xl sm:text-2xl font-sans font-bold tracking-tight transition-all border-4 ${
            isRegistered
              ? 'bg-celo-forest text-white border-celo-forest cursor-not-allowed'
              : registering
              ? 'bg-gray-400 text-white border-gray-600 cursor-wait'
              : 'bg-celo-yellow text-black border-black hover:bg-black hover:text-celo-yellow hover:border-celo-yellow'
          }`}
        >
          {isRegistered ? '✓ REGISTERED' : registering ? 'REGISTERING...' : 'REGISTER YOUR COUNTRY'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border-4 border-red-600 text-red-800 font-sans font-bold">
            ⚠️ {error}
          </div>
        )}
      </section>

      {/* Leaderboard Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="font-serif text-4xl sm:text-6xl leading-tight tracking-tight mb-2">
            Country <span className="italic">Leaderboard</span>
          </h2>
          <div className="h-1 w-24 bg-black"></div>
        </div>

        {countries.length === 0 ? (
          <div className="border-4 border-black bg-white p-8 text-center">
            <p className="font-sans text-xl font-bold">No countries registered yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-0 border-4 border-black">
            {countries.map((country, index) => (
              <div
                key={country.countryCode}
                className={`flex items-center justify-between p-4 sm:p-6 border-b-4 border-black last:border-b-0 transition-colors ${
                  selectedCountry === country.countryCode
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
                    {getCountryFlag(country.countryCode)}
                  </div>
                  <div className="font-sans text-base sm:text-xl font-bold uppercase tracking-tight truncate">
                    {country.countryName}
                  </div>
                </div>
                <div className="text-2xl sm:text-4xl font-sans font-black flex-shrink-0 ml-4">
                  {country.count.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Country Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-celo-tan-light w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[70vh] flex flex-col border-4 border-black sm:rounded-none">
            {/* Header */}
            <div className="bg-celo-purple text-white p-6 border-b-4 border-black flex justify-between items-start">
              <h3 className="font-serif text-3xl sm:text-4xl leading-tight">
                Select Your <span className="italic">Country</span>
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
                  disabled={registering}
                  className="w-full flex items-center gap-4 p-5 sm:p-6 border-b-4 border-black last:border-b-0 hover:bg-celo-yellow transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
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
