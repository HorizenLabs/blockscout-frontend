import { Flex, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { SpecialTransaction } from 'types/api/transaction';

import config from 'configs/app';
import { FEE_PAYMENTS_TAB, MAINCHAIN_REWARDS_DISTRIBUTION_TAB } from 'lib/consts';
import getValueWithUnit from 'lib/getValueWithUnit';
import useTimeAgoIncrement from 'lib/hooks/useTimeAgoIncrement';
import { space } from 'lib/html-entities';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';

type Props = {
  tx: SpecialTransaction;
  showBlockInfo: boolean;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
}

const SpecialTxsListItem = ({ tx, isLoading, showBlockInfo, currentAddress, enableTimeIncrement }: Props) => {
  const router = useRouter();
  const isMainchainRewardsDistributionTab = router.query.tab === MAINCHAIN_REWARDS_DISTRIBUTION_TAB;
  const isFeePaymentsTab = router.query.tab === FEE_PAYMENTS_TAB;

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

  const isIn = Boolean(currentAddress && currentAddress === tx.to_address);

  const timeAgo = useTimeAgoIncrement(tx.timestamp, enableTimeIncrement);

  return (
    <ListItemMobile display="block" width="100%" isAnimated key={ tx.block_hash + '/' + tx.to_address }>
      { showBlockInfo && tx.block_number !== null && (
        <Flex justifyContent="space-between" lineHeight="24px" mt={ 3 } alignItems="center">
          <Flex>
            <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Block </Skeleton>
            <BlockEntity
              isLoading={ isLoading }
              number={ tx.block_number }
              noIcon
            />
          </Flex>
          { tx.timestamp && (
            <Skeleton isLoaded={ !isLoading } color="text_secondary" fontWeight="400" fontSize="sm">
              <span>{ timeAgo }</span>
            </Skeleton>
          ) }
        </Flex>
      ) }
      <Flex alignItems="center" height={ 6 } mt={ 6 }>
        { dataTo ? (
          <AddressEntity
            address={ dataTo }
            isLoading={ isLoading }
            noLink={ isIn }
            noCopy={ isIn }
            fontWeight="500"
            truncation="dynamic"
          />
        ) : '-' }
      </Flex>
      {
        isFeePaymentsTab && (
          <>
            <Flex mt={ 2 } columnGap={ 2 }>
              <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Value from mainchain</Skeleton>
              <Skeleton isLoaded={ !isLoading } display="inline-block" variant="text_secondary" whiteSpace="pre">
                { getValueWithUnit(tx.value_from_mainchain || '0').toFormat() }
                { space }
                { config.chain.currency.symbol }
              </Skeleton>
            </Flex>
            <Flex mt={ 2 } columnGap={ 2 }>
              <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Value from fees</Skeleton>
              <Skeleton isLoaded={ !isLoading } display="inline-block" variant="text_secondary" whiteSpace="pre">
                { getValueWithUnit(tx.value_from_fees || '0').toFormat() }
                { space }
                { config.chain.currency.symbol }
              </Skeleton>
            </Flex>
          </>
        )
      }
      <Flex mt={ 2 } columnGap={ 2 }>
        <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">{ isFeePaymentsTab ? 'Total Value' : 'Value' }</Skeleton>
        <Skeleton isLoaded={ !isLoading } display="inline-block" variant="text_secondary" whiteSpace="pre">
          { getValueWithUnit(isMainchainRewardsDistributionTab ? tx.value_from_mainchain || '' : tx.value).toFormat() }
          { space }
          { config.chain.currency.symbol }
        </Skeleton>
      </Flex>
    </ListItemMobile>
  );
};

export default React.memo(SpecialTxsListItem);
