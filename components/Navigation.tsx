import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="p-4 bg-gray-100">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Engagement Map</h1>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">
              Map
            </Link>
          </li>
          {/* Add other navigation links as needed */}
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}