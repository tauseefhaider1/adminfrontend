// src/components/common/Spinner.jsx
const Spinner = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  // tailwind doesn't like dynamic classes sometimes, but this should work
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-${color}-600`}></div>
    </div>
  );
};

export default Spinner;