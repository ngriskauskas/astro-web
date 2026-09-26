import { useEffect, useState } from "react";

interface BirthPlaceResult {
  address: string;
  latitude: number;
  longitude: number;
}

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const BirthPlacePicker = ({
  onSelect,
  initialAddress,
}: {
  onSelect: (place: BirthPlaceResult) => void;
  initialAddress: string;
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [selected, setSelected] = useState(true);

  useEffect(() => {
    if (!initialAddress) return;
    setQuery(initialAddress);
  }, [initialAddress]);

  useEffect(() => {
    if (selected) return;
    if (query.length < 3) return setSuggestions([]);
    const timeout = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=8`,
      );
      const data = await res.json();
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, selected]);

  const handleSelect = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    onSelect({
      address: place.display_name,
      latitude: lat,
      longitude: lng,
    });

    setQuery(place.display_name);
    setSuggestions([]);
    setSelected(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(false);
        }}
        placeholder="City, Country"
        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      {suggestions.length > 0 && (
        <div className="absolute z-10 bg-white border mt-1 w-full max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
