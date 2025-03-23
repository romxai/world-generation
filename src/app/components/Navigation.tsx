"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation component for the world generation application
 * Provides links to different map generation techniques
 */
export default function Navigation() {
  const pathname = usePathname();

  // Navigation links
  const links = [
    { href: "/", label: "Grid Map" },
    { href: "/polygon-world", label: "Polygon Map" },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">World Generator</div>

        <ul className="flex space-x-6">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hover:text-blue-300 transition-colors ${
                    isActive ? "text-blue-400 font-medium" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
