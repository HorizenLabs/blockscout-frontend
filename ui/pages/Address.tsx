import { Box, Flex, Icon } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { TokenType } from 'types/api/token';
import type { RoutedTab } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import iconSuccess from 'icons/status/success.svg';
import useApiQuery from 'lib/api/useApiQuery';
import { EON_FORGER_SUBSIDIES_ADDRESS, MAINCHAIN_REWARDS_DISTRIBUTION_TAB } from 'lib/consts';
import { useAppContext } from 'lib/contexts/app';
import useContractTabs from 'lib/hooks/useContractTabs';
import useIsSafeAddress from 'lib/hooks/useIsSafeAddress';
import getQueryParamString from 'lib/router/getQueryParamString';
import { ADDRESS_COUNTERS, ADDRESS_INFO } from 'stubs/address';
import AddressBlocksValidated from 'ui/address/AddressBlocksValidated';
import AddressCoinBalance from 'ui/address/AddressCoinBalance';
import AddressContract from 'ui/address/AddressContract';
import AddressDetails from 'ui/address/AddressDetails';
import AddressInternalTxs from 'ui/address/AddressInternalTxs';
import AddressSpecialTransfers from 'ui/address/AddressSpecialTransfers';
import AddressTokens from 'ui/address/AddressTokens';
import AddressTokenTransfers from 'ui/address/AddressTokenTransfers';
import AddressTxs from 'ui/address/AddressTxs';
import AddressWithdrawals from 'ui/address/AddressWithdrawals';
import AddressFavoriteButton from 'ui/address/details/AddressFavoriteButton';
import AddressQrCode from 'ui/address/details/AddressQrCode';
import AccountActionsMenu from 'ui/shared/AccountActionsMenu/AccountActionsMenu';
import TextAd from 'ui/shared/ad/TextAd';
import AddressAddToWallet from 'ui/shared/address/AddressAddToWallet';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import EntityTags from 'ui/shared/EntityTags';
import NetworkExplorers from 'ui/shared/NetworkExplorers';
import PageTitle from 'ui/shared/Page/PageTitle';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TabsSkeleton from 'ui/shared/Tabs/TabsSkeleton';

export const tokenTabsByType: Record<TokenType, string> = {
  'ERC-20': 'tokens_erc20',
  'ERC-721': 'tokens_erc721',
  'ERC-1155': 'tokens_erc1155',
} as const;

const TOKEN_TABS = Object.values(tokenTabsByType);

const AddressPageContent = () => {
  const router = useRouter();
  const appProps = useAppContext();

  const tabsScrollRef = React.useRef<HTMLDivElement>(null);
  const hash = getQueryParamString(router.query.hash);

  const addressQuery = useApiQuery('address', {
    pathParams: { hash },
    queryOptions: {
      enabled: Boolean(hash),
      placeholderData: ADDRESS_INFO,
    },
  });

  const addressCountersQuery = useApiQuery('address_counters', {
    pathParams: { hash },
    queryOptions: {
      enabled: Boolean(hash),
      placeholderData: ADDRESS_COUNTERS,
    },
  });

  const isSafeAddress = useIsSafeAddress(!addressQuery.isPlaceholderData && addressQuery.data?.is_contract ? hash : undefined);

  const contractTabs = useContractTabs(addressQuery.data);

  const tabs: Array<RoutedTab> = React.useMemo(() => {
    return [
      {
        id: MAINCHAIN_REWARDS_DISTRIBUTION_TAB,
        title: 'Mainchain Rewards Distribution',
        component: <AddressSpecialTransfers resource="fee_payments_from_mainchain"/>,
      },
      {
        id: 'txs',
        title: 'Transactions',
        component: <AddressTxs scrollRef={ tabsScrollRef }/>,
      },
      config.features.beaconChain.isEnabled ?
        {
          id: 'withdrawals',
          title: 'Withdrawals',
          component: <AddressWithdrawals scrollRef={ tabsScrollRef }/>,
        } :
        undefined,
      {
        id: 'token_transfers',
        title: 'Token transfers',
        component: <AddressTokenTransfers scrollRef={ tabsScrollRef }/>,
      },
      {
        id: 'tokens',
        title: 'Tokens',
        component: <AddressTokens/>,
        subTabs: TOKEN_TABS,
      },
      {
        id: 'internal_txns',
        title: 'Internal txns',
        component: <AddressInternalTxs scrollRef={ tabsScrollRef }/>,
      },
      !addressQuery.data?.is_contract ? {
        id: 'forward_transfers',
        title: 'Forward Transfers',
        component: <AddressSpecialTransfers resource="forward_transfers"/>,
      } : undefined,
      !addressQuery.data?.is_contract ? {
        id: 'fee-payments',
        title: 'Fee Payments',
        component: <AddressSpecialTransfers resource="fee_payments"/>,
      } : undefined,
      {
        id: 'coin_balance_history',
        title: 'Coin balance history',
        component: <AddressCoinBalance/>,
      },
      config.chain.verificationType === 'validation' && (addressCountersQuery.data?.validations_count && addressCountersQuery.data.validations_count !== '0') ?
        {
          id: 'blocks_validated',
          title: 'Blocks forged',
          component: <AddressBlocksValidated scrollRef={ tabsScrollRef }/>,
        } :
        undefined,
      addressQuery.data?.is_contract ? {
        id: 'contract',
        title: () => {
          if (addressQuery.data.is_verified) {
            return (
              <>
                <span>Contract</span>
                <Icon as={ iconSuccess } boxSize="14px" color="green.500" ml={ 1 }/>
              </>
            );
          }

          return 'Contract';
        },
        component: <AddressContract tabs={ contractTabs }/>,
        subTabs: contractTabs.map(tab => tab.id),
      } : undefined,
    ].filter(Boolean).filter((tab) => {
      if (hash !== EON_FORGER_SUBSIDIES_ADDRESS) {
        return tab.id !== MAINCHAIN_REWARDS_DISTRIBUTION_TAB;
      }
      return true;
    });
  }, [ addressQuery.data, contractTabs, addressCountersQuery.data, hash ]);

  const tags = (
    <EntityTags
      data={ addressQuery.data }
      isLoading={ addressQuery.isPlaceholderData }
      tagsBefore={ [
        !addressQuery.data?.is_contract ? { label: 'eoa', display_name: 'EOA' } : undefined,
        addressQuery.data?.implementation_address ? { label: 'proxy', display_name: 'Proxy' } : undefined,
        addressQuery.data?.token ? { label: 'token', display_name: 'Token' } : undefined,
        isSafeAddress ? { label: 'safe', display_name: 'Multisig: Safe' } : undefined,
      ] }
    />
  );

  const content = addressQuery.isError ? null : <RoutedTabs tabs={ tabs } tabListProps={{ mt: 8 }}/>;

  const backLink = React.useMemo(() => {
    const hasGoBackLink = appProps.referrer && appProps.referrer.includes('/accounts');

    if (!hasGoBackLink) {
      return;
    }

    return {
      label: 'Back to top accounts list',
      url: appProps.referrer,
    };
  }, [ appProps.referrer ]);

  const isLoading = addressQuery.isPlaceholderData;

  const titleSecondRow = (
    <Flex alignItems="center" w="100%" columnGap={ 2 } rowGap={ 2 } flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
      <AddressEntity
        address={{ ...addressQuery.data, hash, name: '' }}
        isLoading={ isLoading }
        fontFamily="heading"
        fontSize="lg"
        fontWeight={ 500 }
        noLink
        isSafeAddress={ isSafeAddress }
      />
      { !isLoading && addressQuery.data?.is_contract && addressQuery.data.token &&
        <AddressAddToWallet token={ addressQuery.data.token } variant="button"/> }
      { !isLoading && !addressQuery.data?.is_contract && config.features.account.isEnabled && (
        <AddressFavoriteButton hash={ hash } watchListId={ addressQuery.data?.watchlist_address_id }/>
      ) }
      <AddressQrCode address={{ hash }} isLoading={ isLoading }/>
      <AccountActionsMenu isLoading={ isLoading }/>
      <NetworkExplorers type="address" pathParam={ hash } ml="auto"/>
    </Flex>
  );

  return (
    <>
      <TextAd mb={ 6 }/>
      <PageTitle
        title={ `${ addressQuery.data?.is_contract ? 'Contract' : 'Address' } details` }
        backLink={ backLink }
        contentAfter={ tags }
        secondRow={ titleSecondRow }
        isLoading={ isLoading }
      />
      <AddressDetails addressQuery={ addressQuery } scrollRef={ tabsScrollRef }/>
      { /* should stay before tabs to scroll up with pagination */ }
      <Box ref={ tabsScrollRef }></Box>
      { (addressQuery.isPlaceholderData || addressCountersQuery.isPlaceholderData) ? <TabsSkeleton tabs={ tabs }/> : content }
    </>
  );
};

export default AddressPageContent;
