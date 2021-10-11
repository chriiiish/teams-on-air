import { act, render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import WelcomeTile from './WelcomeTile';

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

describe('Given the page has loaded', () => {
  describe('When the user sees the screen', () => {
            it('Then there an image on the screen', () =>{
              act(() => {
                render(<WelcomeTile />, container);
              });
              expect(screen.getByAltText('Pear')).toBeInTheDocument();
            });


            it('Then there should be a welcome message', () =>{
              act(() => {
                render(<WelcomeTile />, container);
              });
              expect(screen.getByText('New Project!')).toBeInTheDocument();
            });


            it('Then there should be a description', () => {
              act(() => {
                render(<WelcomeTile />, container);
              });
              expect(screen.getByText('Click the pear to rotate 😝')).toBeInTheDocument();
            });


            it('Then the image should have no rotation', () => {
              act(() => {
                render(<WelcomeTile />, container);
              });
        
              const image = screen.getByAltText('Pear');
              const imageOriginalStyle = window.getComputedStyle(image);

              expect(imageOriginalStyle.transform).toBe('rotate(0deg)');
            });

  });

  describe('When the user clicks the image', () => {
    it('Then the image should rotate', () => {
      act(() => {
        render(<WelcomeTile />, container);
      });

      const image = screen.getByAltText('Pear');
      const imageOriginalStyle = window.getComputedStyle(image);

      act(() => {
        image.click();
      });

      const imageNewStyle = window.getComputedStyle(image);

      expect(imageOriginalStyle.transform).not.toBe(imageNewStyle.transform); // It's changed
      expect(imageNewStyle.transform).toBe('rotate(-90deg)'); // Rotated 90 degrees when clicked
    });
  });
});