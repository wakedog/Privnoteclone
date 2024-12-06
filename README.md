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

3. Install the required dependencies
   
  ```bash
   pip install -r requirements.txt

