"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/trainer", label: "Trainer", icon: "🧠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/bot/chat", label: "AI Chat", icon: "💬" },
  ];

  return (
    <nav style={{
      background: "var(--card)",
      borderBottom: "1px solid #2a2f3a",
      padding: "12px 0",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(8px)"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Link href="/dashboard" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          color: "var(--ink)"
        }}>
          <img src="/logo.svg" alt="ECA Logo" style={{
            width: "32px",
            height: "32px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }} />
          <span style={{ fontWeight: "700", fontSize: "18px" }}>
            ECA Personal Assistant
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                color: pathname === item.href ? "var(--acc)" : "var(--muted)",
                background: pathname === item.href ? "rgba(143, 214, 255, 0.1)" : "transparent",
                border: pathname === item.href ? "1px solid var(--acc)" : "1px solid transparent",
                transition: "all 0.2s ease",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--ink)",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div style={{
          background: "var(--card)",
          borderTop: "1px solid #2a2f3a",
          padding: "12px 14px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  color: pathname === item.href ? "var(--acc)" : "var(--ink)",
                  background: pathname === item.href ? "rgba(143, 214, 255, 0.1)" : "transparent",
                  border: pathname === item.href ? "1px solid var(--acc)" : "1px solid transparent",
                  fontSize: "16px",
                  fontWeight: "500"
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
