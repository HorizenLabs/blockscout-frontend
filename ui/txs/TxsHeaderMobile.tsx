import { HStack, chakra } from '@chakra-ui/react';
import React from 'react';

import type { Sort as TSort } from 'types/client/txs-sort';
import type { PaginationParams } from 'ui/shared/pagination/types';

// import FilterInput from 'ui/shared/filters/FilterInput';

import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';
import type { Option } from 'ui/shared/sort/Sort';
import Sort from 'ui/shared/sort/Sort';

// import TxsFilters from './TxsFilters';

type Props = {
  sorting: TSort;
  setSorting: (val: TSort | undefined) => void;
  paginationProps: PaginationParams;
  className?: string;
  showPagination?: boolean;
  filterComponent?: React.ReactNode;
  linkSlot?: React.ReactNode;
  isSpecialTxsContent?: boolean;
}

const TxsHeaderMobile = ({ filterComponent, sorting, setSorting, paginationProps,
  className, showPagination = true, linkSlot, isSpecialTxsContent = false }: Props) => {
  const SORT_OPTIONS: Array<Option<TSort>> = [
    { title: 'Default', id: undefined },
    { title: 'Value ascending', id: 'val-asc' },
    { title: 'Value descending', id: 'val-desc' },
  ];

  if (!isSpecialTxsContent) {
    SORT_OPTIONS.push(
      { title: 'Fee ascending', id: 'fee-asc' },
      { title: 'Fee descending', id: 'fee-desc' },
    );
  }

  return (
    <ActionBar className={ className }>
      <HStack>
        { filterComponent }
        <Sort
          options={ SORT_OPTIONS }
          setSort={ setSorting }
          sort={ sorting }
          isLoading={ paginationProps.isLoading }
        />
        { /* api is not implemented */ }
        { /* <FilterInput
          // eslint-disable-next-line react/jsx-no-bind
          onChange={ () => {} }
          maxW="360px"
          size="xs"
          placeholder="Search by addresses, hash, method..."
        /> */ }
        { linkSlot }
      </HStack>
      { showPagination && <Pagination { ...paginationProps }/> }
    </ActionBar>
  );
};

export default chakra(TxsHeaderMobile);
