
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

export const useLocalization=()=>{
    const intl = useIntl();
    return useCallback((label)=>intl.formatMessage({ id: label}),[intl])
}  