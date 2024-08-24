// Configuration
const CONFIG = {
  EMAIL_ADDRESS: "your.email@example.com",
  SPREADSHEET_ID: "your_spreadsheet_id_here",
  SHEET_NAME: "Call_Logs",
};

function doPost(e) {
  const jsonData = e.postData.contents;

  // Process the data
  const processedData = processJsonData(jsonData);

  // Send email
  sendFormattedEmail(processedData);

  // Log to spreadsheet
  logToSpreadsheet(processedData);

  return ContentService.createTextOutput("Success");
}

function processJsonData(jsonData) {
  const parsedData = JSON.parse(jsonData);
  const timestamp = new Date();

  return {
    timestamp: timestamp,
    rawJson: jsonData,
    callId: parsedData.message.call.id,
    endReason: parsedData.message.endedReason,
    durationSeconds: parsedData.message.durationSeconds,
    durationMinutes: parsedData.message.durationMinutes,
    fullName: parsedData.message.analysis.structuredData["Full name"],
    useCase: parsedData.message.analysis.structuredData["Use case"],
    timescale: parsedData.message.analysis.structuredData.Timescale,
    budget: parsedData.message.analysis.structuredData.Budget,
    discoveryPreference:
      parsedData.message.analysis.structuredData["Discovery preference"],
    callSummary: parsedData.message.analysis.summary,
    formattedTranscript: createFormattedTranscript(parsedData.message.messages),
    monoRecordingUrl: parsedData.message.recordingUrl,
    stereoRecordingUrl: parsedData.message.stereoRecordingUrl,
  };
}

function sendFormattedEmail(data) {
  const subject = `AskJG VapiWidget Call Report: ${data.fullName} - ${data.useCase}`;
  const body = createEmailBody(data);

  MailApp.sendEmail({
    to: CONFIG.EMAIL_ADDRESS,
    subject: subject,
    htmlBody: body,
  });
}

function createEmailBody(data) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Call Report</h1>
        <table>
          <tr><th>Timestamp</th><td>${data.timestamp}</td></tr>
          <tr><th>Call ID</th><td>${data.callId}</td></tr>
          <tr><th>End Reason</th><td>${data.endReason}</td></tr>
          <tr><th>Duration</th><td>${data.durationMinutes.toFixed(
            2
          )} minutes (${data.durationSeconds} seconds)</td></tr>
          <tr><th>Full Name</th><td>${data.fullName}</td></tr>
          <tr><th>Use Case</th><td>${data.useCase}</td></tr>
          <tr><th>Timescale</th><td>${data.timescale}</td></tr>
          <tr><th>Budget</th><td>${data.budget}</td></tr>
          <tr><th>Discovery Preference</th><td>${
            data.discoveryPreference
          }</td></tr>
          <tr><th>Call Summary</th><td>${data.callSummary}</td></tr>
          <tr><th>Formatted Transcript</th><td><pre>${
            data.formattedTranscript
          }</pre></td></tr>
          <tr><th>Mono Recording URL</th><td><a href="${
            data.monoRecordingUrl
          }">Listen</a></td></tr>
          <tr><th>Stereo Recording URL</th><td><a href="${
            data.stereoRecordingUrl
          }">Listen</a></td></tr>
        </table>
      </body>
    </html>
  `;
}

function logToSpreadsheet(data) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet =
    spreadsheet.getSheetByName(CONFIG.SHEET_NAME) ||
    spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  // Define the column headers
  const headers = [
    "Timestamp",
    "Raw JSON",
    "Call ID",
    "End Reason",
    "Duration (seconds)",
    "Duration (minutes)",
    "Full Name",
    "Use Case",
    "Timescale",
    "Budget",
    "Discovery Preference",
    "Call Summary",
    "Formatted Transcript",
    "Mono Recording URL",
    "Stereo Recording URL",
  ];

  // Check if headers are already set, if not, set them
  if (sheet.getRange("A1").isBlank()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Prepare the row data
  const rowData = [
    data.timestamp,
    data.rawJson,
    data.callId,
    data.endReason,
    data.durationSeconds,
    data.durationMinutes,
    data.budget,
    data.timescale,
    data.useCase,
    data.fullName,
    data.discoveryPreference,
    data.callSummary,
    data.formattedTranscript,
    data.monoRecordingUrl,
    data.stereoRecordingUrl,
  ];

  // Append the data to the sheet
  sheet.appendRow(rowData);
}

function createFormattedTranscript(messages) {
  let transcript = "";
  for (const message of messages) {
    if (message.role === "bot" || message.role === "user") {
      const role = message.role === "bot" ? "[bot]" : "[user]";
      transcript += `${role}: ${message.message}\n`;
    }
  }
  return transcript.trim();
}
