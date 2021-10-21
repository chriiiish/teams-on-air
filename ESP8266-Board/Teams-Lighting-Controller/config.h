// This is the config file for the Teams-Lighting-Controller.ino program
// This contains all the sensitive configuration
// DO NOT COMMIT YOUR CREDENTIALS INTO THE REPOSITORY
// DO NOT COMMIT THIS FILE (unless you really truly know what you're doing)

// WiFi Settings
char CONFIG_WIFI_SSID[]         = "wifi-ssid";
char CONFIG_WIFI_PASSWORD[]     = "wifi-password";

// AWS IOT Settings
char CONFIG_AWS_ENDPOINT[]      = "xxxxxxxx-ats.iot.us-east-1.amazonaws.com";
char CONFIG_AWS_REGION[]        = "us-east-1";
const char* CONFIG_DEVICE_NAME  = "OnAir001";

// CERTIFICATES
static const char CONFIG_PEM_CRT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
)EOF";
static const char CONFIG_PEM_KEY[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----
)EOF";
static const char CONFIG_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
-----END CERTIFICATE-----
)EOF";
