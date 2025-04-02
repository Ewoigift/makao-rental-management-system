"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-4 px-6 bg-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div>
          <p>&copy; {currentYear} MAKAO Rental Management System. All rights reserved.</p>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
