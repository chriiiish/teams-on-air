// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define GREEN_LED D2
#define BLUE_LED D3

#include "config.h"
#include "WifiHelpers.h"
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

ESP8266WebServer server(80);
int ledValues[3] = {0, 0, 0};

void setup() {
  // Configure LED pins for output
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  Serial.begin(9600);
  
  pulseLeds(false, false, true);
  connectWiFi(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);

  // API Server
  restServerRouting();
  Serial.printf("Starting Webserver...");
  server.begin();
  pulseLeds(false, true, true);
}

void loop() {
//  pulseLeds(true, false, false);
//  pulseLeds(false, true, false);
  server.handleClient();

}


/*
 * WEBSERVER
 */
void setLedsWeb() {
  int red = server.arg("red").toInt();
  int green = server.arg("green").toInt();
  int blue = server.arg("blue").toInt();
  setLeds(red, green, blue);

  char responseJson[200];
  sprintf(responseJson, "{\"red\": %d, \"green\": %d, \"blue\": %d}", red, green, blue);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", responseJson);
}
 
void restServerRouting() {
  server.on("/", HTTP_GET, []() {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, F("text/html"),
          F("Teams On-Air Light API"));
  });
  server.on(F("/leds"), HTTP_POST, setLedsWeb);
  server.on(F("/alive"), HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, F("application/json"), F("{\"status\":\"online\"}"));
  });
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

// Connect to Wifi
void connectWiFi(char *ssid, char *password)
{
    Serial.printf("Attempting to connect to SSID: %s.\r\n", ssid);

    // Connect to WPA/WPA2 network
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        // Get Mac Address and show it.
        // WiFi.macAddress(mac) save the mac address into a six length array, but the endian may be different. The huzzah board should
        // start from mac[0] to mac[5], but some other kinds of board run in the oppsite direction.
        uint8_t mac[6];
        WiFi.macAddress(mac);
        Serial.printf("You device (%02x:%02x:%02x:%02x:%02x:%02x) failed to connect to %s (%s). Waiting ~5 seconds to retry.\r\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], ssid, wl_status_to_string(WiFi.status()));
        WiFi.begin(ssid, password);

        // This should wait for approximately 5 seconds ish
        for(int i = 0; i < 5; i++){
          pulseLeds(false, false, true);
        }
    }
    Serial.printf("Connected to wifi %s.\r\n", ssid);
}
