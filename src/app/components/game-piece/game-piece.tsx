import { BLANK, RED, YELLOW } from "../../constants";

const GamePiece = ({
    state = BLANK,
    onClick = () => { },
    isSmall = false,
    isHoverable = false,
    isSelected = false,
    isDisabled = false,
    isColumnHovered = false,
    colIndex = 0,
    setColumnHovered = (_: number | null) => { },
}) => {
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

    const active: boolean = state === BLANK;

    const handleMouseEnter = () => {
        setColumnHovered(colIndex);
    };

    const handleMouseLeave = () => {
        setColumnHovered(null);
    };

    const columnHoverClasses = active && isColumnHovered
        ? 'from-blue-300 to-blue-400 border-blue-500 cursor-pointer transition-all duration-200 shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-400/50'
        : '';

    const hoverClasses = active && isHoverable
        ? 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200'
        : '';

    const selectedClasses = isSelected
        ? 'outline outline-2 sm:outline-4 outline-blue-400'
        : '';

    const disabledClasses = isDisabled
        ? 'opacity-40 cursor-not-allowed pointer-events-none'
        : '';

    const heightClasses = isSmall
        ? 'w-6 h-6 sm:w-8 sm:h-8'
        : 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';

    return (
        <div
            className={`
                ${heightClasses}
                rounded-full border-2 transition-all duration-300
                ${getStateClasses()}
                ${columnHoverClasses}
                ${hoverClasses}
                ${selectedClasses}
                ${disabledClasses}
                relative overflow-hidden
                touch-manipulation
            `}
            onClick={!isDisabled ? onClick : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            
            <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-2 h-2 sm:w-3 sm:h-3 bg-white/30 rounded-full blur-sm" />
            <div className="absolute inset-0 rounded-full shadow-inner" />
        </div>
    );
};

export default GamePiece;
