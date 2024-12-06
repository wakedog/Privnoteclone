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

2. Create a virtual environment (optional but recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install the required dependencies:
   
   ```bash
   pip install -r requirements.txt

4. Run the application:

   ```bash
   python app.py

5. Access the app in your web browser at http://127.0.0.1:5000.

Usage:

1. Open the application in your browser.
2. Write your note in the provided text box.
3. Click "Create Note" to generate a unique link.
4. Share the link with the recipient.
5. The note will self-destruct after being accessed.

Contributing:

We welcome contributions to improve Privnoteclone! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push to your forked repository.
5. Open a pull request with a detailed description of your changes.

License
This project is licensed under the MIT License. See the LICENSE file for more information.

Disclaimer
This project is for educational purposes only and should not be used for production-level sensitive communication. The security and privacy features are implemented as a proof of concept and may not meet stringent security standards.
