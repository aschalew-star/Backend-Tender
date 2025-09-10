import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Bell, User, ChevronDown, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/home" },
  { name: "Tenders", href: "/tenders" },
  { name: "Documents", href: "/documents" },
  { name: "Land Lease", href: "/land-lease" },
  { name: "FAQ", href: "/faq" },
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true); // Example: toggle for premium/free
  const [notifications] = useState([
    { id: 1, message: "New tender available!", time: "2 hours ago" },
    { id: 2, message: "Your bid has been reviewed.", time: "1 day ago" },
  ]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100/50 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">T</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TenderHub
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Unlock Your Next Opportunity</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative group"
              >
                <a
                  href={item.href}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group flex items-center"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Right Section: Notifications + Profile */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
          <Link to="/Notifications">

            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                aria-label={`View ${notifications.length} notifications`}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {notifications.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50"
                  >
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Notifications</h4>
                    {notifications.map((notif) => (
                      <div key={notif.id} className="py-2 border-b border-gray-100 last:border-0">
                        <p className="text-xs text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.div>
              </Link>

            {/* Profile */}
            <div className="relative">
              <Link to="/account/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all"
                aria-label="Toggle profile menu"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-800">John Doe</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {isSubscribed ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Premium
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                        Free
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
                </motion.button>
              </Link>
                
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 p-2 z-50"
                  >
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors duration-300"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div animate={{ rotate: isMobileMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-b-2xl shadow-xl"
            >
              <div className="py-6 space-y-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <a
                      href={item.href}
                      className="block text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg mx-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative bottom border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </motion.nav>
  );
};

export default Navbar;