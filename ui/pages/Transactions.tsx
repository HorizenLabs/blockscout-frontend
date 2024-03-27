import { useRouter } from 'next/router';
import React from 'react';

import type { RoutedTab } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import { WITHDRAWAL_REQUEST_CONTRACT_ADDRESS } from 'lib/consts';
import useHasAccount from 'lib/hooks/useHasAccount';
import useIsMobile from 'lib/hooks/useIsMobile';
import useNewTxsSocket from 'lib/hooks/useNewTxsSocket';
import { SPECIAL_TX, TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TxsContent from 'ui/txs/TxsContent';
import TxsWatchlist from 'ui/txs/TxsWatchlist';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  py: 5,
  marginTop: -5,
};

const Transactions = () => {
  const verifiedTitle = config.chain.verificationType === 'validation' ? 'Validated' : 'Mined';
  const router = useRouter();
  const isMobile = useIsMobile();
  const txsQuery = useQueryWithPages({
    resourceName: router.query.tab === 'pending' ? 'txs_pending' : 'txs_validated',
    filters: { filter: router.query.tab === 'pending' ? 'pending' : 'validated' },
    options: {
      enabled: !router.query.tab || router.query.tab === 'validated' || router.query.tab === 'pending',
      placeholderData: generateListStub<'txs_validated'>(TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
        filter: 'validated',
      } }),
    },
  });

  const fwTransfersQuery = useQueryWithPages({
    resourceName: 'forward_transfers',
    options: {
      enabled: router.query.tab === 'forward-transfers',
      placeholderData: generateListStub<'forward_transfers'>(SPECIAL_TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
      } }),
    },
  });

  const bwTransfersQuery = useQueryWithPages({
    resourceName: 'address_txs',
    pathParams: { hash: WITHDRAWAL_REQUEST_CONTRACT_ADDRESS },
    options: {
      enabled: router.query.tab === 'backward-transfers',
      placeholderData: generateListStub<'address_txs'>(TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
      } }),
    },
  });

  const txsWatchlistQuery = useQueryWithPages({
    resourceName: 'txs_watchlist',
    options: {
      enabled: router.query.tab === 'watchlist',
      placeholderData: generateListStub<'txs_watchlist'>(TX, 50, { next_page_params: {
        block_number: 9005713,
        index: 5,
        items_count: 50,
      } }),
    },
  });

  const { num, socketAlert } = useNewTxsSocket();

  const hasAccount = useHasAccount();

  const tabs: Array<RoutedTab> = [
    {
      id: 'validated',
      title: verifiedTitle,
      component: <TxsContent query={ txsQuery } showSocketInfo={ txsQuery.pagination.page === 1 } socketInfoNum={ num } socketInfoAlert={ socketAlert }/> },
    {
      id: 'pending',
      title: 'Pending',
      component: (
        <TxsContent
          query={ txsQuery }
          showBlockInfo={ false }
          showSocketInfo={ txsQuery.pagination.page === 1 }
          socketInfoNum={ num }
          socketInfoAlert={ socketAlert }
        />
      ),
    },
    {
      id: 'forward-transfers',
      title: 'Forward transfers',
      component: <TxsContent query={ fwTransfersQuery } isSpecialTxsContent={ true }/>,
    },
    {
      id: 'fee-payments',
      title: 'Fee payments',
      component: <TxsContent query={ txsQuery }/>,
    },
    {
      id: 'backward-transfers',
      title: 'Backward transfers',
      component: <TxsContent query={ bwTransfersQuery }/>,
    },
    hasAccount ? {
      id: 'watchlist',
      title: 'Watch list',
      component: <TxsWatchlist query={ txsWatchlistQuery }/>,
    } : undefined,
  ].filter(Boolean);

  let pagination = txsQuery.pagination;
  if (router.query.tab === 'watchlist') {
    pagination = txsWatchlistQuery.pagination;
  } else if (router.query.tab === 'backward-transfers') {
    pagination = bwTransfersQuery.pagination;
  } else if (router.query.tab === 'forward-transfers') {
    pagination = fwTransfersQuery.pagination;
  }

  return (
    <>
      <PageTitle title="Transactions" withTextAd/>
      <RoutedTabs
        tabs={ tabs }
        tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
        rightSlot={ (
          pagination.isVisible && !isMobile ? <Pagination my={ 1 } { ...pagination }/> : null
        ) }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default Transactions;
