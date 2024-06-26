import { Box, Show, Hide } from '@chakra-ui/react';
import router from 'next/router';
import React from 'react';

import type { AddressFromToFilter } from 'types/api/address';
import type { SpecialTransaction } from 'types/api/transaction';

import * as cookies from 'lib/cookies';
import useIsMobile from 'lib/hooks/useIsMobile';
import AddressCsvExportLink from 'ui/address/AddressCsvExportLink';
import DataListDisplay from 'ui/shared/DataListDisplay';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';
import * as SocketNewItemsNotice from 'ui/shared/SocketNewItemsNotice';

import SpecialTxsListItem from './SpecialTxsListItem';
import SpecialTxsTable from './SpecialTxsTable';
import TxsHeaderMobile from './TxsHeaderMobile';
import TxsListItem from './TxsListItem';
import TxsTable from './TxsTable';
import useTxsSort from './useTxsSort';

type Props = {
  // eslint-disable-next-line max-len
  query: QueryWithPagesResult<'txs_validated' | 'txs_pending'> | QueryWithPagesResult<'txs_watchlist'> | QueryWithPagesResult<'block_txs'> |QueryWithPagesResult<'zkevm_l2_txn_batch_txs'> | QueryWithPagesResult<'forward_transfers'> | QueryWithPagesResult<'fee_payments'>;
  showBlockInfo?: boolean;
  showSocketInfo?: boolean;
  socketInfoAlert?: string;
  socketInfoNum?: number;
  currentAddress?: string;
  filter?: React.ReactNode;
  filterValue?: AddressFromToFilter;
  enableTimeIncrement?: boolean;
  top?: number;
  isSpecialTxsContent?: boolean;
}

const TxsContent = ({
  filter,
  filterValue,
  query,
  showBlockInfo = true,
  showSocketInfo = true,
  socketInfoAlert,
  socketInfoNum,
  currentAddress,
  enableTimeIncrement,
  top,
  isSpecialTxsContent = false,
}: Props) => {
  const sortingCookie = cookies.get(cookies.NAMES.TXS_SORT);
  if (isSpecialTxsContent && sortingCookie?.includes('fee')) {
    cookies.set(cookies.NAMES.TXS_SORT, '');
  }

  const { data, isPlaceholderData, isError, setSortByField, setSortByValue, sorting } = useTxsSort(query);
  const isMobile = useIsMobile();

  const content = data?.items ? (
    <>
      <Show below="lg" ssr={ false }>
        <Box>
          { showSocketInfo && (
            <SocketNewItemsNotice.Mobile
              url={ window.location.href }
              num={ socketInfoNum }
              alert={ socketInfoAlert }
              isLoading={ isPlaceholderData }
            />
          ) }
          { data.items.map((tx, index) => {
            const castedTx = tx as unknown as SpecialTransaction;

            return isSpecialTxsContent ? (
              <SpecialTxsListItem
                key={ castedTx.block_hash + (isPlaceholderData ? index : castedTx.index) }
                tx={ castedTx }
                showBlockInfo={ showBlockInfo }
                currentAddress={ currentAddress }
                enableTimeIncrement={ enableTimeIncrement }
                isLoading={ isPlaceholderData }
              />
            ) : (
              <TxsListItem
                key={ tx.hash + (isPlaceholderData ? index : '') }
                tx={ tx }
                showBlockInfo={ showBlockInfo }
                currentAddress={ currentAddress }
                enableTimeIncrement={ enableTimeIncrement }
                isLoading={ isPlaceholderData }
              />
            );
          }) }
        </Box>
      </Show>
      <Hide below="lg" ssr={ false }>
        {
          isSpecialTxsContent ? (
            <SpecialTxsTable
              txs={ data.items as unknown as Array<SpecialTransaction> }
              sort={ setSortByField }
              sorting={ sorting }
              showBlockInfo={ showBlockInfo }
              showSocketInfo={ showSocketInfo }
              socketInfoAlert={ socketInfoAlert }
              socketInfoNum={ socketInfoNum }
              top={ top || query.pagination.isVisible ? 80 : 0 }
              currentAddress={ currentAddress }
              enableTimeIncrement={ enableTimeIncrement }
              isLoading={ isPlaceholderData }
            />
          ) : (
            <TxsTable
              txs={ data.items }
              sort={ setSortByField }
              sorting={ sorting }
              showBlockInfo={ showBlockInfo }
              showSocketInfo={ showSocketInfo }
              socketInfoAlert={ socketInfoAlert }
              socketInfoNum={ socketInfoNum }
              top={ top || query.pagination.isVisible ? 80 : 0 }
              currentAddress={ currentAddress }
              enableTimeIncrement={ enableTimeIncrement }
              isLoading={ isPlaceholderData }
            />
          )
        }
      </Hide>
    </>
  ) : null;

  const actionBar = isMobile ? (
    <TxsHeaderMobile
      mt={ -6 }
      sorting={ sorting }
      setSorting={ setSortByValue }
      paginationProps={ query.pagination }
      showPagination={ query.pagination.isVisible }
      filterComponent={ filter }
      isSpecialTxsContent={ isSpecialTxsContent }
      linkSlot={ currentAddress ? (
        <AddressCsvExportLink
          address={ currentAddress }
          params={{ type: 'transactions', filterType: 'address', filterValue }}
          isLoading={ query.pagination.isLoading }
        />
      ) : null
      }
    />
  ) : null;

  const getEmptyText = () => {
    const currentTab = router.query.tab;
    switch (currentTab) {
      case 'forward_transfers':
        return 'There are no forward transfers.';
      case 'fee_payments':
        return 'There are no fee payments.';
      default:
        return 'There are no transactions.';
    }
  };

  return (
    <DataListDisplay
      isError={ isError }
      items={ data?.items }
      emptyText={ getEmptyText() }
      content={ content }
      actionBar={ actionBar }
    />
  );
};

export default TxsContent;
