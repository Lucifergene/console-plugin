import {
  Condition,
  PipelineRunKind,
  PLRTaskRunData,
  PLRTaskRunStep,
  TaskRunKind,
} from '../../types';
import { t } from '../utils/common-utils';
import { pipelineRunStatus } from '../utils/pipeline-filter-reducer';
import { CombinedErrorDetails } from './log-snippet-types';
import { taskRunSnippetMessage } from './log-snippet-utils';

export const getPLRLogSnippet = (
  pipelineRun: PipelineRunKind,
  taskRuns: TaskRunKind[],
): CombinedErrorDetails => {
  if (!pipelineRun?.status) {
    // Lack information to pull from the Pipeline Run
    return null;
  }
  if (pipelineRunStatus(pipelineRun) !== 'Failed') {
    // Not in a failed state, no need to get the log snippet
    return null;
  }

  const succeededCondition = pipelineRun.status.conditions?.find(
    (condition: Condition) => condition.type === 'Succeeded',
  );

  if (succeededCondition?.status !== 'False') {
    // Not in error / lack information
    return null;
  }

  const tRuns: PLRTaskRunData[] = Object.values(
    taskRuns || pipelineRun.status.taskRuns || {},
  );
  const failedTaskRuns = tRuns.filter((taskRun) =>
    taskRun?.status?.conditions?.find(
      (condition) =>
        condition.type === 'Succeeded' && condition.status === 'False',
    ),
  );
  const isKnownReason = (reason: string): boolean => {
    // known reasons https://tekton.dev/vault/pipelines-v0.21.0/pipelineruns/#monitoring-execution-status
    return [
      'StoppedRunFinally',
      'CancelledRunFinally',
      'PipelineRunTimeout',
    ].includes(reason);
  };

  // We're intentionally looking at the first failure because we have to start somewhere - they have the YAML still
  const failedTaskRun = failedTaskRuns[0];

  if (!failedTaskRun || isKnownReason(succeededCondition?.reason)) {
    // No specific task run failure information, just print pipeline run status
    return {
      staticMessage:
        succeededCondition.message || t('Unknown failure condition'),
      title: t('Failure - check logs for details.'),
    };
  }

  const containerName = failedTaskRun.status.steps?.find(
    (step: PLRTaskRunStep) => step.terminated?.exitCode !== 0,
  )?.container;

  return taskRunSnippetMessage(
    failedTaskRun.pipelineTaskName,
    failedTaskRun.status,
    containerName,
  );
};
