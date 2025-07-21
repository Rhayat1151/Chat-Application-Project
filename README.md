# Chat Application

![React](https://img.shields.io/badge/React-18.0%2B-61DAFB)

## Group Members & Instructor
- Abu Bakar
- Raqib Hayat

**Instructor:** Sir Shahzad Arif  
**Institution:** Namal University, Department of Computer Science  
**Course:** CS-371 Cloud Computing (6th Semester, Spring 2025)

## Table of Contents
- [Project Overview](#project-overview)
- [Project Objective](#project-objective)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Project Overview
A full-stack real-time chat application built with React, Node.js, and Firebase. This application provides a seamless messaging experience with features like real-time chat, user authentication, and file sharing. The project showcases modern web development practices and cloud computing concepts.

## Project Objective
To develop a scalable, real-time chat application that demonstrates proficiency in full-stack development, cloud computing concepts, and modern web technologies. The project showcases skills in building responsive UIs, handling real-time data, and implementing secure user authentication.

## Key Features
- 🔐 User Authentication (Login/Register)
- 💬 Real-time messaging with Firebase Realtime Database
- 👤 User profiles with avatar support
- 📁 Image upload and sharing
- 🔔 Real-time notifications
- 📱 Responsive design for all devices
- 🔍 User search functionality
- 🔄 Online/Offline status tracking
- 🛡️ Secure authentication with JWT

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: React Context API & Hooks
- **UI Components**: Custom components with CSS Modules
- **Real-time**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **File Storage**: Azure Blob Storage
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: Azure SQL Database
- **File Storage**: Azure Blob Storage
- **API**: RESTful API
- **Image Processing**: Sharp (for image optimization)
- **CORS**: Enabled for cross-origin requests

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abubakarp789/Chat-Application-Project.git
cd Chat-Application-Project
```

### 2. Set Up Azure Services

1. **Azure Account Setup**
   - Create a free Azure account at [Azure Portal](https://portal.azure.com/)
   - Create a new Resource Group for the project

2. **Azure SQL Database**
   - Create a new SQL Database
   - Note down the server name, database name, and credentials
   - Configure firewall to allow Azure services and your IP

3. **Azure Blob Storage**
   - Create a new Storage Account
   - Create a container for profile images
   - Generate an access key and connection string

4. **Application Configuration**
   - Create a `.env` file in the backend directory with the following variables:
     ```
     AZURE_SQL_CONNECTION_STRING=your_sql_connection_string
     AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
     AZURE_STORAGE_CONTAINER_NAME=your_container_name
     JWT_SECRET=your_jwt_secret_key
     PORT=3001
     ```

### 3. Frontend Setup

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd Frontend
   npm install  # or yarn
   ```

2. Configure environment variables:
   Create a `.env` file in the frontend directory with the following variables:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3001
   
   # Azure AD B2C Authentication (if applicable)
   VITE_AZURE_AD_B2C_TENANT_NAME=your-tenant-name
   VITE_AZURE_AD_B2C_CLIENT_ID=your-client-id
   VITE_AZURE_AD_B2C_POLICY=your-signin-policy
   
   # Feature Flags
   VITE_ENABLE_ANALYTICS=false
   ```

### 4. Backend Setup

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd Backend
   npm install  # or yarn
   ```

2. Set up environment variables:
   Create a `.env` file in the backend directory with the required variables:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Azure SQL Database
   AZURE_SQL_CONNECTION_STRING=your_connection_string
   
   # Azure Blob Storage
   AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
   AZURE_STORAGE_CONTAINER_NAME=profile-images
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   
   # Logging
   LOG_LEVEL=debug
   ```

3. Install recommended global tools:
   ```bash
   npm install -g nodemon typescript ts-node
   ```

### 5. Database Initialization

1. Run database migrations:
   ```bash
   cd Backend
   # Initialize database schema
   npx sequelize-cli db:migrate
   
   # Seed initial data (if any)
   npx sequelize-cli db:seed:all
   ```

### 6. Running the Application

1. Start the backend server in development mode:
   ```bash
   cd Backend
   npm run dev  # Uses nodemon for hot-reload
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd Frontend
   npm run dev  # Vite development server
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Development Tips

- Use VS Code with recommended extensions for better development experience
- Enable auto-format on save in your editor
- Check the `package.json` scripts section for additional development commands
- Use the `.env.example` files as templates for your local environment variables

## Project Structure

```
Chat-Application-Project/
├── Frontend/                 # React frontend application
│   ├── public/               # Static files
│   └── src/                  # Source files
│       ├── components/       # Reusable UI components
│       │   ├── chat/         # Chat components
│       │   ├── detail/       # User detail components
│       │   ├── list/         # Chat list components
│       │   ├── login/        # Authentication components
│       │   └── notification/ # Notification components
│       ├── lib/              # Utility functions and hooks
│       ├── App.jsx           # Main application component
│       └── main.jsx          # Application entry point
├── Backend/                  # Node.js backend server
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
└── README.md                # Project documentation
```

## Usage

### Development

#### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Run tests (if configured)
npm test
```

#### Backend
```bash
# Start development server with hot-reload
npm run dev

# Start production server
npm start

# Run database migrations (if any)
npm run migrate

# Run tests (if configured)
npm test
```

## Deployment

### Prerequisites
- Azure account with appropriate permissions
- Azure CLI installed and logged in
- Azure App Service and Azure SQL Database configured
- Azure Storage account created

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Navigate to backend directory
   cd Backend
   
   # Install dependencies
   npm install --production
   
   # Deploy to Azure App Service
   az webapp up \
     --name <your-app-name> \
     --resource-group <resource-group-name> \
     --runtime "NODE|18-lts" \
     --sku B1
   ```

2. **Frontend Deployment**
   ```bash
   # Navigate to frontend directory
   cd Frontend
   
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Deploy to Azure Static Web Apps
   npm run build && swa deploy \
     --app-name <your-static-app-name> \
     --resource-group <resource-group-name> \
     --env production
   ```

3. **Environment Configuration**
   - Set up application settings in Azure Portal for both frontend and backend
   - Configure connection strings for Azure SQL Database
   - Set up CORS policies to allow frontend-backend communication
   - Configure custom domains and SSL certificates

4. **Post-Deployment**
   - Set up continuous deployment from your repository
   - Configure monitoring and alerts in Azure Monitor
   - Set up backup policies for Azure SQL Database
   - Configure auto-scaling rules based on load

## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgements
- Sir Shahzad Arif for guidance and support
- Namal University, Department of Computer Science

## Notes
- Ensure proper Azure RBAC (Role-Based Access Control) is configured for production
- Monitor Azure SQL Database DTUs/vCores usage to optimize performance and cost
- Set up Azure Monitor for application insights and performance tracking
- Configure Azure Backup for regular database and storage backups
- Consider implementing Azure Front Door or Application Gateway for enhanced security and performance
- Set up proper CORS policies in Azure App Service or your hosting environment

<div align="center">

**Developed by Abu Bakar & Muhammmad Raqib Hayat**  
**CS-371 Cloud Computing, Spring 2025**  
**Namal University, Mianwali**

</div>
