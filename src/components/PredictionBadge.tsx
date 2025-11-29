
import { Prediction } from '@/types';

interface PredictionBadgeProps {
    prediction: Prediction;
    isLoading?: boolean;
}

export default function PredictionBadge({ prediction, isLoading }: PredictionBadgeProps) {
    if (isLoading) {
        return (
            <div className="animate-pulse flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                <div className="h-4 w-4 bg-purple-200 rounded-full"></div>
                <div className="h-3 w-20 bg-purple-200 rounded"></div>
            </div>
        );
    }

    if (!prediction) return null;

    return (
        <div className="group relative">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-purple-100 cursor-help">
                <span className="text-xs font-bold text-purple-700">AI Pick:</span>
                <span className="text-xs font-semibold text-gray-800">{prediction.winner}</span>
                <div className="flex items-center space-x-1">
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${prediction.probability}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-gray-500">{prediction.probability}%</span>
                </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-semibold mb-1">Why?</p>
                <p className="opacity-90">{prediction.reasoning}</p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
        </div>
    );
}
