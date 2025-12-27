import Link from "next/link";

export default function Payments() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Payments</h1>
      <p>This is where you will manage your payments.</p>
      <Link href="/" className="text-blue-500">Go back to Dashboard</Link>
    </div>
  );
}
