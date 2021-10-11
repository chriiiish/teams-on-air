// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define BLUE_LED D2
#define GREEN_LED D3

#include "config.h"

void setup() {
  // put your setup code here, to run once:
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(RED_LED, HIGH);
  digitalWrite(BLUE_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
  delay(CONFIG_LED_DELAY);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BLUE_LED, HIGH);
  digitalWrite(GREEN_LED, LOW);
  delay(CONFIG_LED_DELAY);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BLUE_LED, LOW);
  digitalWrite(GREEN_LED, HIGH);
  delay(CONFIG_LED_DELAY);
}
