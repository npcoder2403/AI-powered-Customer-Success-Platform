"use client";

import { useField } from "formik";
import Input from "./Input";
import Select, { SelectOption } from "./Select";
import Textarea from "./Textarea";
import DateTimePicker from "./DateTimePicker";
import { LucideIcon } from "lucide-react";

interface BaseFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  colSpan?: 1 | 2;
}

interface InputFieldProps extends BaseFieldProps {
  type: "text" | "email" | "password" | "number";
  placeholder?: string;
  icon?: LucideIcon;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  options: SelectOption[];
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea";
  placeholder?: string;
  rows?: number;
}

interface DateTimeFieldProps extends BaseFieldProps {
  type: "datetime";
  placeholder?: string;
}

type FormFieldProps = InputFieldProps | SelectFieldProps | TextareaFieldProps | DateTimeFieldProps;

export default function FormField(props: FormFieldProps) {
  const [field, meta, helpers] = useField(props.name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  const wrapper = (children: React.ReactNode) => (
    <div className={props.colSpan === 2 ? "sm:col-span-2" : ""}>
      {children}
    </div>
  );

  const handleCustomChange = (val: string) => {
    helpers.setValue(val, true);
    if (!meta.touched) helpers.setTouched(true, false);
  };

  if (props.type === "select") {
    return wrapper(
      <Select
        label={props.label}
        required={props.required}
        options={props.options}
        placeholder={props.placeholder}
        value={field.value || ""}
        onChange={(e) => handleCustomChange(e.target.value)}
        error={error}
      />
    );
  }

  if (props.type === "textarea") {
    return wrapper(
      <Textarea
        label={props.label}
        required={props.required}
        placeholder={props.placeholder}
        rows={props.rows || 6}
        helperText={props.helperText}
        error={error}
        {...field}
      />
    );
  }

  if (props.type === "datetime") {
    return wrapper(
      <DateTimePicker
        label={props.label}
        required={props.required}
        value={field.value || ""}
        onChange={(e) => handleCustomChange(e.target.value)}
        error={error}
      />
    );
  }

  return wrapper(
    <Input
      label={props.label}
      required={props.required}
      type={props.type}
      placeholder={props.placeholder}
      icon={props.icon}
      helperText={props.helperText}
      error={error}
      {...field}
    />
  );
}
