"use client";

import { useState, useEffect } from "react";
import { SelfVerification } from "@/components/self-verification";

// Helper to get flag emoji for a country code (simple mapping)
const getCountryFlag = (code: string) => {
  const flagMap: Record<string, string> = {
    USA: "🇺🇸", BRA: "🇧🇷", IND: "🇮🇳", GBR: "🇬🇧", NGA: "🇳🇬",
    MEX: "🇲🇽", DEU: "🇩🇪", FRA: "🇫🇷", JPN: "🇯🇵", CAN: "🇨🇦",
    AUS: "🇦🇺", ZAF: "🇿🇦", ARG: "🇦🇷", ESP: "🇪🇸", ITA: "🇮🇹",
    KOR: "🇰🇷", CHN: "🇨🇳", RUS: "🇷🇺", PHL: "🇵🇭", IDN: "🇮🇩",
  };
  return flagMap[code] || "🌍";
};

export default function Home() {
  const [countries, setCountries] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showAlreadyRegisteredPopup, setShowAlreadyRegisteredPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [popupCountry, setPopupCountry] = useState<string>("");

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

  // Handle successful Self verification
  const handleVerificationSuccess = async (data: { countryCode: string; countryName: string; message: string }) => {
    console.log('🎉 Verification successful:', data);
    setIsRegistered(true);
    setSelectedCountry(data.countryCode);
    setPopupCountry(data.countryName);
    setPopupMessage(data.message);
    setShowVerification(false);
    setShowSuccessPopup(true);
    
    // Auto-hide success popup after 5 seconds
    setTimeout(() => setShowSuccessPopup(false), 5000);
    
    // Refresh leaderboard
    await fetchLeaderboard();
  };

  // Handle already registered case
  const handleAlreadyRegistered = (data: { countryCode: string; countryName: string; message: string }) => {
    console.log('⚠️ Already registered:', data);
    setIsRegistered(true);
    setSelectedCountry(data.countryCode);
    setPopupCountry(data.countryName);
    setPopupMessage(data.message);
    setShowVerification(false);
    setShowAlreadyRegisteredPopup(true);
    
    // Auto-hide popup after 5 seconds
    setTimeout(() => setShowAlreadyRegisteredPopup(false), 5000);
  };

  // Handle verification error
  const handleVerificationError = (errorMessage: string) => {
    console.error('❌ Verification error:', errorMessage);
    setError(errorMessage);
    // Keep modal open so user can try again
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
          onClick={() => !isRegistered && setShowVerification(true)}
          disabled={isRegistered}
          className={`w-full py-6 sm:py-8 text-xl sm:text-2xl font-sans font-bold tracking-tight transition-all border-4 ${
            isRegistered
              ? 'bg-celo-forest text-white border-celo-forest cursor-not-allowed'
              : 'bg-celo-yellow text-black border-black hover:bg-black hover:text-celo-yellow hover:border-celo-yellow'
          }`}
        >
          {isRegistered ? '✓ REGISTERED' : 'REGISTER YOUR COUNTRY'}
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

      {/* Self Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-celo-purple w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-black rounded-lg">
            {/* Header */}
            <div className="p-6 border-b-4 border-black flex justify-between items-start">
              <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-white">
                Self <span className="italic">Verification</span>
              </h3>
              <button
                onClick={() => {
                  setShowVerification(false);
                  setError(null);
                }}
                className="text-white text-3xl sm:text-4xl leading-none hover:text-celo-yellow transition-colors"
              >
                ×
              </button>
            </div>

            {/* Self QR Code Component */}
            <div className="p-4 sm:p-6">
              <SelfVerification
                onSuccess={handleVerificationSuccess}
                onError={handleVerificationError}
                onAlreadyRegistered={handleAlreadyRegistered}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed bottom-8 right-8 z-50 max-w-md animate-slide-in">
          <div className="bg-celo-forest border-4 border-black p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <h4 className="font-sans text-xl font-bold text-white mb-2">
                  Registration Successful!
                </h4>
                <p className="font-sans text-white">
                  Adding <strong>{popupCountry}</strong> to the leaderboard...
                </p>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="text-white hover:text-celo-yellow text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already Registered Popup */}
      {showAlreadyRegisteredPopup && (
        <div className="fixed bottom-8 right-8 z-50 max-w-md animate-slide-in">
          <div className="bg-celo-yellow border-4 border-black p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h4 className="font-sans text-xl font-bold text-black mb-2">
                  Already Registered!
                </h4>
                <p className="font-sans text-black">
                  {popupMessage}
                </p>
              </div>
              <button
                onClick={() => setShowAlreadyRegisteredPopup(false)}
                className="text-black hover:text-celo-purple text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
