"use client";
import { sdk } from "@farcaster/frame-sdk";
// Use any types for Farcaster SDK compatibility
type FrameContext = any;
type AddFrameResult = any;
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import FrameWalletProvider from "./frame-wallet-context";

interface MiniAppContextType {
  isMiniAppReady: boolean;
  context: FrameContext | null;
  setMiniAppReady: () => void;
  addMiniApp: () => Promise<AddFrameResult | null>;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

interface MiniAppProviderProps {
  addMiniAppOnLoad?: boolean;
  children: ReactNode;
}

export function MiniAppProvider({ children, addMiniAppOnLoad }: MiniAppProviderProps): JSX.Element {
  const [context, setContext] = useState<FrameContext | null>(null);
  const [isMiniAppReady, setIsMiniAppReady] = useState(false);

  const setMiniAppReady = useCallback(async () => {
    try {
      const context = await sdk.context;
      if (context) {
        setContext(context);
      }
      await sdk.actions.ready();
    } catch (err) {
      console.error("SDK initialization error:", err);
    } finally {
      setIsMiniAppReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady().then(() => {
        console.log("MiniApp loaded");
      });
    }
  }, [isMiniAppReady, setMiniAppReady]);

  const handleAddMiniApp = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      console.error("[error] adding frame", error);
      return null;
    }
  }, []);

  useEffect(() => {
    // on load, set the frame as ready
    if (isMiniAppReady && !context?.client?.added && addMiniAppOnLoad) {
      handleAddMiniApp();
    }
  }, [
    isMiniAppReady,
    context?.client?.added,
    handleAddMiniApp,
    addMiniAppOnLoad,
  ]);

  return (
    <MiniAppContext.Provider
      value={{
        isMiniAppReady,
        setMiniAppReady,
        addMiniApp: handleAddMiniApp,
        context,
      }}
    >
      <FrameWalletProvider>{children}</FrameWalletProvider>
    </MiniAppContext.Provider>
  );
}

export function useMiniApp(): MiniAppContextType {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }
  return context;
}
