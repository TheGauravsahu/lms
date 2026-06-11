const FormError = ({ form, field }) => {
  return (
    <p className="text-sm text-red-500 my-4">
      {form.formState.errors[field]?.message}
    </p>
  );
};

export default FormError;
