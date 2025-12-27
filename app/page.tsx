import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <div className="w-8 h-8 rounded-full bg-white" />
          <span className="text-xl font-bold">Karibu</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="hover:text-gray-400" prefetch={false}>
            Dashboard
          </Link>
          <Link href="#" className="hover:text-gray-400" prefetch={false}>
            Properties
          </Link>
          <Link href="#" className="hover:text-gray-400" prefetch={false}>
            Tenants
          </Link>
          <Link href="#" className="hover:text-gray-400" prefetch={false}>
            Payments
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Total Properties</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">12</p>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Occupancy Rate</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">85%</p>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Total Tenants</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">45</p>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">$12,500</p>
          </div>
        </div>
        <div className="mt-6 bg-white dark:bg-gray-950 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Recent Payments</h3>
          <table className="w-full mt-4 text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Tenant
                </th>
                <th scope="col" className="px-6 py-3">
                  Property
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  John Doe
                </th>
                <td className="px-6 py-4">123 Main St, Apt 4B</td>
                <td className="px-6 py-4">$1,200</td>
                <td className="px-6 py-4">2023-05-15</td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  Jane Smith
                </th>
                <td className="px-6 py-4">456 Oak Ave, Unit 8</td>
                <td className="px-6 py-4">$950</td>
                <td className="px-6 py-4">2023-05-12</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  Bob Johnson
                </th>
                <td className="px-6 py-4">789 Pine Rd, Apt 2C</td>
                <td className="px-6 py-4">$1,500</td>
                <td className="px-6 py-4">2023-05-10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
