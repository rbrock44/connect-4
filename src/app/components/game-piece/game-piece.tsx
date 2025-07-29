import { BLANK, RED, YELLOW } from "../../constants";

const GamePiece = (
    { 
        state = BLANK, 
        onClick = ()=>{}, 
        isSmall = false,
        isHoverable = false,
        isSelected = false,
        isDisabled = false, 
    }
) => {
    const getStateClasses = () => {
        switch (state) {
            case YELLOW:
                return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 border-yellow-600';
            case RED:
                return 'bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-lg shadow-red-500/30 border-red-700';
            default:
                return 'bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner border-slate-300';
        }
    };

    const hoverClasses = isHoverable
        ? 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200'
        : '';

    const selectedClasses = isSelected
        ? 'outline outline-4 outline-blue-400'
        : '';   
    
    const disabledClasses = isDisabled
        ? 'opacity-40 cursor-not-allowed pointer-events-none'
        : ''; 
    
    // TODO: this needs to handle mobile, the current setup is two hardcoded sizes, one for the board, the smaller one for the player color choice    
    const heightClasses = isSmall ? 'w-8 h-8' : 'w-12 h-12'; 

    return (
        <div
            className={`
        ${heightClasses}
        rounded-full border-2 transition-all duration-300
        ${getStateClasses()}
        ${hoverClasses}
        ${selectedClasses}
        ${disabledClasses}
        relative overflow-hidden
      `}
            onClick={!isDisabled ? onClick : undefined}
        >
            <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full blur-sm" />
            <div className="absolute inset-0 rounded-full shadow-inner" />
        </div>
    );
};

export default GamePiece;
