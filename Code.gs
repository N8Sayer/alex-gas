function onFormSubmit(evt) {
  var key = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings').getDataRange().getDisplayValues();
  var templateId = key[4][1];
  var folderId = key[4][2];
  var date = Utilities.formatDate(new Date(), 'CST', 'MM/dd/yyyy');
  
  var newDocName = DocumentApp.openById(templateId).getName();
  newDocName += ": " + evt.namedValues['Stakeholders'][0] + " - " + date;
  var target = createDuplicateDocument(templateId, newDocName, folderId);
  var body = DocumentApp.openById(target.getId()).getBody();
  
  for (var x=0; x<key[0].length; x++) {
    if (key[0][x] !== "" && body.findText(key[1][x])) {
      var searchPattern = "^<\\s?" + key[1][x] + "\\s?>$";
      var replaceValue = evt.namedValues[key[0][x]];
      if (replaceValue[0] == '$') {
        var tmpVal = replaceValue;
        replaceValue = '\\' + tmpVal;
      }
      body.replaceText(searchPattern,replaceValue);
    }
  }  
}

function createDuplicateDocument(sourceId, name, target) {
  
  // Folder to put the copied file into
  var targetFolder = DriveApp.getFolderById(target);
  
  // Copied File
  var proposal = DriveApp.getFileById(sourceId).makeCopy(name, targetFolder);
  
  return proposal;
}

/**
 * Test function for Spreadsheet Form Submit trigger functions.
 * Loops through content of sheet, creating simulated Form Submit Events.
 *
 * Check for updates: https://stackoverflow.com/a/16089067/1677912
 *
 * See https://developers.google.com/apps-script/guides/triggers/events#google_sheets_events
 */
function test_onFormSubmit() {
  var dataRange = SpreadsheetApp.getActiveSheet().getDataRange();
  var data = dataRange.getValues();
  var headers = data[0];
  // Start at row 1, skipping headers in row 0
  for (var row=1; row < data.length; row++) {
    var e = {};
    e.values = data[row].filter(Boolean);  // filter: https://stackoverflow.com/a/19888749
    e.range = dataRange.offset(row,0,1,data[0].length);
    e.namedValues = {};
    // Loop through headers to create namedValues object
    // NOTE: all namedValues are arrays.
    for (var col=0; col<headers.length; col++) {
      e.namedValues[headers[col]] = [data[row][col]];
    }
    Logger.log(e);
    // Pass the simulated event to onFormSubmit
    onFormSubmit(e);
  }  
}

