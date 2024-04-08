import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { AddressTransactionsResponse } from 'types/api/address';
import type { Transaction } from 'types/api/transaction';

import { getResourceKey } from 'lib/api/useApiQuery';
import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import { SPECIAL_TX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import TxsContent from 'ui/txs/TxsContent';

import AddressCsvExportLink from './AddressCsvExportLink';

const OVERLOAD_COUNT = 75;

type Props = {
  scrollRef?: React.RefObject<HTMLDivElement>;
  overloadCount?: number;
  resource: 'forward_transfers' | 'fee_payments';
}

const AddressSpecialTransfers = ({ scrollRef, overloadCount = OVERLOAD_COUNT, resource }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [ socketAlert, setSocketAlert ] = React.useState('');
  const [ newItemsCount, setNewItemsCount ] = React.useState(0);

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

  const handleNewSocketMessage: SocketMessage.AddressTxs['handler'] = (payload) => {
    setSocketAlert('');

    queryClient.setQueryData(
      getResourceKey('address_txs', { pathParams: { hash: currentAddress } }),
      (prevData: AddressTransactionsResponse | undefined) => {
        if (!prevData) {
          return;
        }

        const newItems: Array<Transaction> = [];
        let newCount = 0;

        payload.transactions.forEach(tx => {
          const currIndex = prevData.items.findIndex((item) => item.hash === tx.hash);

          if (currIndex > -1) {
            prevData.items[currIndex] = tx;
          } else {
            if (newItems.length + prevData.items.length >= overloadCount) {
              newCount++;
            } else {
              newItems.push(tx);
            }
          }
        });
        if (newCount > 0) {
          setNewItemsCount(prev => prev + newCount);
        }

        return {
          ...prevData,
          items: [
            ...newItems,
            ...prevData.items,
          ],
        };
      });

  };

  const handleSocketClose = React.useCallback(() => {
    setSocketAlert('Connection is lost. Please refresh the page to load new transactions.');
  }, []);

  const handleSocketError = React.useCallback(() => {
    setSocketAlert('An error has occurred while fetching new transactions. Please refresh the page.');
  }, []);

  const channel = useSocketChannel({
    topic: `addresses:${ currentAddress?.toLowerCase() }`,
    onSocketClose: handleSocketClose,
    onSocketError: handleSocketError,
    isDisabled: addressTxsQuery.pagination.page !== 1 || addressTxsQuery.isPlaceholderData,
  });

  useSocketMessage({
    channel,
    event: 'transaction',
    handler: handleNewSocketMessage,
  });

  useSocketMessage({
    channel,
    event: 'pending_transaction',
    handler: handleNewSocketMessage,
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
        showSocketInfo={ addressTxsQuery.pagination.page === 1 }
        socketInfoAlert={ socketAlert }
        socketInfoNum={ newItemsCount }
        top={ 80 }
        isSpecialTxsContent={ true }
      />
    </>
  );
};

export default AddressSpecialTransfers;
