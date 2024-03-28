import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CombinedErrorDetails } from './log-snippet-types';
import LogSnippetBlock from './LogSnippetBlock';

type RunDetailErrorLogProps = {
  logDetails: CombinedErrorDetails;
  namespace: string;
};

const RunDetailsErrorLog: React.FC<RunDetailErrorLogProps> = ({
  logDetails,
  namespace,
}) => {
  const { t } = useTranslation('plugin__pipelines-console-plugin');
  if (!logDetails) {
    return null;
  }

  return (
    <>
      <dl>
        <dt>{t('Message')}</dt>
        <dd>{logDetails.title}</dd>
      </dl>
      <dl>
        <dt>{t('Log snippet')}</dt>
        <dd>
          <LogSnippetBlock logDetails={logDetails} namespace={namespace}>
            {(logSnippet: string) => <pre className="co-pre">{logSnippet}</pre>}
          </LogSnippetBlock>
        </dd>
      </dl>
    </>
  );
};

export default RunDetailsErrorLog;
