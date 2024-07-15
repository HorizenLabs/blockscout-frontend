import BigNumber from 'bignumber.js';

export const WEI = new BigNumber(10 ** 18);
export const GWEI = new BigNumber(10 ** 9);
export const WEI_IN_GWEI = WEI.dividedBy(GWEI);
export const ZERO = new BigNumber(0);

export const SECOND = 1_000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;

export const Kb = 1_000;
export const Mb = 1_000 * Kb;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const WITHDRAWAL_REQUEST_CONTRACT_ADDRESS = '0x0000000000000000000011111111111111111111';

export const EON_FORGER_SUBSIDIES_ADDRESS = '0x0000000000000000000033333333333333333333';

export const MAINCHAIN_REWARDS_DISTRIBUTION_TAB = 'mainchain_rewards_distribution';

export const FEE_PAYMENTS_TAB = 'fee-payments';
