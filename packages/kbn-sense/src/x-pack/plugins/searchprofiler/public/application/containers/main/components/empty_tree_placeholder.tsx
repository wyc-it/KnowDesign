/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { EuiText } from '@elastic/eui';
import { i18n } from '../../../../../../../../packages/kbn-i18n/src';

export const EmptyTreePlaceHolder = () => {
  return (
    <div className="prfDevTool__main__emptyTreePlaceholder">
      <EuiText color="subdued">
        {/* TODO: translations */}
        <div className="img-content">
          <img src="data:image/png;base64,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" />
        </div>
        <h1>
          {i18n.translate('xpack.searchProfiler.emptyProfileTreeTitle', {
            defaultMessage: 'No queries to profile',
          })}
        </h1>
        <p>
          {i18n.translate('xpack.searchProfiler.emptyProfileTreeDescription', {
            defaultMessage: 'Enter a query, click Profile, and see the results here.',
          })}
        </p>
      </EuiText>
    </div>
  );
};
