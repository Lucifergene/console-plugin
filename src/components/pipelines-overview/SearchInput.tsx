import { SearchInput } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type SearchInputProps = {
  pageFlag: number;
  handleNameChange: (searchKeyword: string) => void;
};

const SearchInputField: React.FC<SearchInputProps> = ({
  pageFlag,
  handleNameChange,
}) => {
  const { t } = useTranslation('plugin__pipeline-console-plugin');
  return (
    <SearchInput
      className="pipeline-overview__search-input"
      placeholder={
        pageFlag === 1
          ? t('Search by pipeline name')
          : t('Search by repository name')
      }
      onChange={(event, text) => handleNameChange(text)}
      onClear={() => handleNameChange('')}
    />
  );
};

export default SearchInputField;
