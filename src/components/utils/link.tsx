/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import cx from 'classnames';
import Linkify from 'react-linkify';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard as CTC } from 'react-copy-to-clipboard';
import { Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/esm/icons/copy-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { ALL_NAMESPACES_KEY } from '../../consts';

// Kubernetes "dns-friendly" names match
// [a-z0-9]([-a-z0-9]*[a-z0-9])?  and are 63 or fewer characters
// long. This pattern checks the pattern but not the length.
//
// Don't capture anything in legalNamePattern, since it's used
// in expressions like
//
//    new RegExp("PREFIX" + legalNamePattern.source + "(SUFFIX)")
//
// And it's ok for users to make assumptions about capturing groups.

export const legalNamePattern = /[a-z0-9](?:[-a-z0-9]*[a-z0-9])?/;

const basePathPattern = new RegExp(
  `^/?${(window as any).SERVER_FLAGS.basePath}`,
);

export const namespacedPrefixes = [
  '/api-resource',
  '/k8s',
  '/operatorhub',
  '/operatormanagement',
  '/operators',
  '/details',
  '/search',
  '/status',
];

export const stripBasePath = (path: string): string =>
  path.replace(basePathPattern, '/');

export const getNamespace = (path: string): string => {
  path = stripBasePath(path);
  const split = path.split('/').filter((x) => x);

  if (split[1] === 'all-namespaces') {
    return ALL_NAMESPACES_KEY;
  }

  let ns: string;
  if (
    split[1] === 'cluster' &&
    ['namespaces', 'projects'].includes(split[2]) &&
    split[3]
  ) {
    ns = split[3];
  } else if (split[1] === 'ns' && split[2]) {
    ns = split[2];
  } else {
    return;
  }

  const match = ns.match(legalNamePattern);
  return match && match.length > 0 && match[0];
};

export const getURLSearchParams = () => {
  const all: any = {};
  const params = new URLSearchParams(window.location.search);

  for (const [k, v] of params.entries()) {
    all[k] = v;
  }

  return all;
};

export const ExternalLink: React.FC<ExternalLinkProps> = ({
  children,
  href,
  text,
  additionalClassName = '',
  dataTestID,
  stopPropagation,
}) => (
  <a
    className={cx('co-external-link', additionalClassName)}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-test-id={dataTestID}
    {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
  >
    {children || text}
  </a>
);

// Opens link with copy-to-clipboard

export const ExternalLinkWithCopy: React.FC<ExternalLinkWithCopyProps> = ({
  link,
  text,
  additionalClassName,
  dataTestID,
}) => {
  const [copied, setCopied] = React.useState(false);

  const { t } = useTranslation('plugin__pipelines-console-plugin');
  const tooltipText = copied
    ? t('Copied to clipboard')
    : t('Copy to clipboard');
  const tooltipContent = [
    <span className="co-nowrap" key="nowrap">
      {tooltipText}
    </span>,
  ];

  return (
    <div className={cx(additionalClassName)}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        data-test-id={dataTestID}
      >
        {text ?? link}
        <span className="co-icon-nowrap">
          &nbsp;
          <span className="co-external-link-with-copy__icon co-external-link-with-copy__externallinkicon">
            <ExternalLinkAltIcon />
          </span>
        </span>
      </a>
      <span className="co-icon-nowrap">
        <Tooltip
          content={tooltipContent}
          trigger="click mouseenter focus"
          exitDelay={1250}
        >
          <CTC text={link} onCopy={() => setCopied(true)}>
            <span
              onMouseEnter={() => setCopied(false)}
              className="co-external-link-with-copy__icon co-external-link-with-copy__copyicon"
            >
              <CopyIcon />
              <span className="pf-v5-u-screen-reader">
                {t('Copy to clipboard')}
              </span>
            </span>
          </CTC>
        </Tooltip>
      </span>
    </div>
  );
};

// Open links in a new window and set noopener/noreferrer.
export const LinkifyExternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>
    {children}
  </Linkify>
);
LinkifyExternal.displayName = 'LinkifyExternal';

type ExternalLinkProps = {
  href: string;
  text?: React.ReactNode;
  additionalClassName?: string;
  dataTestID?: string;
  stopPropagation?: boolean;
};

type ExternalLinkWithCopyProps = {
  link: string;
  text?: string;
  dataTestID?: string;
  additionalClassName?: string;
};
