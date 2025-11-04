# MedAssist - Comprehensive Healthcare Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-38B2AC.svg)](https://tailwindcss.com/)

MedAssist is a comprehensive healthcare management platform that streamlines healthcare operations through role-based access control, electronic health records, e-prescriptions, lab reports, and patient care coordination. Built with modern web technologies and designed for healthcare professionals and patients.

![MedAssist Platform](https://img.shields.io/badge/Platform-Live-brightgreen) **Live Demo**: [https://8nv21bn9sslp.space.minimax.io](https://8nv21bn9sslp.space.minimax.io)

## 🏥 Features

### Core Functionality
- **🔐 Multi-Role Authentication System**
  - 7 distinct user roles: Doctor, Patient, Lab Attendant, Pharmacy, Ambulance Staff, Hospital Admin, Health Ministry
  - Secure role-based access control (RBAC)
  - JWT-based authentication with Supabase Auth

- **📋 Electronic Health Records (EHR)**
  - Comprehensive patient records management
  - Medical history tracking
  - Clinical notes and observations
  - HIPAA/NDHM compliant data handling

- **💊 E-Prescription System**
  - Digital prescription creation and management
  - Medication tracking and adherence
  - Prescription history and refills
  - OCR-powered prescription scanning

- **🧪 Lab Report Management**
  - Digital lab report upload and storage
  - Test result tracking
  - Report sharing with healthcare providers
  - Automated result notifications

- **📅 Appointment Booking System**
  - Multi-hospital appointment scheduling
  - Doctor availability management
  - Patient appointment history
  - Automated reminders and notifications

### Advanced Features
- **🤖 AI-Powered Virtual Assistant**
  - Rule-based chatbot for patient queries
  - Medical information guidance
  - Appointment assistance
  - Health tips and recommendations

- **🔍 OCR Prescription Scanner**
  - Automatic text extraction from prescription images
  - Medication name and dosage recognition
  - Client-side processing using Tesseract.js
  - No external API dependencies

- **🚨 Emergency Access System**
  - Emergency override capabilities
  - Audit logging for compliance
  - Critical health information access
  - Emergency contact management

- **📊 Analytics Dashboard**
  - Healthcare metrics and insights
  - Patient population health data
  - Operational efficiency reports
  - Trend analysis and forecasting

### Security & Compliance
- **🔒 Row-Level Security (RLS)**
  - Database-level access control
  - Role-based data filtering
  - Materialized views for performance
  - Secure data isolation

- **📋 Audit Trail**
  - Complete user activity logging
  - HIPAA/NDHM compliance tracking
  - Data access audit logs
  - Emergency access monitoring

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **TypeScript 5.0** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database with RLS
- **Row-Level Security (RLS)** - Database security
- **Materialized Views** - Performance optimization

### Additional Libraries
- **Tesseract.js** - OCR functionality
- **React Query** - Data fetching and caching
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/medassist-healthcare.git
cd medassist-healthcare
```

2. **Install dependencies**
```bash
cd medassist-frontend
npm install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env` file in the `medassist-frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**
```bash
npm run dev
# or
pnpm dev
```

5. **Access the application**
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

1. **Create Supabase Project**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Note your project URL and anon key

2. **Run Migrations**
   - Navigate to the SQL editor in your Supabase dashboard
   - Run the migration files in `supabase/migrations/` in order
   - Or use Supabase CLI:
```bash
supabase db reset
supabase db push
```

3. **Deploy Edge Functions**
```bash
supabase functions deploy
```

## 👥 Test Accounts

The platform includes pre-configured test accounts for each role:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@medassist.com | TestPass123! |
| Doctor | doctor@medassist.com | TestPass123! |
| Lab Attendant | lab@medassist.com | TestPass123! |
| Pharmacy | pharmacy@medassist.com | TestPass123! |
| Ambulance Staff | ambulance@medassist.com | TestPass123! |
| Hospital Admin | admin@medassist.com | TestPass123! |
| Health Ministry | ministry@medassist.com | TestPass123! |

**Note**: For production use, replace with your own test accounts and ensure proper email verification.

## 📖 Usage Guide

### For Patients
1. **Register/Login** - Create account or use test credentials
2. **Book Appointments** - Select hospital and doctor, choose available time slots
3. **View Medical Records** - Access your complete health history
4. **Upload Prescriptions** - Use OCR scanner or upload images
5. **Chat with Assistant** - Get help with platform navigation

### For Healthcare Providers
1. **Patient Management** - View and manage assigned patients
2. **Prescription Management** - Create, review, and approve prescriptions
3. **Lab Report Review** - Access and analyze lab results
4. **Appointment Scheduling** - Manage availability and appointments
5. **Medical Records** - Update patient health information

### For Administrators
1. **User Management** - Create and manage user accounts
2. **System Analytics** - View platform usage and performance metrics
3. **Audit Logs** - Monitor system access and data changes
4. **Emergency Access** - Override access controls when necessary

## 🏗 Project Structure

```
medassist-healthcare/
├── medassist-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utility functions
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies and scripts
│   └── vite.config.ts          # Vite configuration
├── supabase/                   # Backend configuration
│   ├── functions/              # Edge functions
│   │   ├── ocr-processor/      # OCR processing function
│   │   ├── ai-chatbot/         # AI chatbot backend
│   │   ├── analytics-generator/ # Analytics generation
│   │   └── emergency-access/   # Emergency access handler
│   ├── migrations/             # Database migrations
│   ├── tables/                 # Table definitions
│   └── types.ts                # TypeScript type definitions
├── docs/                       # Documentation
├── browser/                    # Testing screenshots
└── README.md                   # This file
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
- Component testing with React Testing Library
- API integration testing
- Database operation testing
- User acceptance testing

## 📊 Database Schema

The platform uses a normalized PostgreSQL database with the following main entities:

- **user_profiles** - User account information and roles
- **patients** - Patient-specific medical information
- **hospitals** - Healthcare facility data
- **medical_records** - Complete patient health records
- **prescriptions** - Medication prescriptions and orders
- **lab_reports** - Laboratory test results
- **appointments** - Scheduled healthcare appointments
- **audit_logs** - System activity logging
- **emergency_access** - Emergency access records

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: Enhanced Features (if using external APIs)
OPENAI_API_KEY=your_openai_key
GOOGLE_VISION_API_KEY=your_google_vision_key
```

### Supabase Configuration
1. Enable RLS on all tables
2. Configure authentication providers
3. Set up storage buckets for file uploads
4. Deploy edge functions

## 🚀 Deployment

### Production Deployment
1. **Build the application**
```bash
npm run build
```

2. **Deploy to hosting service**
   - Vercel, Netlify, or any static hosting
   - Configure environment variables
   - Set up custom domain (optional)

3. **Database Deployment**
   - Use Supabase production instance
   - Run migrations on production database
   - Configure backup and monitoring

### Docker Deployment (Optional)
```bash
# Build Docker image
docker build -t medassist .

# Run container
docker run -p 3000:3000 medassist
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation as needed

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/user` - Get current user

### Healthcare Endpoints
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment

### Utility Endpoints
- `POST /api/ocr/scan` - Process prescription images
- `POST /api/chatbot/query` - AI assistant queries
- `GET /api/analytics/dashboard` - Platform analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend infrastructure
- [React](https://reactjs.org/) team for the excellent framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/medassist-healthcare/issues)
- **Email**: support@medassist.com
- **Live Demo**: [https://8nv21bn9sslp.space.minimax.io](https://8nv21bn9sslp.space.minimax.io)

## 🗺 Roadmap

### Short Term (Q1 2024)
- [ ] Mobile responsive design improvements
- [ ] Advanced search and filtering
- [ ] Multi-language support
- [ ] Enhanced OCR accuracy

### Medium Term (Q2 2024)
- [ ] Telemedicine integration
- [ ] Wearable device data integration
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

### Long Term (Q3-Q4 2024)
- [ ] AI-powered diagnostic assistance
- [ ] Blockchain-based health records
- [ ] IoT device integration
- [ ] International healthcare standards compliance

---

**Built with ❤️ by the MedAssist Team**

*Making healthcare management simple, secure, and accessible for everyone.*