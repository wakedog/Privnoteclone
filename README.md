# Privnoteclone

Privnoteclone is a web application that replicates the core functionality of [Privnote](https://privnote.com/), a service that allows users to send self-destructing, encrypted notes. This clone provides a secure and convenient way to share sensitive information, ensuring the notes are destroyed once read.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Self-Destructing Notes**: Notes automatically delete themselves after being read.
- **Encryption**: Ensures that notes are securely transmitted and stored.
- **Link Sharing**: Generates a unique URL for each note that can be shared.
- **User-Friendly Interface**: A simple and intuitive UI for creating and sharing notes.
- **No Signup Required**: Anonymous and quick note creation.

## Technologies Used

- **Backend**: [Python](https://www.python.org/), [Flask](https://flask.palletsprojects.com/)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Other Libraries**: Cryptography for encryption

## Installation

Follow these steps to set up the project on your local machine:

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Git

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/wakedog/Privnoteclone.git
   cd Privnoteclone

Create a virtual environment (optional but recommended):
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

Install the required dependencies:
pip install -r requirements.txt

Run the application:
python app.py

Access the app in your web browser at http://127.0.0.1:5000.

Usage
Open the application in your browser.
Write your note in the provided text box.
Click "Create Note" to generate a unique link.
Share the link with the recipient.
The note will self-destruct after being accessed.
Contributing
We welcome contributions to improve Privnoteclone! To contribute:

Fork the repository.
Create a new branch for your feature or bug fix.
Make your changes and commit them.
Push to your forked repository.
Open a pull request with a detailed description of your changes.
License
This project is licensed under the MIT License. See the LICENSE file for more information.

Disclaimer
This project is for educational purposes only and should not be used for production-level sensitive communication. The security and privacy features are implemented as a proof of concept and may not meet stringent security standards.
