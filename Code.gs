function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Menu Setup')
      .addItem('Install Triggers', 'menuItem1')
      .addToUi();  
}

function menuItem1() {
  var sheet = SpreadsheetApp.getActive();
  ScriptApp.newTrigger("onFormSubmit")
   .forSpreadsheet(sheet)
   .onFormSubmit()
   .create();
}

function getCell() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  
  return sheet.getRange('B1:Z1').getDisplayValues();
}

function onFormSubmit(evt) {
  var key = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings').getDataRange().getDisplayValues();
  var templateId = key[4][1];
  var folderId = key[4][4];
  var date = Utilities.formatDate(new Date(), 'CST', 'MM/dd/yyyy');
  
  var newDocName = titleRenamer(DocumentApp.openById(templateId).getName(), evt.namedValues, key);
  
  var target = createDuplicateDocument(templateId, newDocName, folderId);
  var targetId = target.getId();
  
  var log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  var lastRow = log.getLastRow();
  var today = new Date();
  log.getRange(lastRow+1,1,1,3).setValues([[today,'Created document: '+newDocName,target.getUrl()]]);
  
  var body = DocumentApp.openById(targetId).getBody();
  bodyRenamer(body, evt.namedValues, key);
}

function createDuplicateDocument(sourceId, name, target) {  
  // Folder to put the copied file into
  var targetFolder = DriveApp.getFolderById(target);  
  // Copied File
  var proposal = DriveApp.getFileById(sourceId).makeCopy(name, targetFolder);
  
  return proposal;
}

function bodyRenamer(body, namedValues, key) {
  for (var x=0; x<key[0].length; x++) {
    if (key[0][x] !== "" && body.findText(key[1][x].trim())) {
      var searchPattern = "^<\\s?" + key[1][x].trim() + "\\s?>$";
      var replaceValue = namedValues[key[0][x]];
      if (replaceValue[0] == '$') {
        var tmpVal = replaceValue;
        replaceValue = '\\' + tmpVal;
      }
      body.replaceText(searchPattern,replaceValue);
    }
  }
}

function titleRenamer(title, namedValues, key) {
  for (var x=0; x<key[0].length; x++) {
    if (key[0][x] !== "") {
      var searchPattern = new RegExp("<\\s?" + key[1][x].trim() + "\\s?>");
      var replaceValue = namedValues[key[0][x]];
      if (replaceValue[0] == '$') {
        var tmpVal = replaceValue;
        replaceValue = '\\' + tmpVal;
      }
      title = title.replace(searchPattern,replaceValue);
    }
  }  
  return title;
}