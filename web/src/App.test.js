import { MsalProvider } from '@azure/msal-react';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

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

jest.mock('./components/MicrosoftConnectTile', () => () => <div data-testid="MicrosoftConnectTile"></div>);
jest.mock('@azure/msal-react', () => ({
  ...jest.requireActual('@azure/msal-react'),
  MsalProvider: (props) => <div data-testid="MsalProvider">{props.children}</div>,
}));
jest.mock('@azure/msal-browser', () => ({
  ...jest.requireActual('@azure/msal-browser'),
  PublicClientApplication: jest.fn(() => 321),
}));

describe('Given this is the users first time', () => {
  describe('When the user views the page', () => {
            it('Then the connect tile should be displayed', () => {
              act(() => {
                render(<App />, container);
              });
              expect(screen.getByTestId(/MicrosoftConnectTile/)).toBeInTheDocument();
            });

            
            it('Then it should say that Chris made it', () => {
              act(() => {
                render(<App />, container);
              });
              expect(screen.queryAllByText(/Made by Chris/)).toHaveLength(1);
            });
  });
});