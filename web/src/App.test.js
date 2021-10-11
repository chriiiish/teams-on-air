import { act, fireEvent, render, screen } from '@testing-library/react';
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

jest.mock('./components/WelcomeTile', () => () => <div data-testid="WelcomeTile"></div>);

describe('Given the page has loaded', () => {
  describe('When the user wants to view the page', () => {
            it('Then the welcome tile should be displayed', () => {
              act(() => {
                render(<App />, container);
              });
              expect(screen.getByTestId(/WelcomeTile/)).toBeInTheDocument();
            });

            it('Then it should say that Chris made it', () => {
              act(() => {
                render(<App />, container);
              });
              expect(screen.queryAllByText(/Made by Chris/)).toHaveLength(1);
            });
  });
});