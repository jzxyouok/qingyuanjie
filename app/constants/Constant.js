/**
 *
 * @author keyy/1501718947@qq.com 16/11/8 17:08
 * @description
 */
export const URL_DEV = 'http://nrb-stage.azurewebsites.net/mobile';

export const URL_TOKEN_DEV = 'http://nrb-stage.azurewebsites.net/mobile/signalr/hubs';

export const URL_WS_DEV = 'ws://nrb-stage.azurewebsites.net/mobile/signalr/hubs';

export const TIME_OUT = 10000;

export const LOCATION_TIME_OUT = 10000;

export const LOCATION_TIME_OUT_SHORT = 3000;

export const DEBUG_SETTINGS = {
  useFixtures: false,
  ezLogin: false,
  yellowBox: __DEV__,
  reduxLogging: true,
  includeExamples: __DEV__
};