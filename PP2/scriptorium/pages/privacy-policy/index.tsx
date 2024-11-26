<nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
  <div className="flex items-center gap-4">
    <Image
      src="/logo.svg" // Ensure this is a high-quality SVG or PNG
      alt="Scriptorium Logo"
      width={40}
      height={40}
      className="rounded-md"
    />
    <span className="text-xl font-bold">Scriptorium</span>
  </div>
  <div className="flex items-center gap-6">
    <Link href="/" className="hover:underline hover:text-gray-300">
      Home
    </Link>
    <Link href="/templates" className="hover:underline hover:text-gray-300">
      Templates
    </Link>
    <Link href="/blog" className="hover:underline hover:text-gray-300">
      Blog
    </Link>
    <Link href="/about" className="hover:underline hover:text-gray-300">
      About Us
    </Link>
    <div className="relative group">
      <button className="flex items-center gap-2 hover:text-gray-300">
        Profile
        <Image
          src="/icons/user.svg" // Ensure this icon is high quality
          alt="User Icon"
          width={16}
          height={16}
        />
      </button>
      <div className="absolute right-0 mt-2 hidden w-40 bg-white text-black border border-gray-200 shadow-md group-hover:block">
        <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
          My Profile
        </Link>
        <Link href="/logout" className="block px-4 py-2 hover:bg-gray-100">
          Logout
        </Link>
      </div>
    </div>
  </div>
</nav>
