'use client';

import React, { useState, useEffect } from 'react';
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";

interface SelfVerificationProps {
  onSuccess: (data: { countryCode: string; countryName: string; message: string }) => void;
  onError: (error: string) => void;
  onAlreadyRegistered: (data: { countryCode: string; countryName: string; message: string }) => void;
}

export function SelfVerification({ onSuccess, onError, onAlreadyRegistered }: SelfVerificationProps) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId] = useState(ethers.ZeroAddress);

  useEffect(() => {
    let isMounted = true;

    const initializeSelf = async () => {
      try {
        console.log('🔄 Initializing Self app...');
        console.log('Environment variables:', {
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME,
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE,
          endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT,
        });

        // Build Self app configuration
        const app = new SelfAppBuilder({
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Olympics",
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-olympics-2024",
          endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "http://localhost:3000/api/register",
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
          userId: userId,
          endpointType: "staging_https",
          userIdType: "hex",
          userDefinedData: JSON.stringify({ timestamp: Date.now() }),
          disclosures: {
            nationality: true,
          }
        }).build();

        console.log('✅ Self app configuration built:', app);
        
        if (isMounted) {
          setSelfApp(app);
          const link = getUniversalLink(app);
          setUniversalLink(link);
          setIsLoading(false);
          
          console.log('✅ Self QR code initialized');
          console.log('Universal link:', link);
        }
      } catch (error) {
        console.error("❌ Failed to initialize Self app:", error);
        if (isMounted) {
          setIsLoading(false);
          setLoadError(error instanceof Error ? error.message : 'Unknown error');
          onError(`Failed to initialize verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };

    initializeSelf();

    return () => {
      isMounted = false;
    };
  }, [userId, onError]);

  const handleSuccessfulVerification = async (response: any) => {
    console.log("🎉 Self verification completed!");
    console.log("Response type:", typeof response);
    console.log("Response:", JSON.stringify(response, null, 2));
    
    setIsVerifying(false);

    try {
      // The response comes from our /api/register endpoint
      if (response && response.success) {
        console.log("✅ Registration successful:", response);
        // Successfully registered
        onSuccess({
          countryCode: response.countryCode,
          countryName: response.countryName,
          message: response.message
        });
      } else if (response && response.alreadyRegistered) {
        console.log("⚠️ Already registered:", response);
        // User already registered
        onAlreadyRegistered({
          countryCode: response.countryCode,
          countryName: response.countryName,
          message: response.message
        });
      } else {
        console.log("❌ Verification failed:", response);
        // Verification failed
        onError(response?.error || response?.message || "Verification failed");
      }
    } catch (error) {
      console.error("❌ Error handling verification response:", error);
      onError("Failed to process verification result");
    }
  };

  const handleVerificationError = (error: any) => {
    console.error("❌ Self verification error:", error);
    setIsVerifying(false);
    
    if (error?.message) {
      onError(`Verification failed: ${error.message}`);
    } else {
      onError("Verification failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Verify Your Country</h2>
        <p className="text-gray-400 max-w-md">
          Scan the QR code with the <strong>Self app</strong> to prove your citizenship and register your vote.
          One vote per person!
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        {loadError ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">Failed to load QR code</p>
              <p className="text-xs">{loadError}</p>
            </div>
            <button 
              onClick={() => {
                setLoadError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : isLoading || !selfApp ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading QR code...</p>
          </div>
        ) : (
          <div>
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={(response) => {
                console.log("📱 SelfQRcodeWrapper onSuccess called");
                console.log("Raw response from wrapper:", response);
                setIsVerifying(true);
                handleSuccessfulVerification(response);
              }}
              onError={(error) => {
                console.log("📱 SelfQRcodeWrapper onError called");
                console.log("Error from wrapper:", error);
                handleVerificationError(error);
              }}
            />
          </div>
        )}
      </div>

      {/* Status Messages */}
      {isVerifying && (
        <div className="flex items-center space-x-2 text-blue-400 bg-blue-900/20 px-4 py-2 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <span>Processing your verification... Please wait.</span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center space-y-4 max-w-md">
        <div className="text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-white">How it works:</p>
          <ol className="text-left space-y-1 list-decimal list-inside">
            <li>Open the Self app on your phone</li>
            <li>Scan this QR code</li>
            <li>Approve sharing your country from your passport</li>
            <li>Your vote will be registered automatically!</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            🔒 <strong>Privacy-preserving:</strong> Your personal information stays on your device.
            We only receive proof that you're a real human from your claimed country.
          </p>
        </div>

        <div className="mt-2">
          <a 
            href="https://self.xyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Don't have the Self app? Download it here
          </a>
        </div>
      </div>
    </div>
  );
}

