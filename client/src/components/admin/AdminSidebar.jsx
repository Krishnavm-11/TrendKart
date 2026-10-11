function AdminSidebar({ activePage, setActivePage, onLogout }) {
  const menuItems = [
    "Dashboard",
    "Users",
    "Products",
    "Orders",
    "Offers & Discounts",
    "Analytics",
  ];

  return (
    <aside className="flex min-h-screen w-[280px] shrink-0 flex-col bg-[#171614] px-5 py-7 text-white">
      {/* Logo */}
      <div className="mb-9">
        <h1 className="text-2xl font-bold">TrendKart</h1>
        <p className="mt-2 text-sm text-gray-400">
          Admin Dashboard
        </p>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActivePage(item)}
            className={`w-full rounded-lg px-4 py-4 text-left transition ${
              activePage === item
                ? "bg-[#e9dfce] text-black"
                : "text-gray-300 hover:bg-[#302e2a] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-auto w-full rounded-lg px-4 py-3 text-left text-gray-300 hover:bg-[#302e2a] hover:text-white"
      >
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;