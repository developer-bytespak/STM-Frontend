'use client';

import { useState } from 'react';

interface FormConfig {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

export function useForm({ initialValues, onSubmit }: FormConfig) {
  const [values, setValues] = useState(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const setFieldValue = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return {
    values,
    setFieldValue,
    handleSubmit,
  };
}