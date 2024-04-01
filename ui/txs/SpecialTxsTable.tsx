import { Link, Table, Tbody, Tr, Th, Icon } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import type { SpecialTransaction } from 'types/api/transaction';
import type { Sort } from 'types/client/txs-sort';

import config from 'configs/app';
import rightArrowIcon from 'icons/arrows/east.svg';
import * as SocketNewItemsNotice from 'ui/shared/SocketNewItemsNotice';
import TheadSticky from 'ui/shared/TheadSticky';

import SpecialTxsTableItem from './SpecialTxsTableItem';

type Props = {
  txs: Array<SpecialTransaction>;
  sort: (field: 'val' | 'fee') => () => void;
  sorting?: Sort;
  top: number;
  showBlockInfo: boolean;
  showSocketInfo: boolean;
  socketInfoAlert?: string;
  socketInfoNum?: number;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
}

const SpecialTxsTable = ({
  txs,
  sort,
  sorting,
  top,
  showBlockInfo,
  showSocketInfo,
  socketInfoAlert,
  socketInfoNum,
  currentAddress,
  enableTimeIncrement,
  isLoading,
}: Props) => {
  return (
    <Table variant="simple" minWidth="950px" size="xs">
      <TheadSticky top={ top }>
        <Tr>
          <Th width="4%"></Th>
          { showBlockInfo && <Th width="32%">Block</Th> }
          <Th width="32%">To</Th>
          <Th width="32%" isNumeric>
            <Link onClick={ sort('val') } display="flex" justifyContent="end">
              { sorting === 'val-asc' && <Icon boxSize={ 5 } as={ rightArrowIcon } transform="rotate(-90deg)"/> }
              { sorting === 'val-desc' && <Icon boxSize={ 5 } as={ rightArrowIcon } transform="rotate(90deg)"/> }
              { `Value ${ config.chain.currency.symbol }` }
            </Link>
          </Th>
        </Tr>
      </TheadSticky>
      <Tbody>
        { showSocketInfo && (
          <SocketNewItemsNotice.Desktop
            url={ window.location.href }
            alert={ socketInfoAlert }
            num={ socketInfoNum }
            isLoading={ isLoading }
          />
        ) }
        <AnimatePresence initial={ false }>
          { txs.map((item, index) => (
            <SpecialTxsTableItem
              key={ item.block_hash + '/' + item.to_address + (isLoading ? index : '') }
              tx={ item }
              showBlockInfo={ showBlockInfo }
              currentAddress={ currentAddress }
              enableTimeIncrement={ enableTimeIncrement }
              isLoading={ isLoading }
            />
          )) }
        </AnimatePresence>
      </Tbody>
    </Table>
  );
};

export default React.memo(SpecialTxsTable);
