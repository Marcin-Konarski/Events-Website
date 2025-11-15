# Venuo - Event Management Website

A modern, full-stack event management website. Venuo allows users to create, discover, and participate in events with a responsive interface made in React.js and backend in Python Flask.


***This webpage was built as a project for my internship with the foundation "Głos Młodych" [https://fundacjaglosmlodych.org/](https://fundacjaglosmlodych.org/)***


## 🌟 Features

### Core Functionality
- **Event Creation & Management**: Create events with detailed information, images, and categories
- **User Authentication**: Secure registration and login with email verification
- **Event Discovery**: Browse events with category filtering
- **Event Participation**: Join/leave events with real-time participant tracking
- **Responsive Design**: Fully responsive interface that works on desktop and mobile
- **Real-time Updates**: Dynamic event updates

### Advanced Features
- **Email Verification**: Secure account activation via email confirmation
- **Image Upload**: Support for event images with file validation
- **Category Filtering**: Filter events by categories like music, art, technology, etc.
- **Interactive UI**: Smooth animations, hover effects, and modern design elements
- **Session Management**: Secure session handling with cookies
- **CORS Support**: Cross-origin resource sharing for API integration

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **React Router DOM** - Client-side routing
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests
- **Flatpickr** - Date and time picker
- **Swiper** - Touch slider component
- **Vanilla Tilt** - 3D tilt effect for cards

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-Login** - User session management
- **Flask-Bcrypt** - Password hashing
- **Flask-Mail** - Email functionality
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Migrate** - Database migrations
- **Flask-Session** - Server-side session storage
- **Python-dotenv** - Environment variable management

### Database & Storage
- **SQLite** - Development database

## 📁 Project Structure

```
Venuo/
├── backend/                                  # Flask backend application
│   ├── auth.py                               # Authentication routes and logic
│   ├── config.py                             # Flask configuration and setup
│   ├── main.py                               # Main application routes
│   ├── models.py                             # Database models and schemas
│   ├── requirements.txt                      # Python dependencies
│   ├── templates/                            # Email templates
│   │   └── confirm_email.html                # Email confirmation template
│   ├── images/                               # Uploaded event images
│   ├── migrations/                           # Database migration files
│   ├── flask_session/                        # Session storage
│   └── instance/                             # SQLite database location
├── frontend/                                 # React frontend application
│   ├── src/
│   │   ├── main.jsx                          # Application entry point
│   │   ├── index.css                         # Global styles and Tailwind
│   │   ├── AuthContext.jsx                   # Authentication context
│   │   ├── Context.jsx                       # Event context
│   │   ├── Components/                       # Reusable React components
│   │   │   ├── Background.jsx                # Animated background
│   │   │   ├── NavBar.jsx                    # Navigation component
│   │   │   ├── LoginForm.jsx                 # Login form
│   │   │   ├── RegisterForm.jsx              # Registration form
│   │   │   ├── EventForm.jsx                 # Event creation/editing
│   │   │   ├── EventCard.jsx                 # Event display card
│   │   │   ├── EmailConfirmation.jsx         # Email verification
│   │   │   └── ThemeToggle.jsx               # Dark/light theme toggle
│   │   ├── Screens/                          # Page components
│   │   │   ├── HomeScreen.jsx                # Main landing page
│   │   │   ├── LoginScreen.jsx               # Login page
│   │   │   ├── RegisterScreen.jsx            # Registration page
│   │   │   ├── CreateEditEventScreen.jsx     # Event management
│   │   │   ├── EventDetailsScreen.jsx        # Event details modal
│   │   │   ├── EventsListSection.jsx         # Event listing
│   │   │   ├── HeroSection.jsx               # Landing hero section
│   │   │   └── PageNotFound.jsx              # 404 error page
│   │   └── lib/                              # Utility functions
│   │       ├── utils.js                      # Tailwind utilities
│   │       └── Constants.jsx                 # Event categories
│   ├── public/                               # Static assets
│   ├── package.json                          # Node.js dependencies
│   ├── vite.config.js                        # Vite configuration
│   ├── tailwind.config.js                    # Tailwind configuration
│   └── postcss.config.js                     # PostCSS configuration
├── .gitignore                                # Git ignore rules
└── README.md                                 # This file
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** - Backend runtime
- **Node.js 16+** - Frontend runtime
- **npm or yarn** - Package manager
- **Git** - Version control

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Marcin-Konarski/Webpage.git
   cd venuo
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file**
   ```bash
   # Create .env file in backend directory
   touch .env
   ```
   
   Add the following variables to `.env`:
   ```env
   SECRET_KEY=your-secret-key-here
   SECURITY_PASSWORD_SALT=your-security-salt-here
   EMAIL_USER=your-email@gmail.com
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

6. **Run the Flask backend**
   ```bash
   python main.py
   ```
   The backend will start on `http://localhost:5000`

7. **Or for production**
   ```bash
   gunicorn --bind 127.0.0.1:5000 --workers 1 wsgi:app
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will start on `http://localhost:5173`

4. **Or for production**
   ```bash
   npm run build
   serve -s dist -l 3000
   ```

### Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Flask Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
SECURITY_PASSWORD_SALT=your-security-password-salt-change-this-too

# Email Configuration (SendGrid)
EMAIL_USER=your-verified-sender@yourdomain.com
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
```

#### Frontend Configuration
The frontend automatically detects the backend URL. For production, update the `API_BASE` constants in:
- `frontend/src/AuthContext.jsx`
- `frontend/src/Context.jsx`
- `frontend/src/Components/RegisterForm.jsx`
- `frontend/src/Components/EventForm.jsx`

## 📊 Database Models

### User Model
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(20), nullable=False)
    user_surname = db.Column(db.String(40), nullable=False)
    user_email = db.Column(db.String(345), unique=True, nullable=False)
    user_password = db.Column(db.String(72), nullable=False)
    is_confirmed = db.Column(db.Boolean, nullable=False)
    events = db.relationship('Event', secondary='event_participants')
```

### Event Model
```python
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_title = db.Column(db.String(50), unique=True, nullable=False)
    event_description = db.Column(db.String(400), nullable=False)
    event_date = db.Column(db.DateTime(timezone=True), nullable=False)
    event_location = db.Column(db.String(150), nullable=False)
    event_category = db.Column(db.String(50), nullable=False)
    event_image_path = db.Column(db.String(150), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    participants = db.relationship('User', secondary='event_participants')
```

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /register         # User registration
POST /login            # User login
POST /logout           # User logout
GET  /auth/check       # Check authentication status
GET  /@me              # Get current user info
GET  /confirm/<token>  # Email confirmation
```

### Event Endpoints
```
GET    /events                   # Get all events
GET    /event/<id>               # Get specific event
POST   /create_event             # Create new event
PATCH  /update_event/<id>        # Update event
DELETE /delete_event/<id>        # Delete event
PATCH  /update_participants/<id> # Join/leave event
GET    /images/<filename>        # Serve event images
```

### Request/Response Examples

#### Create Event
```javascript
POST /create_event
Content-Type: multipart/form-data

{
  "eventTitle": "Tech Meetup 2024",
  "eventDescription": "A gathering of tech enthusiasts",
  "eventDate": "2024-12-25T18:00:00Z",
  "eventLocation": "San Francisco, CA",
  "eventCategory": "technology",
  "createdBy": 1,
  "image": <file>
}
```

#### Join Event
```javascript
PATCH /update_participants/1
Content-Type: application/json

{
  "operation": "add",
  "participant_ids": [2, 3, 4]
}
```

## 🎨 UI Components

### Key Components

#### NavBar Component
- Responsive navigation with mobile menu
- Authentication-based menu items
- Backdrop blur effects
- User profile display when logged in

#### Background Component
- Animated gradient blob effect
- CSS animations with spin and scale
- Responsive design considerations

#### EventCard Component
- 3D tilt effects using Vanilla Tilt
- Hover animations and transitions
- Truncated text with responsive design
- Click-to-view-details functionality

#### EventForm Component
- Flatpickr date/time picker integration
- Image upload with preview
- Form validation and error handling
- Category selection dropdown with predefined categories

#### LoginForm Component
- Secure user authentication with email/password
- Form validation with error handling
- Integration with AuthContext for session management
- Responsive design with loading states

#### RegisterForm Component
- Multi-step user registration process
- Email verification integration
- Real-time form validation feedback
- Duplicate email detection


### Styling Approach

The project uses Tailwind CSS with custom CSS variables for theming (**themes implemented but not used in the end**):

```css
:root {
  --background: 222 47% 4%;
  --foreground: 213 31% 91%;
  --primary: 250 65% 65%;
  --primary-foreground: 213 31% 91%;
  --blob-opacity: 0.5;
  --card-bg: rgba(255, 255, 255, 0.5);
  --noise-opacity: 0.2;
}
```

## 🔐 Security Features

### Authentication & Authorization
- **Password Hashing**: Bcrypt for secure password storage
- **Email Verification**: Token-based email confirmation
- **Session Management**: Server-side session storage
- **Input Validation**: Client and server-side validation (without password strength checking yet)

### Data Protection
- **SQL Injection Prevention**: SQLAlchemy ORM
- **XSS Protection**: Input sanitization
- **File Upload Security**: File type validation
- **Environment Variables**: Sensitive data protection


## 📝 License

This project is licensed under the MIT License


## 📋 TODO:

- 🔐 Password strength checking with visual indicators
- 📧 Implementing better email sending mechanism with SPF, DKIM and DMARC for emails not ending up in spam
- 🗑️ Deleting events functionality (with associated image deletion) - there is only backend endpoint now
- 📅 Checking event's date and not displaying outdated events
- ⚡ Lazy loading of images and other performance enhancements
- 👥 User profiles with event history and preferences
- 🔍 Advanced event search with filters (title, date range, location)
- ⭐ Event rating and review system
- 📊 Event analytics dashboard for event creators
- 💬 Event comments and discussion threads
- 📱 Progressive Web App (PWA) functionality
- 🌙 Dark/Light theme toggle (*implemented but not used yet*)
- 🔧 Admin panel for platform management
- 🚀 Performance monitoring and error tracking
- 🧪 Comprehensive test coverage (unit, integration, e2e)



---

**You can visit the website by following this link:** [https://venuo.mk0x.com](https://venuo.mk0x.com)

***Built with ❤️ by Marcin Konarski***

*Feel free to explore the webpage and create your own events!*
