// This #include statement was automatically added by the Particle IDE.
#include <ThingSpeak.h>
const int MOISTURE_SENSOR_PIN = A3;

//These are the API details for the thingspeak API/DB which contains 
const char * MOISTURE_DATA_API_KEY = "5D37CNFKWTR7LUT2";
const int MOISTURE_DATA_CHANNEL_NUMBER = 2156859;


//These are the API Keys for the thingspeak API/DB which contains user settings, via the user settings website e.g. max/min acceptable soil moisture, user email for alerts
const unsigned long USER_SETTINGS_API_NUMBER = 2159771;
const char* USER_SETTINGS_API_KEY = "BJXL1CNIOQBB00XG";


const int SENSOR_READING_INTERVAL = 60000;//Interval between sensor readings in milliseconds, so every 1 minute :) sensor details will be pushed to the thingspeak api 
int UPDATE_USER_SETTING_INTERVAL = 5; //Interval between user settings updates in minutes, every 5 minutes - help avoid excessive amount of thing-speak API calls
int updateUserSettingsCounter = 0; //countdown for update of user settings
String setUserEmail;
int setMaxSoilMoisturePercentage;
int setMinSoilMoisturePercentage;


int sendNotificationEmailCounter = 0;
int SEND_NOTIFICATION_EMAIL_INTERVAL = 360; //Minimum Interval (in minutes) between low soil moisture notification emails, to avoid spamming the user - 360 is 1 email every 6 hours :), also avoids excessive API calls



TCPClient client;
void setup() {
    ThingSpeak.begin(client);
}

//A generic function Convert returned  reading to Percentage
int convertToPercentage(double sensorVal, double denominator) {
    int percentage = round((sensorVal / denominator) * 100);
    return sensorVal > denominator ? 100 : percentage;
}

// A function to obtain soil moisture from sensor and convert - return a percentage
int obtainSoilMoisture() {
    int rawMoistureVal = analogRead(MOISTURE_SENSOR_PIN);
    return convertToPercentage(rawMoistureVal, 1023);
}

void sendEmail(int currentMoisture, int minMoistureSetting, int maxMoistureSetting) {
    
        if (sendNotificationEmailCounter == 0) {
            const char * email = setUserEmail.c_str();
            int currentSoilMoisture = currentMoisture;
            int minimumSoilMoisture = minMoistureSetting;
            int maximumSoilMoisture = maxMoistureSetting;
            Particle.publish("sendEmailNotif", String::format("{\"currentSoilMoisture\":%d,\"minimumSoilMoisture\":%d,\"maximumSoilMoisture\":%d,\"email\":\"%s\"}", currentSoilMoisture, minimumSoilMoisture, maximumSoilMoisture, email));
            sendNotificationEmailCounter = SEND_NOTIFICATION_EMAIL_INTERVAL;
        }
       
        //To set the counter each loop and time the moisture sensor 
        sendNotificationEmailCounter -= sendNotificationEmailCounter == 0 ? 0 : 1;
}

void executeSensorRead() {
  int soilMoisturePercentage = obtainSoilMoisture(); // Replace with the actual value
  int maxSoilMoisturePercentage = setMaxSoilMoisturePercentage;
  int minSoilMoisturePercentage = setMinSoilMoisturePercentage;
  
  // Will always request irrigation whenever soil moisture below optimal level, up to Arduino to water/ determine timing
  bool irrigationRequested = soilMoisturePercentage <= minSoilMoisturePercentage; 
    
  ThingSpeak.setField(1,soilMoisturePercentage);
  ThingSpeak.setField(2,maxSoilMoisturePercentage);
  ThingSpeak.setField(3,minSoilMoisturePercentage);
  ThingSpeak.setField(4,irrigationRequested);
  
  
  ThingSpeak.writeFields(MOISTURE_DATA_CHANNEL_NUMBER, MOISTURE_DATA_API_KEY);
  
  sendEmail(soilMoisturePercentage, minSoilMoisturePercentage, maxSoilMoisturePercentage);
}


//This will update user settings when counter is 0, it will also reset the counter when it is 0, as this would symbolise the end of the interval between user updates
void updateUserSettings() {
    if(updateUserSettingsCounter == 0) {
        setUserEmail = ThingSpeak.readStringField(USER_SETTINGS_API_NUMBER, 1, USER_SETTINGS_API_KEY);
        setMaxSoilMoisturePercentage = ThingSpeak.readIntField(USER_SETTINGS_API_NUMBER, 2, USER_SETTINGS_API_KEY);
        setMinSoilMoisturePercentage = ThingSpeak.readIntField(USER_SETTINGS_API_NUMBER, 3, USER_SETTINGS_API_KEY);
        SEND_NOTIFICATION_EMAIL_INTERVAL = ThingSpeak.readIntField(USER_SETTINGS_API_NUMBER, 4, USER_SETTINGS_API_KEY);
        
        updateUserSettingsCounter = UPDATE_USER_SETTING_INTERVAL + 1;
    }
    else {
        updateUserSettingsCounter -= 1;
    }

}

void loop() {
    updateUserSettings();
    executeSensorRead();
    delay(60000);
}