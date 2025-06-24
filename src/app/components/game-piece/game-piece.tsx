const GamePiece = ({ state = 'blank', onClick = ()=>{}, isHoverable = false }) => {
    const getStateClasses = () => {
        switch (state) {
            case 'yellow':
                return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 border-yellow-600';
            case 'red':
                return 'bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-lg shadow-red-500/30 border-red-700';
            default:
                return 'bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner border-slate-300';
        }
    };

    const hoverClasses = isHoverable && state === 'blank'
        ? 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200'
        : '';

    return (
        <div
            className={`
        w-12 h-12 rounded-full border-2 transition-all duration-300
        ${getStateClasses()}
        ${hoverClasses}
        relative overflow-hidden
      `}
            onClick={onClick}
        >
            <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full blur-sm" />

            <div className="absolute inset-0 rounded-full shadow-inner" />
        </div>
    );
};

export default GamePiece;
