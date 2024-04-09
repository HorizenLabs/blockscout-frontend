import { useRouter } from 'next/router';
import React from 'react';

import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import { SPECIAL_TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import TxsContent from 'ui/txs/TxsContent';

import AddressCsvExportLink from './AddressCsvExportLink';

type Props = {
  scrollRef?: React.RefObject<HTMLDivElement>;
  overloadCount?: number;
  resource: 'forward_transfers' | 'fee_payments';
}

const AddressSpecialTransfers = ({ scrollRef, resource }: Props) => {
  const router = useRouter();

  const isMobile = useIsMobile();
  const currentAddress = getQueryParamString(router.query.hash);

  const addressTxsQuery = useQueryWithPages({
    resourceName: `address_${ resource }`,
    pathParams: { hash: currentAddress },
    scrollRef,
    options: {
      placeholderData: generateListStub<`address_${ typeof resource }`>(SPECIAL_TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
      } }),
    },
  });

  const csvExportLink = (
    <AddressCsvExportLink
      address={ currentAddress }
      params={{ type: 'transactions' }}
      ml="auto"
      isLoading={ addressTxsQuery.pagination.isLoading }
    />
  );

  return (
    <>
      { !isMobile && (
        <ActionBar mt={ -6 }>
          { currentAddress && csvExportLink }
          <Pagination { ...addressTxsQuery.pagination } ml={ 8 }/>
        </ActionBar>
      ) }
      <TxsContent
        query={ addressTxsQuery }
        currentAddress={ typeof currentAddress === 'string' ? currentAddress : undefined }
        enableTimeIncrement
        showSocketInfo={ false }
        top={ 80 }
        isSpecialTxsContent={ true }
      />
    </>
  );
};

export default AddressSpecialTransfers;
