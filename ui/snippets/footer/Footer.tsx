import { Box, Grid, Flex, Text, Link, VStack } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import docsIcon from 'icons/docs.svg';
import globeIcon from 'icons/globe.svg';
import discordIcon from 'icons/social/discord_filled.svg';
import telegramIcon from 'icons/social/telegram_filled.svg';
import twitterIcon from 'icons/social/twitter_filled.svg';
import tokenIcon from 'icons/token.svg';
import useApiQuery from 'lib/api/useApiQuery';
import NetworkAddToWallet from 'ui/shared/NetworkAddToWallet';

import ColorModeToggler from '../header/ColorModeToggler';
import FooterLinkItem from './FooterLinkItem';
import IntTxsIndexingStatus from './IntTxsIndexingStatus';
import getApiVersionUrl from './utils/getApiVersionUrl';

const FRONT_VERSION_URL = `https://github.com/HorizenLabs/blockscout-frontend/tree/${ config.UI.footer.frontendVersion }`;
const FRONT_COMMIT_URL = `https://github.com/HorizenLabs/blockscout-frontend/commit/${ config.UI.footer.frontendCommit }`;

const Footer = () => {

  const { data: backendVersionData } = useApiQuery('config_backend_version', {
    queryOptions: {
      staleTime: Infinity,
    },
  });
  const apiVersionUrl = getApiVersionUrl(backendVersionData?.backend_version);

  const BLOCKSCOUT_LINKS = [
    {
      icon: globeIcon,
      iconSize: '24px',
      text: 'Horizen EON',
      url: 'https://eon.horizen.io',
    },
    {
      icon: docsIcon,
      iconSize: '20px',
      text: 'EON Documentation',
      url: 'https://docs.horizen.io',
    },
    {
      icon: tokenIcon,
      iconSize: '18px',
      text: 'Testnet ZEN Faucet',
      url: 'https://faucet.horizen.io',
    },
    {
      icon: twitterIcon,
      iconSize: '18px',
      text: 'X',
      url: 'https://www.twitter.com/horizenglobal',
    },
    {
      icon: discordIcon,
      iconSize: '18px',
      text: 'Discord',
      url: 'https://horizen.io/invite/discord',
    },
    {
      icon: telegramIcon,
      iconSize: '18px',
      text: 'Telegram',
      url: 'https://t.me/horizencommunity',
    },
  ];

  const frontendLink = (() => {
    if (config.UI.footer.frontendVersion) {
      return <Link href={ FRONT_VERSION_URL } target="_blank">{ config.UI.footer.frontendVersion }</Link>;
    }

    if (config.UI.footer.frontendCommit) {
      return <Link href={ FRONT_COMMIT_URL } target="_blank">{ config.UI.footer.frontendCommit }</Link>;
    }

    return null;
  })();

  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      px={{ base: 4, lg: 12 }}
      py={{ base: 4, lg: 9 }}
      borderTop="1px solid"
      borderColor="divider"
      as="footer"
      columnGap={{ lg: '32px', xl: '100px' }}
    >
      <Box flexGrow="1" mb={{ base: 8, lg: 0 }} minW="195px">
        <Flex flexWrap="wrap" columnGap={ 8 } rowGap={ 6 }>
          <ColorModeToggler/>
          { !config.UI.indexingAlert.intTxs.isHidden && <IntTxsIndexingStatus/> }
          <NetworkAddToWallet/>
        </Flex>
        <Box mt={{ base: 5, lg: '44px' }}>
          <Link fontSize="xs" href="https://www.blockscout.com">blockscout.com</Link>
        </Box>
        <Text mt={ 3 } maxW={{ base: 'unset', lg: '470px' }} fontSize="xs">
            Blockscout is a tool for inspecting and analyzing EVM based blockchains. Blockchain explorer for Ethereum Networks.
        </Text>
        <VStack spacing={ 1 } mt={ 6 } alignItems="start">
          { apiVersionUrl && (
            <Text fontSize="xs">
                Backend: <Link href={ apiVersionUrl } target="_blank">{ backendVersionData?.backend_version }</Link>
            </Text>
          ) }
          { frontendLink && (
            <Text fontSize="xs">
              Frontend: { frontendLink }
            </Text>
          ) }
        </VStack>
      </Box>
      <Grid
        gap={{ base: 6, lg: 8, xl: 12 }}
        gridTemplateColumns="auto"
      >
        <Box>
          <Grid
            columnGap={ 9 }
            rowGap={ 1 }
            gridTemplateColumns={
              {
                base: 'repeat(2, 160px)',
                lg: 'repeat(2, 160px)',
                xl: 'repeat(2, 160px)',
              }
            }
            gridTemplateRows={{
              base: 'repeat(3, auto)',
              lg: 'repeat(3, auto)',
              xl: 'repeat(3, auto)',
            }}
            gridAutoFlow={{ base: 'column', lg: 'column' }}
            mt={{ base: 0, lg: '100px' }}
          >
            { BLOCKSCOUT_LINKS.map(link => <FooterLinkItem { ...link } key={ link.text }/>) }
          </Grid>
        </Box>
      </Grid>
    </Flex>
  );
};

export default Footer;
