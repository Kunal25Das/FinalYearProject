export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 
          bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500
          focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none
          transition-all duration-200 ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
