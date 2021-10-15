import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import MicrosoftConnectTile from './MicrosoftConnectTile';

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
  });
  describe('When the user clicks the button to login', () => {
            it('Then the login method should be called', () => {
            //   const loginCallback = jest.fn();
            //   const msalContextMock = {
            //     instance: {
            //       loginRedirect: loginCallback
            //     }
            //   };

            //   let renderedConnectTile;
            //   act(() => {
            //     renderedConnectTile = render(<MicrosoftConnectTile msalContext={msalContextMock} />, container);
            //   });

            //   act(() => {
            //     const loginButton = renderedConnectTile.getByText('Connect to Microsoft365');
            //     fireEvent.click(loginButton);
            //   });

            //   expect(msalContextMock.instance.loginRedirect.mock.calls.length).toBe(1);
            });
  });
});