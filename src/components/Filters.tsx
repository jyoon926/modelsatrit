import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Genders, Races } from '../utils/Enums';

interface Props {
  onFiltersUpdate: (genderFilters: string[], raceFilters: string[]) => void;
}

export default function Filters({ onFiltersUpdate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [raceFilters, setRaceFilters] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const toggleCheckbox = (array: string[], str: string, setter: (array: string[]) => void) => {
    if (array && array.includes(str)) setter(array.filter((el) => el !== str));
    else setter([...array, str]);
  };

  useEffect(() => {
    onFiltersUpdate(genderFilters, raceFilters);
  }, [genderFilters, onFiltersUpdate, raceFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={filterRef}>
      <button className="border px-4 py-3 rounded flex flex-row items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
        Filters <MdKeyboardArrowDown className={`text-xl mr-[-5px] duration-300 ${isOpen && 'scale-y-[-1]'}`} />
      </button>
      <div
        className={`max-w-[600px] mx-5 left-0 absolute border rounded p-5 backdrop-blur bg-background/70 duration-300 mt-2 shadow-md ${!isOpen && 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-3 text-nowrap">
          {/* Gender */}
          <div className="font-bold">Gender</div>
          <div className="flex flex-row flex-wrap gap-2">
            <button
              className="flex flex-row items-center gap-2 border rounded p-2"
              onClick={() => setGenderFilters([])}
            >
              <span className={`w-3 h-3 flex border rounded-full ${!genderFilters.length && 'bg-foreground'}`} />
              <span className={genderFilters.length ? 'opacity-60' : ''}>All</span>
            </button>
            {Object.values(Genders).map((gender, index) => (
              <button
                className="flex flex-row items-center gap-2 border rounded p-2"
                onClick={() => toggleCheckbox(genderFilters, gender, setGenderFilters)}
                key={index}
              >
                <span
                  className={`w-3 h-3 flex border rounded-full ${genderFilters.includes(gender) && 'bg-foreground'}`}
                />
                <span className={genderFilters.includes(gender) ? '' : 'opacity-60'}>{gender}</span>
              </button>
            ))}
          </div>
          {/* Race */}
          <div className="font-bold">Race</div>
          <div className="flex flex-row flex-wrap gap-2">
            <button className="flex flex-row items-center gap-2 border rounded p-2" onClick={() => setRaceFilters([])}>
              <span className={`w-3 h-3 flex border rounded-full ${!raceFilters.length && 'bg-foreground'}`} />
              <span className={raceFilters.length ? 'opacity-60' : ''}>All</span>
            </button>
            {Object.values(Races).map((race, index) => (
              <button
                className="flex flex-row items-center gap-2 border rounded p-2"
                onClick={() => toggleCheckbox(raceFilters, race, setRaceFilters)}
                key={index}
              >
                <span className={`w-3 h-3 flex border rounded-full ${raceFilters.includes(race) && 'bg-foreground'}`} />
                <span className={raceFilters.includes(race) ? '' : 'opacity-60'}>{race}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
