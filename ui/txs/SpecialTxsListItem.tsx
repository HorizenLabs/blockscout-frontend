import { Flex, Skeleton } from '@chakra-ui/react';
import React from 'react';

import type { SpecialTransaction } from 'types/api/transaction';

import config from 'configs/app';
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
      <Flex mt={ 2 } columnGap={ 2 }>
        <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre">Value</Skeleton>
        <Skeleton isLoaded={ !isLoading } display="inline-block" variant="text_secondary" whiteSpace="pre">
          { getValueWithUnit(tx.value).toFormat() }
          { space }
          { config.chain.currency.symbol }
        </Skeleton>
      </Flex>
    </ListItemMobile>
  );
};

export default React.memo(SpecialTxsListItem);
