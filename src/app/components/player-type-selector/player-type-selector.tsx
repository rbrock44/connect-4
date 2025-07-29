import { EASY, HARD, HUMAN, ITERATIVE, MEDIUM, type PLAYER_TYPE } from "../../constants";

interface PlayerButton {
    value: PLAYER_TYPE;
    label: string,
}

const PlayerTypeSelector = (
    { 
        value = HUMAN,
        onChange = (_: PLAYER_TYPE) => {}, 
        isDisabled = false 
    }
) => {
    const humanButtons: PlayerButton[] = [
        { value: HUMAN, label: 'Human' },
    ]
    const aiButtons: PlayerButton[] = [
      { value: EASY, label: 'Easy'},
      { value: MEDIUM, label: 'Medium'},
      { value: HARD, label: 'Hard'},
      { value: ITERATIVE, label: 'Iterative'},
    ];
  
    return (
      <div className="flex flex-col gap-2 items-start">
        <div className="flex gap-2 flex-wrap">
          {humanButtons.map(({ value: val, label }) => (
            <button
              key={val}
              onClick={() => !isDisabled && onChange(val)}
              disabled={isDisabled}
              className={`
                h-6 w-min !p-2 !bg-amber-700 rounded text-sm flex items-center justify-center transition-all
               ${value === val ? 'outline outline-4 outline-blue-500' : 'border-gray-100'}
               ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
              `}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {aiButtons.map(({ value: val, label }) => (
            <button
              key={val}
              onClick={() => !isDisabled && onChange(val)}
              disabled={isDisabled}
              className={`
                h-6 w-min !p-2 !bg-amber-900 rounded text-sm flex items-center justify-center transition-all
               ${value === val ? 'outline outline-4 outline-blue-500' : 'border-gray-100'}
               ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  export default PlayerTypeSelector;