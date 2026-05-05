import { useState } from "react";
import type { ChangeEvent } from "react";
import FormFieldInput from "./FormFieldInput";
import PrimaryButton from "./FormButton";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string) {
  let error = "";
  if (!EMAIL_REGEX.test(email)) error = "Enter a valid email";
  return error;
}

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  buttonColor?: string;
  hoverColor?: string;
  buttonShadow?: string;
  focusColor?: string;
}

export default function ForgotPasswordForm({
  onSubmit,
  buttonColor,
  hoverColor,
  buttonShadow,
  focusColor,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    const err = validate(email);
    setError(err);
    if (err) return;

    try {
      await onSubmit(email);
      setSubmitted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-md">
      {!submitted ? (
        <>
          <h1 className="text-3xl font-semibold text-gray-900 text-center mb-8">
            Forgot Password
          </h1>

          <div className="mb-6">
            <FormFieldInput
              label="Email"
              type="email"
              placeholder="Enter your email here..."
              value={email}
              error={error}
              focusColor={focusColor}
              onChange={handleChange}
            />
          </div>

          <PrimaryButton
            text="Send Reset Link"
            onClick={handleSubmit}
            bgColor={buttonColor}
            hoverColor={hoverColor}
            shadowColor={buttonShadow}
          />
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-3">Check your inbox</h2>
          <p className="text-gray-500 text-sm">
            Reset link sent to <strong>{email}</strong>
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setEmail("");
            }}
            className="mt-4 text-sm text-orange-500"
          >
            ← Use a different email
          </button>
        </div>
      )}
    </div>
  );
}
