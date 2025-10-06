interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
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
  max
}: InputProps) {
  return (
    <input 
      id={id}
      name={name}
      type={type} 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      disabled={disabled}
      min={min}
      max={max}
    />
  );
}