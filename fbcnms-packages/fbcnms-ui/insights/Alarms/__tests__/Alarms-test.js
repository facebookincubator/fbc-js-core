/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import 'jest-dom/extend-expect';
import * as React from 'react';
import Alarms from '../Alarms';
import MuiStylesThemeProvider from '@material-ui/styles/ThemeProvider';
import defaultTheme from '@fbcnms/ui/theme/default';
import {MemoryRouter} from 'react-router-dom';
import {MuiThemeProvider} from '@material-ui/core/styles';
import {Route} from 'react-router-dom';
import {SnackbarProvider} from 'notistack';
import {cleanup, render} from '@testing-library/react';

jest.mock('@fbcnms/alarms/hooks/useSnackbar');
const useSnackbar = require('@fbcnms/alarms/hooks/useSnackbar');
const useMagmaAPIMock = jest
  .spyOn(require('@fbcnms/ui/magma/useMagmaAPI'), 'default')
  .mockReturnValue({response: []});

const Wrapper = (props: {route: string, children: React.Node}) => (
  <MemoryRouter initialEntries={[props.route || '/alarms']} initialIndex={0}>
    <MuiThemeProvider theme={defaultTheme}>
      <MuiStylesThemeProvider theme={defaultTheme}>
        <SnackbarProvider>{props.children}</SnackbarProvider>
      </MuiStylesThemeProvider>
    </MuiThemeProvider>
  </MemoryRouter>
);

afterEach(() => {
  cleanup();
  useMagmaAPIMock.mockClear();
});

describe('react router tests', () => {
  test('/alerts renders the no alerts icon', () => {
    const {getByTestId} = render(
      <Wrapper route={'/alarms'}>
        <Route path="/alarms" component={Alarms} />,
      </Wrapper>,
    );

    // assert that the 'no alerts' icon is visible
    expect(getByTestId('no-alerts-icon')).toBeInTheDocument();
  });
});

describe('Firing Alerts', () => {
  test('renders currently firing alerts if api returns alerts', () => {
    useMagmaAPIMock.mockReturnValue({
      response: [
        {
          labels: {alertname: '<<TEST ALERT>>', team: '<<TEST TEAM>>'},
          annotations: {description: '<<TEST DESCRIPTION>>'},
        },
      ],
    });

    const {getByTestId, getByText} = render(
      <Wrapper route={'/alerts'}>
        <Alarms />
      </Wrapper>,
    );

    // assert that the top level firing alerts header is visible
    expect(getByTestId('firing-alerts')).toBeInTheDocument();
    expect(getByText('<<TEST ALERT>>')).toBeInTheDocument();
    // TODO(andreilee): This has been removed
    // expect(getByText('<<TEST DESCRIPTION>>')).toBeInTheDocument();
  });

  test('if an error occurs while loading alerts, enqueues an error snackbar', () => {
    useMagmaAPIMock.mockReturnValueOnce({
      error: {message: 'an error occurred'},
    });

    const snackbarsMock = {error: jest.fn(), success: jest.fn()};
    jest
      .spyOn(useSnackbar, 'useSnackbars')
      .mockImplementation(jest.fn(() => snackbarsMock));

    render(
      <Wrapper route={'/alerts'}>
        <Alarms />
      </Wrapper>,
    );

    expect(snackbarsMock.error).toHaveBeenCalled();
  });
});
