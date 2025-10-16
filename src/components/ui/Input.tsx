export interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  label?: string;
  required?: boolean;
  step?: string;
}

export default function Input({ 
  id, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  min,
  max,
  label,
  required = false,
  step
}: InputProps) {
  const defaultClasses = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input 
        id={id}
        name={name}
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className || defaultClasses}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        step={step}
      />
    </div>
  );
}