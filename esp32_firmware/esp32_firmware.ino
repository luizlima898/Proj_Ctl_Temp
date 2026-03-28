#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
const char* ssid = "Luiz Fernando 2.4Ghz"; //Nome do WiFi
const char* password = "971942255"; //Senha do WiFi
//Define conexao com sensor dht22
#define DHTPIN 4

#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

const char* serverName = "https://proj-ctl-temp-3.onrender.com/dados" // 
void setup() {
  
 Serial.begin(115200);
 dht.begin();
 WiFi.begin(ssid, password);
 Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print(".");
 }
  Serial.println("\nConectado ao WiFi!");
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {
      float t = dht.readTemperature();
     float h = dht.readHumidity();
    

// Simulando a leitura do sensor (substitua pela leitura real do seu sensor)
   
    if (isnan(t) || isnan(h)) {
    Serial.println("Erro ao ler o sensor!");
    return;
  }
  HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    String json = "{";
    json += "\"temperatura\":" + String(t) +",";
    json += "\"umidade\":" + String(h);
    json += "}";
    
    int httpResponseCode = http.POST(json);
    Serial.print("Resposta do HTTP: ");
    Serial.println(httpResponseCode);
    }
    http.end();
  }
  }
  delay(10000);
}
 

