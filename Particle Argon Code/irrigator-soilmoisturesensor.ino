#include <cmath>
int moistureSensorPin = A3; // Analog pin connected to the soil moisture sensor

void setup() {

}

int convertToPercentage(double sensorVal, double denominator) {
    int percentage = round((sensorVal / denominator) * 100);
    return sensorVal > denominator ? 100 : percentage;
}

int obtainSoilMoisture(int sensorPin) {
    int rawMoistureVal = analogRead(sensorPin);
    return convertToPercentage(rawMoistureVal, 1023);
}


void loop() {
int soilMoisturePercentage = obtainSoilMoisture(moistureSensorPin);
Particle.publish("Soil Moisture Percentage", String(soilMoisturePercentage));
delay(1000);
}