'use client';

import React, { useState, useEffect } from 'react';
import { SelfAppBuilder } from "@selfxyz/qrcode";
import { ethers } from "ethers";
import QRCode from 'react-qr-code';

interface SelfVerificationProps {
  onSuccess: (data: { countryCode: string; countryName: string; message: string }) => void;
  onError: (error: string) => void;
  onAlreadyRegistered: (data: { countryCode: string; countryName: string; message: string }) => void;
}

export function SelfVerificationSimple({ onSuccess, onError, onAlreadyRegistered }: SelfVerificationProps) {
  const [qrValue, setQrValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId] = useState(ethers.ZeroAddress);

  useEffect(() => {
    const initializeSelf = async () => {
      try {
        console.log('🔄 Initializing Self app (simple version)...');

        // Build Self app configuration
        const app = new SelfAppBuilder({
          version: 2,
          appName: "Self Olympics",
          scope: "self-olympics-2024",
          endpoint: "http://localhost:3000/api/register",
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
          userId: userId,
          endpointType: "staging_https",
          userIdType: "hex",
          userDefinedData: JSON.stringify({ timestamp: Date.now() }),
          disclosures: {
            nationality: true,
          }
        }).build();

        console.log('✅ Self app built:', app);

        // Generate QR code value
        const qrData = JSON.stringify(app);
        setQrValue(qrData);
        setIsLoading(false);
        
        console.log('✅ QR code ready!');
      } catch (error) {
        console.error("❌ Failed to initialize:", error);
        setIsLoading(false);
        setLoadError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeSelf();
  }, [userId]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Verify Your Country (Test Mode)</h2>
        <p className="text-gray-400 max-w-md text-sm">
          Simple QR code test - if you see this, the Self SDK is working!
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        {loadError ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-xs">{loadError}</p>
            </div>
          </div>
        ) : isLoading || !qrValue ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Generating QR code...</p>
          </div>
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <QRCode value={qrValue} size={256} />
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-400">
        <p>This is a test component.</p>
        <p>Check browser console for logs.</p>
      </div>
    </div>
  );
}

