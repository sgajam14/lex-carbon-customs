import { CheckCircle, AlertTriangle, Gauge } from 'lucide-react';

export default function FitmentBadge({ fitmentData, vehicle }) {
  if (!vehicle || !fitmentData?.length) {
    return (
      <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/25 text-green-400 px-4 py-2.5 rounded-lg text-sm">
        <CheckCircle size={16} />
        <span className="font-medium">Precision-Matched Fitment — Minor adjustments may be needed during install</span>
      </div>
    );
  }

  const match = fitmentData.find(f =>
    f.make?.toLowerCase() === vehicle.make?.toLowerCase() &&
    f.model?.toLowerCase() === vehicle.model?.toLowerCase() &&
    vehicle.year >= f.yearFrom && vehicle.year <= f.yearTo
  );

  if (!match) {
    return (
      <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/25 text-yellow-400 px-4 py-2.5 rounded-lg text-sm">
        <AlertTriangle size={16} />
        <span className="font-medium">Fitment not confirmed for your vehicle — contact us</span>
      </div>
    );
  }

  const { fitmentConfidence = 100, requiresModification, modificationNotes, alsoFits = [] } = match;

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border ${
        fitmentConfidence >= 90
          ? 'bg-green-900/20 border-green-500/25 text-green-400'
          : 'bg-yellow-900/20 border-yellow-500/25 text-yellow-400'
      }`}>
        <CheckCircle size={16} />
        <span className="font-medium">
          Fits your {vehicle.year} {vehicle.make} {vehicle.model}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Gauge size={14} />
          <span className="font-bold">{fitmentConfidence}% fit</span>
        </div>
      </div>

      {requiresModification && (
        <div className="flex items-start gap-2 bg-orange-900/20 border border-orange-500/25 text-orange-400 px-4 py-2.5 rounded-lg text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Requires modification</span>
            {modificationNotes && <p className="mt-0.5 opacity-80">{modificationNotes}</p>}
          </div>
        </div>
      )}

      {alsoFits.length > 0 && (
        <p className="text-xs dark:text-gray-400 text-gray-500">
          <span className="font-medium">Also fits:</span> {alsoFits.join(', ')}
        </p>
      )}
    </div>
  );
}
