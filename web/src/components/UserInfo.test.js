import { act, render, screen } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-17-lirsoft';
import UserInfo, { UnwrappedUserInfo } from './UserInfo';

configure({ adapter: new Adapter() });

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Given a user', () => {
  const validUser = {
    name: 'Jim Floyd',
    username: 'jim@floyds.com',
    localAccountId: '2f4dea8a-369d-43cc-95dd-ebc73b2fed3b'
  };
  describe('When the user sees the screen', () => {
          it('Then the users name should be displayed', () =>{
            act(() => {
              render(<UserInfo user={validUser}/>, container);
            });
            expect(screen.getByText(validUser.name)).toBeInTheDocument();
          });


          it('Then the users ID should be displayed', () =>{
            act(() => {
              render(<UserInfo user={validUser}/>, container);
            });
            expect(screen.getByText(validUser.localAccountId)).toBeInTheDocument();
          });


          it('Then the users username should be displayed', () => {
            act(() => {
              render(<UserInfo user={validUser}/>, container);
            });
            expect(screen.getByText(validUser.username)).toBeInTheDocument();
          });
  });
  describe('When the user has no status', () => {
          it('Then the user should be told we are checking for their current status', () => {
            act(() => {
              render(<UserInfo user={validUser}/>, container);
            });
            expect(screen.queryAllByText(/checking.../i)).toHaveLength(2); // For Status, Activity
          });
  });
  describe('When the user has a status', () => {
          const validPresenceResponse = {
            id: '2f4dea8a-369d-43cc-95dd-ebc73b2fed3b',
            availability: 'Busy',
            activity: 'InACall',
            outOfOfficeSettings: {
              message: null,
              isOutOfOffice: false
            }
          };
          // I would rather do this by calling the method and then looking for the text in 
          //   the rendered output, but NOOOOOO apparently we can't do that. Grumble grumble
          //   grumble...
          it('Then the status is displayed', () => {
            let wrapper = shallow(<UnwrappedUserInfo user={validUser}/>);
            const instance = wrapper.instance();

            instance.setPresenceInformation(validPresenceResponse);

            expect(wrapper.state('currentActivity')).toBe(validPresenceResponse.activity);
            expect(wrapper.state('currentAvailability')).toBe(validPresenceResponse.availability);
          });
  });
});