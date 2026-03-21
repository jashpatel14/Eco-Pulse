// ECOStageBar — horizontal stage pipeline for ECO detail
import { Check, X } from 'lucide-react';

export default function ECOStageBar({ stages = [], currentStageId, ecoStatus }) {
  if (!stages.length) return null;

  const currentIdx = stages.findIndex(s => s.id === currentStageId);

  return (
    <div className="stage-bar">
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIdx || ecoStatus === 'APPLIED';
        const isCurrent   = stage.id === currentStageId && ecoStatus !== 'APPLIED';
        const isRejected  = isCurrent && ecoStatus === 'REJECTED';

        let cls = 'stage-pill stage-future';
        if (isCompleted) cls = 'stage-pill stage-done';
        if (isCurrent)   cls = 'stage-pill stage-current';
        if (isRejected)  cls = 'stage-pill stage-rejected';

        return (
          <div key={stage.id} className="stage-step">
            <div className={cls}>
              {isCompleted ? <Check size={12} /> : isRejected ? <X size={12} /> : idx + 1}
            </div>
            <span className="stage-label">{stage.name}</span>
            {idx < stages.length - 1 && (
              <div className={`stage-connector ${isCompleted ? 'connector-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
