import { Wrench, Clock, BarChart, ExternalLink } from 'lucide-react';

const difficultyColor = {
  Beginner: 'text-green-400 bg-green-900/20 border-green-500/25',
  Intermediate: 'text-blue-400 bg-blue-900/20 border-blue-500/25',
  Advanced: 'text-orange-400 bg-orange-900/20 border-orange-500/25',
  Professional: 'text-red-400 bg-red-900/20 border-red-500/25',
};

export default function InstallInfo({ installInfo }) {
  if (!installInfo) return null;
  const { difficulty, timeEstimate, requiredTools = [], notes, videoUrl } = installInfo;

  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
      <h3 className="font-heading font-bold text-base tracking-widest uppercase dark:text-white text-gray-900 mb-4">Install Info</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {difficulty && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${difficultyColor[difficulty] || difficultyColor.Intermediate}`}>
            <BarChart size={16} />
            <div>
              <p className="text-[10px] opacity-70 uppercase tracking-wider font-heading">Difficulty</p>
              <p className="font-semibold text-sm">{difficulty}</p>
            </div>
          </div>
        )}
        {timeEstimate && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg dark:bg-dark-surface-2 bg-gray-50 dark:border-dark-border border-light-border border">
            <Clock size={16} className="text-brand-red" />
            <div>
              <p className="text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-wider font-heading">Est. Time</p>
              <p className="font-semibold text-sm dark:text-white text-gray-900">{timeEstimate}</p>
            </div>
          </div>
        )}
      </div>

      {requiredTools.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={14} className="text-brand-red" />
            <span className="text-xs font-heading font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">Required Tools</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {requiredTools.map(tool => (
              <span key={tool} className="text-xs dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-300 text-gray-600 px-2 py-1 rounded border dark:border-dark-border border-light-border">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {notes && (
        <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed mb-3">{notes}</p>
      )}

      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-brand-red hover:underline text-sm font-medium"
        >
          <ExternalLink size={14} /> Watch Install Video
        </a>
      )}
    </div>
  );
}
