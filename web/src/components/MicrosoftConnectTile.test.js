import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import MicrosoftConnectTile, { UnwrappedMicrosoftConnectTile } from './MicrosoftConnectTile';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
});

jest.mock('./UserInfo', () => () => <div data-testid="UserInfo"></div>);

describe('Given the user is not authenticated', () => {
  describe('When the user loads the page', () => {
            it('Then there should be a button to connect to M365', () =>{
              act(() => {
                render(<MicrosoftConnectTile />, container);
              });
              const loginButton = screen.getByText('Connect to Microsoft365');
              expect(loginButton).toBeInTheDocument();
              expect(loginButton.type).toBe('submit');
            });

            it('Then there should not be a logout button displayed', () => {
              act(() => {
                render(<MicrosoftConnectTile />, container);
              });
              
              const logoutButtons = screen.queryAllByRole('button', { name: /logout/i });
              expect(logoutButtons.length).toBe(0);
            });

            it('Then the user information should not be displayed', () => {
              act(() => {
                render(<MicrosoftConnectTile />, container);
              });

              const userInfos= screen.queryAllByTestId('UserInfo');
              expect(userInfos.length).toBe(0);
            });
  });
  describe('When the user clicks the button to login', () => {
          it('Then the login method should be called', () => {
            const loginCallback = jest.fn(() => {});
            const msalContextMock = {
              instance: {
                loginRedirect: loginCallback
              },
              accounts: []
            };

            act(() => {
              render(<UnwrappedMicrosoftConnectTile msalContext={msalContextMock}/>, container);
            });

            const loginButton = screen.getByText('Connect to Microsoft365');
            act(() => {
              fireEvent.click(loginButton);
            });

            expect(msalContextMock.instance.loginRedirect).toBeCalledTimes(1);
          });
  });
});

describe('Given the user is authenticated', () => {
  const loginCallback = jest.fn();
  const msalContextMock = {
    instance: {
      loginRedirect: loginCallback
    },
    accounts: [{
      environment: "login.windows.net",
      homeAccountId: "b1b6afc7-75f6-4656-b973-007d76db6f42.28a22b9e-dc1c-4026-85a0-1e0b429236db",
      localAccountId: "b1b6afc7-75f6-4656-b973-007d76db6f42",
      name: "Test User",
      tenantId: "28a22b9e-dc1c-4026-85a0-1e0b429236db",
      username: "test@test.com"
    }]
  };
  describe('When the user views the page', () => {

          it('Then the connect button should be hidden', () => {
            act(() => {
              render(<UnwrappedMicrosoftConnectTile msalContext={msalContextMock}/>, container);
            });
            
            const connectButtons = screen.queryAllByText('Connect to Microsoft365');
            expect(connectButtons.length).toBe(0);
          });

          it('Then the user information should be displayed', () => {
            act(() => {
              render(<UnwrappedMicrosoftConnectTile msalContext={msalContextMock}/>, container);
            });
            const userInfoComponent = screen.getByTestId('UserInfo');
            expect(userInfoComponent).toBeInTheDocument();
          });

          it('Then the logout button should be displayed', () => {
            act(() => {
              render(<UnwrappedMicrosoftConnectTile msalContext={msalContextMock}/>, container);
            });
            const logoutButton = screen.getByRole('button', { name: /logout/i });
            expect(logoutButton).toBeInTheDocument();
          })
  });
});