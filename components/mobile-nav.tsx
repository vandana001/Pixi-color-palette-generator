"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/palette-generator", label: "Palette Generator" },
  { href: "/image-picker", label: "Image Picker" },
  { href: "/explore-palette", label: "Explore Palette" },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} />}

      {/* Slide-out menu */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="font-bold text-xl" onClick={closeMenu}>
            ■ PIXI
          </Link>
          <Button variant="ghost" size="sm" onClick={closeMenu} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation items */}
        <nav className="p-4" style={{background:'white', height:'100vh'}}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        {/* <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium">VV</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User Profile</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          </div>
        </div> */}
      </div>
    </>
  )
}
