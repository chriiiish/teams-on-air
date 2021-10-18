import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import OnAirLightTile from './OnAirLightTile';

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
            it('Then the On-Air tile should tell the user to login first', () =>{
              act(() => {
                render(<OnAirLightTile />, container);
              });
              const loginFirstMessage = screen.getByText(/connect to microsoft365 before connecting the on-air light/i);
              expect(loginFirstMessage).toBeInTheDocument();
            });
            it('Then the On-Air tile should have nothing but the login message', () => {
              act(() => {
                render(<OnAirLightTile />, container);
              });
              const items = screen.queryAllByText(/.+/i);
              expect(items).toHaveLength(1);
            });
  });
});

describe('Given the user is authenticated', () => {
  describe('When the user views the page', () => {
          it('Then the connect message should not be shown', () => {
            act(() => {
              render(<OnAirLightTile authenticatedWithMicrosoft={true}/>, container);
            });
            const loginFirstMessage = screen.queryAllByText(/connect to microsoft365 before connecting the on-air light/i);
            expect(loginFirstMessage).toHaveLength(0);
          });
          it('Then there should be a space to enter an IP address', () =>{
            act(() => {
              render(<OnAirLightTile authenticatedWithMicrosoft={true}/>, container);
            });
            const label = screen.getByText(/enter ip address of the on-air light/i);
            expect(label).toBeInTheDocument();
            
            const inputBox = screen.getByRole('textbox', { name: 'Enter IP address of the On-Air light'});
            expect(inputBox).toBeInTheDocument();

            const submitButton = screen.getByText(/test connection/i);
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toContainHTML("button");
          });
          it('Then if there was an IP address entered before it should be shown', () => {
            // TODO
          });
  });
  describe('When the user tests the connection', () => {
          it('Then the board state should be checked', () => {
            //TODO
          });
  });
  describe('When the user tests the connection and it works', () => {
          it('Then the test connection button should be replaced by disconnect', () => {
            //TODO
          });
          it('Then the ip address should be replaced by read-only', () => {
            //TODO
          });
  });
});

describe('Given the user is authenticated and connected to the board', () => {
  describe('When the user clicks the diconnect button', () => {
          it('Then the leds should turn white', () => {
            //TODO
          });
          it('Then the ip address box should be editable', () => {
            //TODO
          });
          it('Then the disconnect button should change to a test-connection button', () => {

          });
  });
});