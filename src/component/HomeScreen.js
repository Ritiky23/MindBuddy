import React, { useEffect } from 'react';
import '../component/homeScreen.css'; // Styles will be updated
import { useNavigate } from 'react-router-dom';

// Keep these for feature cards if you still want to show small images WITHIN cards
// If not, you can remove them and the 'image' prop from featuresData
// For this "no background image" exercise, I'll assume these are for small inline visuals, not backgrounds.
// import image1Community from '../assets/q1.jpg';
// import image2Assessments from '../assets/q2.jpg';
// import image3Games from '../assets/q3.jpg';
// import image4MedTrack from '../assets/q4.jpg';
// import image5Experts from '../assets/q5.jpg';
// import image6TalkAI from '../assets/q6.jpg';

// NO heroBgImage import needed
// import heroBgImage from '../assets/bg.jpg';

import { FaBrain, FaComments, FaGamepad, FaUsers, FaTablets, FaUserMd, FaChevronDown } from 'react-icons/fa';

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const heroButton = document.querySelector('.hero-cta-button');
    if (heroButton) {
      heroButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetElement = document.querySelector(heroButton.getAttribute('href'));
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    }
    // AOS initialization if not done globally
    // AOS.init({ duration: 800, once: true });
  }, []);


  const featuresData = [
    {
      title: 'Talk to WhisperAI',
      description: 'Share your thoughts and feelings in a safe, judgment-free space with our AI companion.',
      // image: image6TalkAI, // Keep or remove based on if you show small images inside cards
      icon: <FaComments />,
      path: '/chatwhisper',
      aosDelay: "100",
    },
    {
      title: 'Self-Assessments',
      description: 'Understand your emotional state better with guided questionnaires and insights.',
      // image: image2Assessments,
      icon: <FaBrain />,
      path: '/questionnaire',
      aosDelay: "200",
    },
    {
      title: 'Mindful Games',
      description: 'Engage in fun, relaxing games designed to reduce stress and improve focus.',
      // image: image3Games,
      icon: <FaGamepad />,
      path: '/gamesfun',
      aosDelay: "300",
    },
    {
      title: 'Community Support',
      description: 'Connect with others, share experiences, and find support in our community forums.',
      // image: image1Community,
      icon: <FaUsers />,
      path: '/community',
      aosDelay: "400",
    },
    {
      title: 'Medication Tracker',
      description: 'Stay on top of your medication schedule with our easy-to-use tracking tool.',
      // image: image4MedTrack,
      icon: <FaTablets />,
      aosDelay: "500",
      path: '/medicationtracker',
 
    },
    {
      title: 'Expert Connect',
      description: 'Find and connect with licensed mental health professionals for personalized support.',
      // image: image5Experts,
      icon: <FaUserMd />,
      aosDelay: "600",
      path: '/expertdoctor',
    },
  ];

  const testimonialsData = [
    {
      quote: "Mind Buddy has been a game-changer for managing my anxiety. The AI chat is surprisingly comforting.",
      author: "Alex R.",
      aosDelay: "100",
    },
    {
      quote: "The assessments helped me understand patterns I wasn't aware of. Highly recommend!",
      author: "Jamie L.",
      aosDelay: "200",
    },
    {
      quote: "I love the mindful games! They're a perfect way to unwind after a stressful day.",
      author: "Priya K.",
      aosDelay: "300",
    }
  ];


  return (
    <div className="home-page-wrapper">
      <header className="app-header">
        <div className="container header-container">
          <div className="logo">
            Mind Buddy
          </div>
          <nav className="main-nav">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section - style prop removed */}
        <section className="hero-section">
          {/* <div className="hero-overlay"></div> No longer needed with new gradient approach */}
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="container hero-content">
            <h1 className="hero-title" data-aos="fade-up">
              Your Journey to <span className="highlight">Mental Wellness</span> Starts Here.
            </h1>
            <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
              Mind Buddy is your compassionate companion, offering tools and support for a healthier, happier you.
            </p>
            <a href="#features" className="hero-cta-button" data-aos="fade-up" data-aos-delay="400">
              Explore Our Features <FaChevronDown className="arrow-down-icon" />
            </a>
          </div>
        </section>

        <section id="features" className="features-section section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">Discover Your Path to Well-being</h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
              Tools and resources designed to support your mental health journey.
            </p>
            <div className="feature-grid">
              {featuresData.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-item ${feature.disabled ? 'disabled' : ''}`}
                  onClick={() => !feature.disabled && feature.path && handleNavigation(feature.path)}
                  data-aos="fade-up"
                  data-aos-delay={feature.aosDelay || (index * 100).toString()}
                >
                  <div className="feature-icon-container">
                    {feature.icon}
                  </div>
                  {/* If you had <img src={feature.image} .../> here, remove it if you don't want any images */}
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  {!feature.disabled && feature.path && (
                    <span className="feature-cta">Learn More →</span>
                  )}
                  {feature.disabled && (
                    <span className="feature-disabled-tag">Coming Soon</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">Trusted by People Like You</h2>
            <div className="testimonial-grid">
              {testimonialsData.map((testimonial, index) => (
                <div key={index} className="testimonial-item" data-aos="fade-up" data-aos-delay={testimonial.aosDelay}>
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <h4 className="testimonial-author">- {testimonial.author}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer section-padding">
        <div className="container footer-content">
          <div className="footer-logo">Mind Buddy</div>
          <p>© {new Date().getFullYear()} Mind Buddy. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <span>|</span>
            <a href="/terms-of-service">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;