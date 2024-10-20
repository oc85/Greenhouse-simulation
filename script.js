let day = 0;
let interval;
let predictedDays = 0;
let plantImages = [];

const plantImages1 = [
    "./2/1.png",
    "./2/2.png",
    "./2/3.png",
    "./2/4.png",
    "./2/5.png",
    "./2/6.png",
    "./2/7.png",
    "./2/8.png"
];

const plantImages2 = [
    "./3/1.png",
    "./3/2.png",
    "./3/3.png",
    "./3/4.png",
    "./3/5.png",
    "./3/6.png",
    "./3/7.png",
    "./3/8.png"
];

// Crop-specific parameters
const cropParameters = {
    strawberry: {
        predictedDays: 60,
        temperature: 20,
        lightIntensity: 60,
        moisture: 70,
        humidity: 65,
        images: plantImages1
    },
    tomatoes: {
        predictedDays: 50,
        temperature: 25,
        lightIntensity: 70,
        moisture: 60,
        humidity: 70,
        images: plantImages2
    }
};

// Set default parameters to strawberry
let currentCrop = 'strawberry';
setParameters(currentCrop);

document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('stopBtn').addEventListener('click', stopSimulation);

document.getElementById('cropSelect').addEventListener('change', function() {
    currentCrop = this.value;
    setParameters(currentCrop);
});

function setParameters(crop) {
    const params = cropParameters[crop];
    predictedDays = params.predictedDays;
    plantImages = params.images;
    
    document.getElementById('temperature').textContent = params.temperature.toFixed(2);
    document.getElementById('lightIntensity').textContent = params.lightIntensity.toFixed(2);
    document.getElementById('moisture').textContent = params.moisture.toFixed(2);
    document.getElementById('humidity').textContent = params.humidity.toFixed(2);
    
    document.getElementById('predictedDays').textContent = `Predicted Days: ${predictedDays}`;
    
    // Update dynamic parameters as well
    document.getElementById('dynamicTemperature').textContent = params.temperature.toFixed(2);
    document.getElementById('dynamicLightLevel').textContent = params.lightIntensity.toFixed(2);
    document.getElementById('dynamicMoisture').textContent = params.moisture.toFixed(2);
    document.getElementById('dynamicHumidity').textContent = params.humidity.toFixed(2);
}

// Function to update simulation parameters dynamically on the right panel
function updateDynamicParameters() {
    let temperature = parseFloat(document.getElementById('dynamicTemperature').textContent);
    let moisture = parseFloat(document.getElementById('dynamicMoisture').textContent);
    let humidity = parseFloat(document.getElementById('dynamicHumidity').textContent);
    let lightLevel = parseFloat(document.getElementById('dynamicLightLevel').textContent);

    const tempDeviation = temperature * 0.1;
    const moistDeviation = moisture * 0.1;
    const humidDeviation = humidity * 0.1;
    const lightDeviation = lightLevel * 0.1;

    temperature += (Math.random() - 0.5) * 2 * tempDeviation;
    moisture += (Math.random() - 0.5) * 2 * moistDeviation;
    humidity += (Math.random() - 0.5) * 2 * humidDeviation;
    lightLevel += (Math.random() - 0.5) * 2 * lightDeviation;

    document.getElementById('dynamicTemperature').textContent = temperature.toFixed(2);
    document.getElementById('dynamicMoisture').textContent = moisture.toFixed(2);
    document.getElementById('dynamicHumidity').textContent = humidity.toFixed(2);
    document.getElementById('dynamicLightLevel').textContent = lightLevel.toFixed(2);

    correctAndIndicate('tempLow', 'tempHigh', 'dynamicTemperature', temperature, cropParameters[currentCrop].temperature);
    correctAndIndicate('moistLow', 'moistHigh', 'dynamicMoisture', moisture, cropParameters[currentCrop].moisture);
    correctAndIndicate('humidLow', 'humidHigh', 'dynamicHumidity', humidity, cropParameters[currentCrop].humidity);
    correctAndIndicate('lightLow', 'lightHigh', 'dynamicLightLevel', lightLevel, cropParameters[currentCrop].lightIntensity);

    // Update actuators based on dynamic parameters
    updateActuators(temperature, moisture, humidity, lightLevel);
}

function correctAndIndicate(lowId, highId, dynamicId, currentValue, targetValue) {
    const lowElement = document.getElementById(lowId);
    const highElement = document.getElementById(highId);
    const dynamicElement = document.getElementById(dynamicId);

    lowElement.classList.remove('active');
    highElement.classList.remove('active');

    if (currentValue < targetValue - 2) { // Threshold for correction
        lowElement.classList.add('active');
        dynamicElement.textContent = (currentValue + 0.5).toFixed(2); // Correct the value
    } else if (currentValue > targetValue + 2) { // Threshold for correction
        highElement.classList.add('active');
        dynamicElement.textContent = (currentValue - 0.5).toFixed(2); // Correct the value
    }
}

function updateActuators(temperature, moisture, humidity, lightLevel) {
    const targetTemp = cropParameters[currentCrop].temperature;
    const targetMoisture = cropParameters[currentCrop].moisture;
    const targetHumidity = cropParameters[currentCrop].humidity;
    const targetLight = cropParameters[currentCrop].lightIntensity;

    setActuatorStatus('heaterStatus', temperature < targetTemp - 2);
    setActuatorStatus('coolerStatus', temperature > targetTemp + 2);
    setActuatorStatus('humidifierStatus', humidity < targetHumidity - 5);
    setActuatorStatus('dehumidifierStatus', humidity > targetHumidity + 5);
    setActuatorStatus('irrigationStatus', moisture < targetMoisture - 10);
    setActuatorStatus('lightsStatus', lightLevel < targetLight - 10);
}

function setActuatorStatus(actuatorId, isOn) {
    const actuator = document.getElementById(actuatorId);
    actuator.textContent = isOn ? 'On' : 'Off';
    actuator.classList.toggle('active', isOn);

    // Get the parent div and update its background color
    const actuatorDiv = actuator.closest('.actuator');
    if (isOn) {
        actuatorDiv.style.backgroundColor = '#2ecc71'; // Green when on
    } else {
        actuatorDiv.style.backgroundColor = '#e74c3c'; // Red when off
    }
}


function toggleActuator(actuatorId) {
    const actuator = document.getElementById(actuatorId);
    const newStatus = actuator.textContent === 'Off';
    setActuatorStatus(actuatorId, newStatus);
}

function updateSimulation() {
    if (day >= predictedDays) {
        stopSimulation();
    } else {
        const imageIndex = Math.floor((day / (predictedDays - 1)) * (plantImages.length - 1));
        document.getElementById('plantImage').src = plantImages[imageIndex];
        document.getElementById('dayCount').innerText = `Day: ${day + 1}`;
        const growthPercentage = ((day + 1) / predictedDays) * 100;
        document.getElementById('growthStatus').innerText = `Crop Growth: ${growthPercentage.toFixed(2)}%`;
        day++;

        updateDynamicParameters(); // Update temperature and moisture each day
    }
}

function stopSimulation() {
    clearInterval(interval);
}

// Function to recalculate predicted days based on parameters
function recalculatePredictedDays() {
    let temperature = parseFloat(document.getElementById('temperature').textContent);
    let lightIntensity = parseFloat(document.getElementById('lightIntensity').textContent);
    let moisture = parseFloat(document.getElementById('moisture').textContent);
    let windowState = document.getElementById('window').textContent;
    let fanState = document.getElementById('fan').textContent;

    // Base predicted days
    let baseDays = cropParameters[currentCrop].predictedDays;

    // Adjust predicted days based on parameters
    if (temperature > cropParameters[currentCrop].temperature + 5) baseDays -= 5;
    if (lightIntensity > cropParameters[currentCrop].lightIntensity + 10) baseDays -= 5;
    if (moisture < cropParameters[currentCrop].moisture - 10) baseDays += 5;
    if (windowState === "Closed") baseDays += 2;
    if (fanState === "Off") baseDays += 2;

    // Ensure predicted days do not fall below 1
    predictedDays = Math.max(baseDays, 1);
    document.getElementById('predictedDays').textContent = `Predicted Days: ${predictedDays}`;
}

function startSimulation() {
    recalculatePredictedDays(); // Recalculate before starting
    stopSimulation(); // Reset if already running
    day = 0;
    updateSimulation(); // Initial update
    interval = setInterval(updateSimulation, 300);
}

// Function to update numeric parameters
function updateParameter(elementId, increment) {
    const element = document.getElementById(elementId);
    let currentValue = parseFloat(element.textContent);
    currentValue += increment;
    
    // Add constraints for each parameter
    switch (elementId) {
        case 'temperature':
            currentValue = Math.max(0, Math.min(40, currentValue)); // 0°C to 40°C
            break;
        case 'lightIntensity':
        case 'moisture':
        case 'humidity':
            currentValue = Math.max(0, Math.min(100, currentValue)); // 0% to 100%
            break;
    }
    
    element.textContent = currentValue.toFixed(2);
    recalculatePredictedDays(); // Recalculate predicted days after parameter change
}

// Function to toggle window and fan states
function toggleState(elementId) {
    const element = document.getElementById(elementId);
    if (elementId === 'window') {
        element.textContent = element.textContent === "Closed" ? "Open" : "Closed";
    } else if (elementId === 'fan') {
        element.textContent = element.textContent === "Off" ? "On" : "Off";
    }
    recalculatePredictedDays(); // Recalculate predicted days after state change
}

// Add event listeners for parameter buttons
document.querySelectorAll('.parameter-buttons button').forEach(button => {
    button.addEventListener('click', function() {
        const parameter = this.closest('.parameter').querySelector('.parameter-value').id;
        const increment = this.textContent === '+' ? 1 : -1;
        updateParameter(parameter, increment);
    });
});

// Add event listeners for toggle buttons
document.querySelectorAll('.parameter button:not(.parameter-buttons button)').forEach(button => {
    button.addEventListener('click', function() {
        const parameter = this.closest('.parameter').querySelector('.parameter-value').id;
        toggleState(parameter);
    });
});

document.querySelectorAll('.actuator').forEach(actuator => {
    actuator.addEventListener('click', function() {
        toggleActuator(this.querySelector('.actuator-status').id);
    });
});
