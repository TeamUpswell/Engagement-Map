import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="p-4 bg-gray-100">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/map" className="text-blue-500 hover:underline">
            Map View
          </Link>
        </li>
      </ul>
    </nav>
  );
}