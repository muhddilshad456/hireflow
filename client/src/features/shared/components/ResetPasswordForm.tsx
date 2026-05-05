import { useState } from "react";
import type { ChangeEvent } from "react";
import FormFieldInput from "./FormFieldInput";
import PrimaryButton from "./FormButton";

interface FormState {
  password: string;
  confirm: string;
}

interface FormErrors {
  password?: string;
  confirm?: string;
}

const INITIAL_FORM: FormState = { password: "", confirm: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (form.password.length < 8) {
    errors.password = "At least 8 characters";
  }

  if (form.confirm.length < 8) {
    errors.confirm = "At least 8 characters";
  }

  if (form.password !== form.confirm) {
    errors.confirm = "Passwords do not match";
  }

  return errors;
}

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  buttonColor?: string;
  hoverColor?: string;
  buttonShadow?: string;
  focusColor?: string;
}

export default function ResetPasswordForm({
  onSubmit,
  buttonColor,
  hoverColor,
  buttonShadow,
  focusColor,
}: ResetPasswordFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length !== 0) return;

    try {
      setLoading(true);
      await onSubmit(form.password);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold text-gray-900 text-center mb-8">
        Reset Password
      </h1>

      <div className="mb-6">
        <FormFieldInput
          label="New Password"
          type="password"
          placeholder="Enter your new password..."
          value={form.password}
          error={errors.password}
          focusColor={focusColor}
          onChange={handleChange("password")}
        />
      </div>

      <div className="mb-6">
        <FormFieldInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password..."
          value={form.confirm}
          error={errors.confirm}
          focusColor={focusColor}
          onChange={handleChange("confirm")}
        />
      </div>

      <PrimaryButton
        text={loading ? "Updating..." : "Reset Password"}
        onClick={handleSubmit}
        bgColor={buttonColor}
        hoverColor={hoverColor}
        shadowColor={buttonShadow}
      />
    </div>
  );
}
