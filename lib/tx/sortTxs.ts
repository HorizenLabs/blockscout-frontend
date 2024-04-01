import type { SpecialTransaction, Transaction } from 'types/api/transaction';
import type { Sort } from 'types/client/txs-sort';

import compareBns from 'lib/bigint/compareBns';

const sortTxs = (sorting?: Sort) => (tx1: Transaction | SpecialTransaction, tx2: Transaction | SpecialTransaction) => {
  switch (sorting) {
    case 'val-desc':
      return compareBns(tx1.value, tx2.value);
    case 'val-asc':
      return compareBns(tx2.value, tx1.value);
    case 'fee-desc':
      if ('fee' in tx1 && 'fee' in tx2) {
        return compareBns(tx1.fee.value, tx2.fee.value);
      } else {
        return 0;
      }
      break;
    case 'fee-asc':
      if ('fee' in tx1 && 'fee' in tx2) {
        return compareBns(tx2.fee.value, tx1.fee.value);
      } else {
        return 0;
      }
      break;
    default:
      return 0;
  }
};

export default sortTxs;
