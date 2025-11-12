function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = '11E7Haa-REGuxxDshtHN5Sz4b8Y2E1Df5Z6-J9r99RoQ'; // Replace with your actual spreadsheet ID
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    // Add headers if needed
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp',
        'Wallet Address',
        'Code Quality Rating',
        'Audit Accuracy Rating', 
        'Deployment Experience Rating',
        'Minting Experience Rating',
        'Service Rating',
        'Overall Rating',
        'Comments',
        'Session ID' // Optional: Keep for tracking if needed
      ]]);
    }
    
    // Use wallet address as primary identifier
    const walletAddress = data.walletAddress || 'Anonymous';
    
    // Map data to sheet columns - wallet address is the main identifier
    sheet.appendRow([
      data.timestamp,
      walletAddress, // Primary identifier
      Number(data.codeQualityRating) || 0,
      Number(data.auditAccuracyRating) || 0,
      Number(data.deploymentExperienceRating) || 0,
      Number(data.mintingExperienceRating) || 0,
      Number(data.serviceRating) || 0,
      Number(data.overallRating) || 0,
      data.comments || '',
      data.auditId || 'N/A' // Keep audit ID as secondary reference if needed
    ]);
    
    return output.setContent(JSON.stringify({
      status: 'success',
      message: 'Feedback submitted successfully',
      walletAddress: walletAddress
    }));
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return output.setContent(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));
  }
}