export const LoadError = ({ message }: { message: string }) => (
  <p role="alert" className="py-3 text-sm text-gray-500">
    {message}
  </p>
);
