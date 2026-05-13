# GharDoctor - Home Maintenance Service System

A modern, responsive web application for connecting homeowners with reliable home maintenance service providers. GharDoctor makes it easy to find, book, and manage home repair and maintenance services all in one place.

## 🏠 About GharDoctor

GharDoctor is a comprehensive home maintenance service platform that bridges the gap between homeowners and professional service providers. Whether you need plumbing, electrical work, carpentry, or general home repairs, GharDoctor helps you find trusted professionals quickly and efficiently.

## ✨ Features

- **Service Discovery**: Browse and search various home maintenance services
- **Service Provider Listings**: View detailed profiles of service providers with ratings and reviews
- **Easy Booking**: Simple and intuitive booking system for scheduling services
- **User Profiles**: Manage your personal profile and service history
- **Reviews & Ratings**: Rate and review service providers
- **Real-time Updates**: Get notifications and updates on your service requests
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Styling**: CSS3
- **Package Manager**: npm
- **Code Quality**: ESLint with React hooks and refresh plugins

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

## 🚀 Getting Started

### Installation

1. **Navigate to the frontend directory** (if not already there):
```bash
cd GharDoctor/frontend
```

2. **Install dependencies**:
```bash
npm install
```

### Running the Application

**Development Mode** - Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173`

**Build for Production**:
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

**Preview Production Build**:
```bash
npm run preview
```
This serves the production build locally for testing before deployment.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── assets/              # Static assets (images, logos, etc.)
├── public/                  # Public static files
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── package.json             # Project metadata and dependencies
└── README.md                # This file
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build the project for production |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview the production build locally |

## 📝 Code Quality

This project uses ESLint to maintain code quality and consistency. Run linting with:
```bash
npm run lint
```

To automatically fix linting issues where possible:
```bash
npm run lint -- --fix
```

## 🎨 Styling

The project uses CSS3 for styling with a modular approach:
- `index.css` - Global styles and reset
- `App.css` - Application-specific styles

## 🤝 Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "Add your commit message"
```

3. Push to your branch and create a pull request

## 🚢 Deployment

### Building for Production
```bash
npm run build
```

The optimized build files will be in the `dist` directory, ready to be deployed to any static hosting service such as:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [ESLint Documentation](https://eslint.org)

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Module Not Found Errors
If you encounter module errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

### HMR Not Working
Make sure your development server is running with `npm run dev` and your browser hasn't cached the page. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

## 📄 License

This project is part of an academic semester project.

## 👥 Team

Developed as an 8th Semester Project

## 📧 Contact & Support

For questions or support regarding this project, please reach out to the development team.

---

**Happy Coding! 🚀**
