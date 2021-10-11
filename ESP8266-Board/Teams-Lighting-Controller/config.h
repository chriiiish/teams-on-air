// This is the config file for the Teams-Lighting-Controller.ino program
// This contains all the sensitive configuration
// DO NOT COMMIT YOUR CREDENTIALS INTO THE REPOSITORY
// DO NOT COMMIT THIS FILE (unless you really truly know what you're doing)

// WiFi Settings
char CONFIG_WIFI_SSID[]         = "your-ssid";
char CONFIG_WIFI_PASSWORD[]     = "your-password";

// AWS IOT Settings
char CONFIG_AWS_ENDPOINT[]      = "your-endpoint.iot.eu-west-1.amazonaws.com";
char CONFIG_AWS_KEY[]           = "your-iam-key";
char CONFIG_AWS_SECRET[]        = "your-iam-secret-key";
char CONFIG_AWS_REGION[]        = "eu-west-1";
const char* CONFIG_AWS_TOPIC[]  = "$aws/things/your-device/shadow/update";

// Miscelaneous Settings
int CONFIG_PORT                 = 443;
int CONFIG_LED_DELAY            = 200;
