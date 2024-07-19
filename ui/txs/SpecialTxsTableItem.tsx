import { Tr, Td, VStack, Skeleton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React from 'react';

import type { SpecialTransaction } from 'types/api/transaction';

import { EON_FORGER_SUBSIDIES_ADDRESS, FEE_PAYMENTS_TAB, MAINCHAIN_REWARDS_DISTRIBUTION_TAB } from 'lib/consts';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import getQueryParamString from 'lib/router/getQueryParamString';
import CurrencyValue from 'ui/shared/CurrencyValue';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';

type Props = {
  tx: SpecialTransaction;
  showBlockInfo: boolean;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
}

const SpecialTxsTableItem = ({ tx, showBlockInfo, currentAddress, enableTimeIncrement, isLoading }: Props) => {
  const router = useRouter();
  const isFeePaymentsTab = router.query.tab === FEE_PAYMENTS_TAB;

  const hash = getQueryParamString(router.query.hash);
  const IS_EON_FORGER_SUBSIDIES_ADDRESS = hash === EON_FORGER_SUBSIDIES_ADDRESS;

  const dataTo = {
    hash: tx.to_address,
    implementation_name: null,
    is_contract: false,
    is_verified: false,
    name: null,
    private_tags: [],
    public_tags: [],
    watchlist_names: [],
  };
  const isIn = Boolean(currentAddress && currentAddress === dataTo?.hash);

  const timeAgo = useTimeAgoIncrement(tx.timestamp, enableTimeIncrement);

  const addressTo = dataTo ? (
    <AddressEntity
      address={ dataTo }
      isLoading={ isLoading }
      truncation="dynamic"
      noCopy={ isIn }
      noLink={ isIn }
      w="100%"
      py="2px"
    />
  ) : '-';

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ tx.block_hash + '/' + tx.to_address }
    >
      <Td/>
      { showBlockInfo && (
        <Td>
          { (tx.block_number) && (
            <VStack alignItems="start" lineHeight="24px">
              <BlockEntity
                isLoading={ isLoading }
                number={ tx.block_number }
                noIcon
                fontSize="sm"
                lineHeight={ 6 }
                fontWeight={ 500 }
              />
              { tx.timestamp && <Skeleton color="text_secondary" fontWeight="400" isLoaded={ !isLoading }><span>{ timeAgo }</span></Skeleton> }
            </VStack>
          ) }
        </Td>
      ) }
      <Td>
        { addressTo }
      </Td>
      {
        isFeePaymentsTab && (
          <>
            <Td isNumeric>
              <CurrencyValue value={ tx.value_from_mainchain || '0' } accuracy={ 18 } wordBreak="break-word" isLoading={ isLoading }/>
            </Td>
            <Td isNumeric>
              <CurrencyValue value={ tx.value_from_fees || '0' } accuracy={ 18 } wordBreak="break-word" isLoading={ isLoading }/>
            </Td>
          </>
        )
      }
      <Td isNumeric>
        <CurrencyValue value={
          (IS_EON_FORGER_SUBSIDIES_ADDRESS &&
            (router.query.tab === undefined || router.query.tab === MAINCHAIN_REWARDS_DISTRIBUTION_TAB)) ?
            tx.value_from_mainchain || '' :
            tx.value }
        accuracy={ 18 } wordBreak="break-word" isLoading={ isLoading }/>
      </Td>
    </Tr>
  );
};

export default React.memo(SpecialTxsTableItem);
