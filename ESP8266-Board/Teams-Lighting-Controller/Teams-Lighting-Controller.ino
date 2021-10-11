// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define GREEN_LED D2
#define BLUE_LED D3

#include "config.h"

// Possible states for the board
enum BoardStates {
  STATE_CONNECTING_WIFI  = 0,
  STATE_CONNECTING_IOT   = 1,  
  STATE_DISCONNECTED     = 2,    
  STATE_IN_CALL          = 3,          
  STATE_INITIALIZING     = 4,
  STATE_ONLINE_FREE      = 5,
};

// State
int _boardState;

void setup() {
  // Configure LED pins for output
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Show board is DISCONNECTED
  setBoardState(STATE_CONNECTING_WIFI);
}

void loop() {
  // put your main code here, to run repeatedly:
  for (int i = 0; i < 7; i++){
    setBoardState(i);
    delay(1000);
  }
}



/*
 * BUSINESS LOGIC STUFF
 */

// Query if a call is currently displayed
int getBoardState(){
  return _boardState;
}

// Set the leds based on board state
void setBoardState(int state){
  _boardState = state;

  switch (_boardState) {
    case STATE_CONNECTING_WIFI:
      setLeds(1, 0, 1); // BLUE-RED
      break;
    case STATE_CONNECTING_IOT:
      setLeds(0, 1, 1); // BLUE-GREEN
      break;
    case STATE_DISCONNECTED:
      setLeds(0, 0, 1); // BLUE
      break;
    case STATE_IN_CALL:
      setLeds(1, 0, 0); // RED
      break;
    case STATE_INITIALIZING:
      setLeds(1, 1, 1); // ALL
      break;    
    case STATE_ONLINE_FREE:
      setLeds(0, 1, 0); // GREEN
      break;
    default:
      setLeds(0, 0, 0); // ALL
      break;
  }
}



/*
 * BOARD LOGIC DISPLAY STUFF
 */

// Sets the LED pattern (R, G, B)
void setLeds(bool red, bool green, bool blue){
  digitalWrite(RED_LED, red ? 1 : 0);
  digitalWrite(GREEN_LED, green ? 1 : 0);
  digitalWrite(BLUE_LED, blue ? 1 : 0);
}
