import { useDesc } from "../contexts/DescContext";

export const DescriptionSidePanel = () => {
  const { active, close } = useDesc();

  if (!active) return null;
  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl p-4 
        transition-transform duration-300 
        ${active ? "translate-x-0" : "translate-x-full"}`}
    >
      <button
        onClick={close}
        className="absolute top-2 right-2 text-xl cursor-pointer"
      >
        ✕
      </button>

      {active ? (
        <>
          <h2 className="text-xl font-bold capitalize">{active.type}</h2>
          <p className="mt-4">{active.desc}</p>
        </>
      ) : null}
    </div>
  );
};
