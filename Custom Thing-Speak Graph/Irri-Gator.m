% Allan Odunga Irri-Gator Code for Current, minimum and maximum thresholds for soil moisture as boundaries to the current soil moisture percentage 

% Channel ID to read data from, channel ID and API key is from the user settings thingspeak channel, allows graph to use minimum and maximum soil moisture thresholds as set by user
readChannelID = 000000000; 
readAPIKey = 'XXXXXXXXXXXX';


% Read current soil moisture, maximum soil moisture, and minimum soil moisture data
data = thingSpeakRead(readChannelID, 'Fields', [1 2 3], 'NumPoints', 10, 'ReadKey', readAPIKey);

currentSoilMoisture = data(:, 1);
maxSoilMoisture = data(:, 2);
minSoilMoisture = data(:, 3);

% Generate x-axis data (time or index)
time = linspace(now-1, now, numel(currentSoilMoisture));

% Create figure
figure;

% Plot upper and lower boundaries as dotted lines
plot(time, maxSoilMoisture, 'b:', 'LineWidth', 2);
hold on;
plot(time, minSoilMoisture, 'r:', 'LineWidth', 2);

% Plot current soil moisture as a line
plot(time, currentSoilMoisture, 'Color', [0.3 0.6 0.1], 'LineWidth', 2);

% Set axis labels and title
xlabel('Time');
ylabel('Soil Moisture');
title('Soil Moisture Levels');

% Set y-axis limits
ylim([0 100]);

% Display grid lines
grid on;

% Enable data cursors and customize their behavior
dcm_obj = datacursormode(gcf);
set(dcm_obj, 'UpdateFcn', @cursorUpdateFcn);

% Move the legend outside the graph area
lgd = legend('Upper Boundary', 'Lower Boundary', 'Current Soil Moisture');

% Set x-axis ticks and labels
datetick('x', 'HH:MM', 'KeepLimits', 'keeplimits'); % Add 'keeplimits' option

% Rotate x-axis tick labels if needed
xtickangle(45);

% Cursor update function to display measurement number
function txt = cursorUpdateFcn(~, event_obj)
    % Get the data point index
    index = get(event_obj, 'DataIndex');
    
    % Get the corresponding measurement number
    measurement = index;
    
    % Create the tooltip text
    txt = {['Measurement: ', num2str(measurement)]};
end
