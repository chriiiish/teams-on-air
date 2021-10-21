// Board configuration - Which LEDS are in which ports
#define RED_LED D1
#define GREEN_LED D2
#define BLUE_LED D3

#include "config.h"
#include "WifiHelpers.h"
#include <PubSubClient.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>

int ledValues[3] = {0, 0, 0};
boolean firstSendDone = false;
StaticJsonBuffer<1000> jsonBuffer;

// AWS IOT Config
BearSSL::X509List client_crt(CONFIG_PEM_CRT);
BearSSL::PrivateKey client_key(CONFIG_PEM_KEY);
BearSSL::X509List rootCert(CONFIG_CERT_CA);
WiFiClientSecure wiFiClient;
void msgReceived(char* topic, byte* payload, unsigned int len);
PubSubClient pubSubClient(CONFIG_AWS_ENDPOINT, 8883, msgReceived, wiFiClient); 

// AWS IoT Topics
char TOPIC_PUB_GET[80];
char TOPIC_SUB_GET_ACCEPTED[80];
char TOPIC_SUB_UPDATE_ACCEPTED[80];

void setup() {
  // Configure LED pins for output
  pinMode(RED_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  Serial.begin(115200);

  // Pub/Sub Topics
  snprintf(TOPIC_PUB_GET,             sizeof(TOPIC_PUB_GET),             "%s%s%s", "$aws/things/", CONFIG_DEVICE_NAME, "/shadow/get");
  snprintf(TOPIC_SUB_GET_ACCEPTED,    sizeof(TOPIC_SUB_GET_ACCEPTED),    "%s%s%s", "$aws/things/", CONFIG_DEVICE_NAME, "/shadow/get/accepted");
  snprintf(TOPIC_SUB_UPDATE_ACCEPTED, sizeof(TOPIC_SUB_UPDATE_ACCEPTED), "%s%s%s", "$aws/things/", CONFIG_DEVICE_NAME, "/shadow/update/accepted");

  // Connect to WiFi
  pulseLeds(false, false, true);
  connectWiFi(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);

  // get current time, otherwise certificates are flagged as expired
  setCurrentTime();

  // Connect to AWS IOT
  wiFiClient.setClientRSACert(&client_crt, &client_key);
  wiFiClient.setTrustAnchors(&rootCert);

  // PubSubClient buffer
  pubSubClient.setBufferSize(512);
  pulseLeds(false, true, true);
}

void loop() {
  pubSubCheckConnect();

  // Get shadow state from AWS IOT
  if (!firstSendDone){
      boolean result = pubSubClient.publish(TOPIC_PUB_GET, "");
      Serial.print("Requested Shadow State from AWS...");   
      Serial.println(result ? "SUCCESS" : "FAILURE"); 
      firstSendDone = true;
  }
}


/*
 * IOT PUB/SUB
 */


// Runs on status update (message received on topic)
void msgReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on "); Serial.print(topic); Serial.print(": ");
  char message[1000] = "";
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    message[i] = (char)payload[i];
  }
  Serial.println();

  Serial.println(message);
  JsonObject& awsIotPayload = jsonBuffer.parseObject(message);
  int red = awsIotPayload["state"]["desired"]["red"].as<int>();
  int green = awsIotPayload["state"]["desired"]["green"].as<int>();
  int blue = awsIotPayload["state"]["desired"]["blue"].as<int>();
  
  Serial.print("Received State: (");
  Serial.print(red);
  Serial.print(",");
  Serial.print(green);
  Serial.print(",");
  Serial.print(blue);
  Serial.println(")");

  setLeds(red, green, blue);
  jsonBuffer.clear();
}

// Subscribes to the IoT topics for this device shadow / status
void pubSubCheckConnect() {
  if ( ! pubSubClient.connected()) {
    Serial.print("PubSubClient connecting to: "); Serial.print(CONFIG_AWS_ENDPOINT);
    while ( ! pubSubClient.connected()) {
      Serial.print(".");
      pubSubClient.connect(CONFIG_DEVICE_NAME);
    }
    Serial.println(" connected");

    // Subscribe to topics
    boolean result = pubSubClient.subscribe(TOPIC_SUB_GET_ACCEPTED);
    Serial.printf("Subscribed to topic %s ", TOPIC_SUB_GET_ACCEPTED);
    Serial.println(result ? "SUCCESS" : "FAILURE");
    result = pubSubClient.subscribe(TOPIC_SUB_UPDATE_ACCEPTED);
    Serial.printf("Subscribed to topic %s ", TOPIC_SUB_UPDATE_ACCEPTED);
    Serial.println(result ? "SUCCESS" : "FAILURE");

    pulseLeds(true, true, true);
  }
  pubSubClient.loop();
}

// Sets the current time from ntp
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
