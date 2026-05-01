export default function LoginCard() {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      {/* Paste the template HTML/JSX here */}
      <h2 className="text-xl font-bold">Welcome to EUI Bank</h2>
      <input type="text" placeholder="Account Number" className="border p-2 w-full my-2" />
      <button className="bg-blue-600 text-white w-full py-2">Login</button>
    </div>
  );
}