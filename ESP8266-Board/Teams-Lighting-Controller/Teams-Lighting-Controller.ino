// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define GREEN_LED D2
#define BLUE_LED D3

#include "config.h"

void setup() {
  // Configure LED pins for output
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
}

void loop() {
//  pulseLeds(true, false, false);
//  pulseLeds(false, true, false);
  pulseLeds(false, false, true);
}


/*
 * BOARD LOGIC DISPLAY STUFF
 */
// Pulse and LED
// Blocks This takes 510ms
void pulseLeds(bool red, bool green, bool blue) {
  // Fade Up
  for (int i = 0; i < 255; i++){
    setLeds(red ? i : 0, green ? i : 0, blue ? i : 0);
    delay(1);
  }
  // Fade Down
  for (int i = 255; i >= 0; i--){
    setLeds(red ? i : 0, green ? i : 0, blue ? i : 0);
    delay(1);
  }
}

// Sets the LED pattern (R, G, B) (255, 255, 255)
void setLeds(int red, int green, int blue) {
  analogWrite(RED_LED, red);
  analogWrite(GREEN_LED, green);
  analogWrite(BLUE_LED, blue);
}
