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

export const PLACE_NOT_PICKED_MESSAGE = "Pick a place from the suggestions";

export const BirthPlacePicker = ({
  onSelect,
  initialAddress,
  onPendingChange,
  id,
}: {
  onSelect: (place: BirthPlaceResult) => void;
  initialAddress: string;
  // Told whether the field holds text that was typed but not picked from the suggestions.
  onPendingChange?: (pending: boolean) => void;
  id?: string;
}) => {
  const [query, setQuery] = useState("");
  const [pickedAddress, setPickedAddress] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  // Suggestions are only shown while the field has focus, so they never sit over the
  // rest of the form once the user has moved on.
  const [focused, setFocused] = useState(false);
  const pending = query !== pickedAddress;

  useEffect(() => {
    if (!initialAddress) return;
    setQuery(initialAddress);
    setPickedAddress(initialAddress);
  }, [initialAddress]);

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  useEffect(() => {
    if (!pending || query.length < 3) return setSuggestions([]);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=1&limit=8`,
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, pending]);

  const handleSelect = (place: NominatimPlace) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    onSelect({
      address: place.display_name,
      latitude: lat,
      longitude: lng,
    });

    setQuery(place.display_name);
    setPickedAddress(place.display_name);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="City, Country"
        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      {focused && suggestions.length > 0 && (
        <div className="absolute z-10 bg-white border mt-1 w-full max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              // Keeps focus in the field, so the list is still there for the click.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer break-words"
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
