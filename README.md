# Voice AI Solutions Lead Qualification Template

This repository contains the necessary files to set up a Vapi lead qualfication assistant template for voice AI solutions and a Google Apps Script tool for logging call data.

## Setting up the Vapi Assistant

1. Clone this repository to your local machine.

   ```
   git clone https://github.com/askjohngeorge/askjg-demo-vapi.git
   ```

2. Make sure you have Python 3.7+ installed on your system.

3. Install the required dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Run the installation script:

   ```
   python install.py
   ```

5. When prompted, enter your Vapi private API key. You can obtain this from your Vapi account dashboard.

6. The script will create the assistant using the components in the `vapi` directory.

## Google Apps Script Tool

The Google Apps Script tool performs two main functions:

1. Logs extracted call data to a Google Sheet
2. Sends you a formatted email with call details

### Setting up the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)

2. Create a new project

3. Copy the contents of `google_apps_script.js` into the script editor

4. Replace the placeholder values in the script:
   - `SPREADSHEET_ID`: The ID of your Google Sheet (found in the URL)
   - `RECIPIENT_EMAIL`: The email address to receive call summaries

5. Deploy the script as a web app:
   - Click on "Deploy" > "New deployment"
   - Choose "Web app" as the type
   - Set "Execute as" to your account
   - Set "Who has access" to "Anyone"
   - Click "Deploy"

6. Copy the web app URL provided after deployment

7. Update your Vapi assistant configuration to use this URL as the webhook for call data

## Usage

Once set up, the Vapi assistant will handle calls and extract relevant data. After each call, the Google Apps Script will automatically log the data to your specified Google Sheet and send a summary email to the recipient email address.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This project is not officially affiliated with, authorized, maintained, sponsored or endorsed by Vapi or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.