/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  };
  return {__esModule: true, default: storage, createAsyncStorage: () => storage};
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {configure: jest.fn(), signIn: jest.fn(), signOut: jest.fn()},
  isCancelledResponse: () => false,
  isErrorWithCode: () => false,
  statusCodes: {},
}));

jest.mock('react-native-config', () => ({__esModule: true, default: {}}));
jest.mock('../src/shared/core/supabase/client', () => ({getSupabaseClient: () => null}));
jest.mock('../src/navigation/RootNavigator', () => ({RootNavigator: () => null}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
