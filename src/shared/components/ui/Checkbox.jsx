function Checkbox({
  label,
  name,
  checked,
  onChange,
  className = "",
  inputClassName = "",
  ...inputProps
}) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 ${className}`}>
      <input
        {...inputProps}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 accent-blue-600 ${inputClassName}`}
      />
      {label && <span>{label}</span>}
    </label>
  );
}

export default Checkbox;
