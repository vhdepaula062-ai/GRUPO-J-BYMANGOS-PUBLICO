"use client";

import React, { useState } from "react";
import { Input, InputProps } from "./Input";
import { Eye, EyeOff } from "../icons";

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        suffixIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
