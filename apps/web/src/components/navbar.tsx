"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white">
      <div className="max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
          <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight">
            SELF <span className="italic">OLYMPICS</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
