"use client";
import { useMiniApp } from "@/contexts/miniapp-context";
import { sdk } from "@farcaster/frame-sdk";
import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

export default function Home() {
  const { context, isMiniAppReady } = useMiniApp();
  const [isAddingMiniApp, setIsAddingMiniApp] = useState(false);
  const [addMiniAppMessage, setAddMiniAppMessage] = useState<string | null>(null);
  
  // Wallet connection hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  
  // Auto-connect wallet when miniapp is ready
  useEffect(() => {
    if (isMiniAppReady && !isConnected && !isConnecting && connectors.length > 0) {
      const farcasterConnector = connectors.find(c => c.id === 'farcaster');
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
    }
  }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);
  
  // Extract user data from context
  const user = context?.user;
  // Use connected wallet address if available, otherwise fall back to user custody/verification
  const walletAddress = address || user?.custody || user?.verifications?.[0] || "0x1e4B...605B";
  const displayName = user?.displayName || user?.username || "User";
  const username = user?.username || "@user";
  const pfpUrl = user?.pfpUrl;
  
  // Format wallet address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  if (!isMiniAppReady) {
    return (
      <main className="flex-1">
        <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="w-full max-w-md mx-auto p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </section>
      </main>
    );
  }
  
  return (
    <main className="flex-1">
      <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md mx-auto p-8 text-center">
          {/* Welcome Header */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome
          </h1>
          
          {/* Status Message */}
          <p className="text-lg text-gray-600 mb-6">
            You are signed in!
          </p>
          
          {/* User Wallet Address */}
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">Wallet Status</span>
                <div className={`flex items-center gap-1 text-xs ${
                  isConnected ? 'text-green-600' : isConnecting ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </div>
              </div>
              <p className="text-sm text-gray-700 font-mono">
                {formatAddress(walletAddress)}
              </p>
            </div>
          </div>
          
          {/* User Profile Section */}
          <div className="mb-8">
            {/* Profile Avatar */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
              {pfpUrl ? (
                <img 
                  src={pfpUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {displayName}
              </h2>
              <p className="text-gray-500">
                {username.startsWith('@') ? username : `@${username}`}
              </p>
            </div>
          </div>
          
          {/* Add Miniapp Button */}
          <div className="mb-6">
            <button
              onClick={async () => {
                if (isAddingMiniApp) return;
                
                setIsAddingMiniApp(true);
                setAddMiniAppMessage(null);
                
                try {
                  const result = await sdk.actions.addMiniApp();
                  if (result.added) {
                    setAddMiniAppMessage("✅ Miniapp added successfully!");
                  } else {
                    setAddMiniAppMessage("ℹ️ Miniapp was not added (user declined or already exists)");
                  }
                } catch (error: any) {
                  console.error('Add miniapp error:', error);
                  if (error?.message?.includes('domain')) {
                    setAddMiniAppMessage("⚠️ This miniapp can only be added from its official domain");
                  } else {
                    setAddMiniAppMessage("❌ Failed to add miniapp. Please try again.");
                  }
                } finally {
                  setIsAddingMiniApp(false);
                }
              }}
              disabled={isAddingMiniApp}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isAddingMiniApp ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <span>📱</span>
                  Add Miniapp
                </>
              )}
            </button>
            
            {/* Add Miniapp Status Message */}
            {addMiniAppMessage && (
              <div className="mt-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-gray-700">{addMiniAppMessage}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
