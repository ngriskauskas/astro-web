import { useEffect } from "react";
import { useDesc } from "../contexts/DescContext";

export const Home = () => {
  const { getBasicDescriptions } = useDesc();

  const fetch = async () => {
    const thing = await getBasicDescriptions();
  };
  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="flex items-center justify-center mt-10 bg-gray-100">
      Home
    </div>
  );
};
