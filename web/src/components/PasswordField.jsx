import { useState } from 'react';

const EyeIcon = ({ visible }) => {
  if (visible) {
    return (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M2.25 12s3.5-6.5 9.75-6.5S21.75 12 21.75 12s-3.5 6.5-9.75 6.5S2.25 12 2.25 12Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="3.1"
          stroke="currentColor"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M10.58 10.58a2.08 2.08 0 0 0 2.84 2.84"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.12 5.95A10.4 10.4 0 0 1 12 5.25c6.25 0 9.75 6.75 9.75 6.75a18.5 18.5 0 0 1-2.65 3.55"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.38 18.05a10.4 10.4 0 0 1-3.38.7C5.75 18.75 2.25 12 2.25 12a18.2 18.2 0 0 1 4.38-4.75"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="field password-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrapper">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={error ? 'error-input' : ''}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>
    </div>
  );
}
