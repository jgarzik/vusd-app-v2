import { Link, useLocation } from "wouter";

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden border-b border-gray-800 px-4 py-2">
      <div className="flex justify-between items-center">
        <Link href="/">
          <a className={`${location === "/" ? "bg-background-light hover:bg-gray-700 text-white border-b-2 border-primary" : "text-gray-400"} py-1 px-3 rounded-lg text-sm font-medium`}>
            Swap
          </a>
        </Link>
        <Link href="/analytics">
          <a className={`${location === "/analytics" ? "bg-background-light hover:bg-gray-700 text-white border-b-2 border-primary" : "text-gray-400"} py-1 px-3 rounded-lg text-sm font-medium`}>
            Analytics
          </a>
        </Link>
        <Link href="/use-vusd">
          <a className={`${location === "/use-vusd" ? "bg-background-light hover:bg-gray-700 text-white border-b-2 border-primary" : "text-gray-400"} py-1 px-3 rounded-lg text-sm font-medium`}>
            Use VUSD
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
