// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define GREEN_LED D2
#define BLUE_LED D3

#include "config.h"
#include "WifiHelpers.h"
#include <PubSubClient.h>
#include <ESP8266mDNS.h>

int ledValues[3] = {0, 0, 0};
unsigned long lastPublish;
int msgCount;


// AWS IOT Config
BearSSL::X509List client_crt(CONFIG_PEM_CRT);
BearSSL::PrivateKey client_key(CONFIG_PEM_KEY);
BearSSL::X509List rootCert(CONFIG_CERT_CA);

WiFiClientSecure wiFiClient;
void msgReceived(char* topic, byte* payload, unsigned int len);
PubSubClient pubSubClient(CONFIG_AWS_ENDPOINT, 8883, msgReceived, wiFiClient); 

void setup() {
  // Configure LED pins for output
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  Serial.begin(9600);

  // Connect to WiFi
  pulseLeds(false, false, true);
  connectWiFi(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);

  // get current time, otherwise certificates are flagged as expired
  setCurrentTime();

  // Connect to AWS IOT
  wiFiClient.setClientRSACert(&client_crt, &client_key);
  wiFiClient.setTrustAnchors(&rootCert);

  // API Server
  pulseLeds(false, true, true);
}

void loop() {
  pubSubCheckConnect();
}


/*
 * IOT PUB/SUB
 */
void msgReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on "); Serial.print(topic); Serial.print(": ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void pubSubCheckConnect() {
  if ( ! pubSubClient.connected()) {
    Serial.print("PubSubClient connecting to: "); Serial.print(CONFIG_AWS_ENDPOINT);
    while ( ! pubSubClient.connected()) {
      Serial.print(".");
      pubSubClient.connect("Julie");
    }
    Serial.println(" connected");

    // Subscribe to topics
    pubSubClient.subscribe("/shadow/name/main/get/accepted");
    Serial.println("Subscribed to topic $aws/things/Julie/shadow/name/main/get/accepted");
    pubSubClient.subscribe("$aws/things/Julie/shadow/name/main/update/accepted");
    Serial.println("Subscribed to topic $aws/things/Julie/shadow/name/main/update/accepted");

    pulseLeds(true, true, true);

    // Get shadow state from AWS IOT
    pubSubClient.publish("$aws/things/Julie/shadow/name/main/get", "");
    Serial.print("Requested Shadow State from AWS...");    
  }
  pubSubClient.loop();
}

void setCurrentTime() {
  configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: "); Serial.print(asctime(&timeinfo));
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
        Serial.printf("Device (%02x:%02x:%02x:%02x:%02x:%02x) failed to connect to %s (%s). Waiting ~5 seconds to retry.\r\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], ssid, wl_status_to_string(WiFi.status()));
        WiFi.begin(ssid, password);

        // This should wait for approximately 5 seconds ish
        for(int i = 0; i < 5; i++){
          pulseLeds(false, false, true);
        }
    }
    Serial.printf("Connected to wifi %s (%s).\r\n", ssid, WiFi.localIP().toString().c_str());
}
