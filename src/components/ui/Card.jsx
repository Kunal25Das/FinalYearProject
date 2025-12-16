export default function Card({
  children,
  className = "",
  hover = false,
  ...props
}) {
  return (
    <div
      className={`bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-6 
        ${hover ? "hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300" : ""} 
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
