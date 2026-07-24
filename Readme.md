# Risk Analyser - Advanced Return Management System

## 🚀 Overview

The Risk Analyser is a comprehensive return management system designed to help businesses analyze, manage, and automate return requests with intelligent risk assessment capabilities. The system provides real-time insights, automated email notifications, and advanced analytics to streamline the return process.

## ✨ Key Features

### 🔍 Risk Assessment
- **Intelligent Risk Scoring**: Automated calculation of customer risk scores based on return history
- **Return Pattern Analysis**: Identifies high-risk customers and suspicious return patterns
- **Real-time Risk Monitoring**: Live dashboard with risk metrics and alerts

### 📧 Automated Communication
- **Email Notifications**: Automated approval/rejection emails to customers
- **Professional Templates**: Beautifully designed HTML email templates
- **Gmail Integration**: Seamless integration with Gmail SMTP service

### 📊 Analytics & Reporting
- **Comprehensive Dashboard**: Real-time statistics and visualizations
- **Return Analytics**: Track return rates, trends, and patterns
- **CSV Export**: Export return data for external analysis
- **Advanced Filtering**: Filter by status, customer, date range, and risk level

### 🛡️ Security & Authentication
- **Role-based Access Control**: Admin and SuperAdmin roles
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: API endpoint protection with middleware
- **Session Management**: Automatic token refresh and secure logout

### 💼 Management Features
- **Return Lifecycle Management**: Complete workflow from request to resolution
- **Customer Management**: Comprehensive customer profiles with risk assessments
- **Order Tracking**: Link returns to original orders
- **Status Management**: Track return status (Pending, Approved, Rejected)

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Shadcn/UI** for component library
- **React Query (TanStack)** for state management and caching
- **React Router** for navigation
- **Lucide React** for icons

#### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Winston** for logging
- **Bcrypt** for password hashing

#### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Dotenv** for environment management

### Project Structure

```
risk-analyser/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # API functions and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── controllers/        # Business logic handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   ├── middleware/        # Authentication and validation
│   ├── utils/             # Helper functions and utilities
│   └── package.json       # Backend dependencies
├── .env                   # Environment variables
└── README.md             # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Gmail Account** (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd risk-analyser
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/risk-analyser
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Email Configuration
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-password
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

5. **Gmail App Password Setup**
   - Enable 2-factor authentication on your Gmail account
   - Go to Google Account Settings → Security → App passwords
   - Generate an app password for "Mail"
   - Use this 16-character password in `MAIL_PASS`

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Return Management Endpoints

#### Get All Returns
```http
GET /api/returns?search=&status=All
Authorization: Bearer <token>
```

#### Get Return Statistics
```http
GET /api/returns/stats
Authorization: Bearer <token>
```

#### Get Return Details
```http
GET /api/returns/:id
Authorization: Bearer <token>
```

#### Approve Return
```http
POST /api/returns/:id/approve
Authorization: Bearer <token>
```

#### Reject Return
```http
POST /api/returns/:id/reject
Authorization: Bearer <token>
```

### Customer Management Endpoints

#### Get All Customers
```http
GET /api/customers
Authorization: Bearer <token>
```

#### Get Customer Details
```http
GET /api/customers/:id
Authorization: Bearer <token>
```

## 🎯 Features Deep Dive

### Risk Assessment Algorithm

The system calculates customer risk scores based on:
- **Return Rate**: Percentage of orders returned
- **Return Frequency**: How often customer makes returns
- **Return Value**: Total value of returned items
- **Return Reasons**: Pattern analysis of return reasons

**Risk Score Calculation:**
```javascript
const calculateRiskScore = (totalOrders, totalReturns) => {
  if (totalOrders === 0) return 0;
  const returnRate = (totalReturns / totalOrders) * 100;
  return Math.min(Math.round(returnRate), 100);
};
```

### Email Automation

#### Approval Email Template
- Professional design with company branding
- Customer personalization
- Return ID reference
- Next steps information

#### Rejection Email Template
- Empathetic messaging
- Clear reason communication
- Customer service contact information
- Policy reference links

### Advanced Filtering

- **Status Filter**: All, Pending, Approved, Rejected
- **Search**: Customer name, return ID, product name
- **Date Range**: Custom date filtering
- **Risk Level**: High, Medium, Low risk returns

## 🔧 Configuration

### Database Schema

#### Return Model
```javascript
{
  returnId: String (unique),
  customer: ObjectId (ref: Customer),
  customerId: String,
  product: String,
  reason: String,
  status: String (enum: ['Pending', 'Approved', 'Rejected']),
  riskScore: Number,
  orderId: String,
  productPrice: Number,
  requestDate: Date,
  responseTime: Date
}
```

#### Customer Model
```javascript
{
  customerId: String (unique),
  name: String,
  email: String,
  riskScore: Number,
  totalOrders: Number,
  totalReturns: Number,
  joinDate: Date
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `MAIL_USER` | Gmail email address | Yes |
| `MAIL_PASS` | Gmail app password | Yes |
| `PORT` | Server port (default: 5000) | No |

## 📈 Monitoring & Logging

### Winston Logging
- **Info Level**: General application flow
- **Error Level**: Application errors and exceptions
- **Debug Level**: Detailed debugging information

### Request Logging
All API requests are logged with:
- Timestamp
- IP address
- HTTP method and endpoint
- Response status
- Response time

## 🔐 Security Features

### Authentication Security
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Short-lived access tokens
- **Refresh Tokens**: Secure token renewal
- **Role-based Access**: Admin and SuperAdmin roles

### API Security
- **Input Validation**: Request data validation
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Cross-origin request control
- **Error Handling**: Secure error responses

## 🚀 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Prepare Backend**
   ```bash
   cd backend
   npm install --production
   ```

3. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set secure JWT secrets
   - Configure production email settings

### Docker Deployment (Optional)

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@risk-analyser.com
- Documentation: [Wiki](link-to-wiki)

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete return management system
- Email automation
- Risk assessment algorithm
- Admin dashboard
- CSV export functionality

## 🎯 Roadmap

### Upcoming Features
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning predictions
- [ ] **Integration APIs**: Third-party e-commerce platforms
- [ ] **Notification System**: Real-time push notifications
- [ ] **Audit Trail**: Complete action logging and history
- [ ] **Multi-tenant Support**: Support for multiple businesses

---