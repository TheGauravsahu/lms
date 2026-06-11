const ErrorOccured = () => {
  return (
    <div className="h-[90vh] w-full flex flex-col justify-center items-center">
      <div className="w-48 h-48 overflow-hidden">
        <img src="/server_failure.svg" alt="error occurred" className="w-full h-full" />
      </div>
      <h2 className="bg-red-100 text-red-800 rounded-sm p-2 mt-2 font-semibold text-sm">Error Occured : Please Try Again</h2>
    </div>
  );
};

export default ErrorOccured;
