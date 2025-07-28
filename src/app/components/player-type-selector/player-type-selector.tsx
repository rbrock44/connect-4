const PlayerTypeSelector = (
    { 
        value = 'human',
        onChange = (val: string) => {}, 
        isDisabled = false 
    }
) => {
    const humanButtons = [
        { value: 'human', label: 'Human' },
    ]
    const aiButtons = [
      { value: 'easy', label: 'Easy', group: 'AI' },
      { value: 'medium', label: 'Medium', group: 'AI' },
      { value: 'hard', label: 'Hard', group: 'AI' },
      { value: 'interactive', label: 'Interactive', group: 'AI' }
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
                h-8 !bg-amber-700 rounded text-sm flex items-center justify-center transition-all
               ${value === val ? 'outline outline-4 outline-blue-500' : 'border-gray-100'}
               ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100'}
              `}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap w-full">
          {aiButtons.map(({ value: val, label }) => (
            <button
              key={val}
              onClick={() => !isDisabled && onChange(val)}
              disabled={isDisabled}
              className={`
                h-8 !bg-amber-900 rounded text-sm flex items-center justify-center transition-all
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