import type { ChartTransactionResponse, ChartMarketResponse } from 'types/api/charts';
import type { Stats } from 'types/api/stats';
import type { QueryKeys } from 'types/client/queries';
import type { TimeChartDataItem } from 'ui/shared/chart/types';

export type ChartsQueryKeys = QueryKeys.chartsTxs | QueryKeys.chartsMarket;

export type ChainIndicatorId = 'daily_txs' | 'coin_price' | 'market_cup';

export interface TChainIndicator<Q extends ChartsQueryKeys> {
  id: ChainIndicatorId;
  title: string;
  value: (stats: Stats) => string;
  icon: React.ReactNode;
  hint?: string;
  api: {
    queryName: Q;
    path: string;
    dataFn: (response: ChartsResponse<Q>) => ChainIndicatorChartData;
  };
}

export type ChartsResponse<Q extends ChartsQueryKeys> =
    Q extends QueryKeys.chartsTxs ? ChartTransactionResponse :
      Q extends QueryKeys.chartsMarket ? ChartMarketResponse :
        never;

export type ChainIndicatorChartData = Array<TimeChartDataItem>;