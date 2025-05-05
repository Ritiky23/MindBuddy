import React from 'react';
import '../component/homeScreen.css';
import { useNavigate } from 'react-router-dom';
import image1 from '../assets/q1.jpg';
import image2 from '../assets/q2.jpg';
import image3 from '../assets/q3.jpg';
import image4 from '../assets/q4.jpg';
import image5 from '../assets/q5.jpg';
import image6 from '../assets/q6.jpg';

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleTalkAI = () => {
    navigate('/chatwhisper');
  };

  const handleAssessments = () => {
    navigate('/questionnaire');
  };
  const handleCommunity = () => {
    navigate('/community');  // Redirects to the community screen (update the route as needed)
  };
  const handlegames = () => {
    navigate('/gamesfun');  // Redirects to the community screen (update the route as needed)
  };

  return (
    <div>
    {/* Hero Section */}
{/* Hero Section */}
<section className="hero1">
  <h1>Welcome to Mind Buddy</h1>
  <p>Your companion for mental well-being</p>
  <a href="#features" className="hero-button1">Explore Features</a>
</section>


      {/* Features Section */}
      <section id="features" className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-item" onClick={handleTalkAI}>
            <img src={image6} alt="Talk to AI" />
            <h3>Talk to AI</h3>
            <p>If you want to share something with AI.</p>
          </div>
          <div className="feature-item" onClick={handleAssessments}>
            <img src={image2} alt="Assessments" />
            <h3>Assessments</h3>
            <p>Access a range of therapy sessions tailored to your needs.</p>
          </div>
          <div className="feature-item" onClick={handlegames}>
            <img src={image3} alt="Games" />
            <h3>Games & Fun</h3>
            <p>Enjoy games that help you unwind and relax.</p>
          </div>
          <div className="feature-item" onClick={handleCommunity}>
            <img src={image1} alt="Blogs" />
            <h3>Community</h3>
            <p>Read expert advice and stories on mental health.</p>
          </div>
          <div className="feature-item">
            <img src={image4} alt="Track Medication" />
            <h3>Track Your Medication</h3>
            <p>Stay on top of your medication with our tracking tool.</p>
          </div>
          <div className="feature-item">
            <img src={image5} alt="Expert Doctors" />
            <h3>Expert Doctors</h3>
            <p>Connect with licensed professionals for personalized support.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-item">
          <p>"Mind Buddy has helped me manage my mental health. I feel supported and heard."</p>
          <h4>- Sarah P.</h4>
        </div>
        <div className="testimonial-item">
          <p>"The daily check-ins and personalized advice make a big difference in my overall well-being."</p>
          <h4>- John M.</h4>
        </div>
        <div className="testimonial-item">
          <p>"I've been able to connect with amazing professionals who have helped me through tough times."</p>
          <h4>- Emily W.</h4>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2024 Mind Buddy. All rights reserved. | <a href="#">Privacy Policy</a></p>
      </footer>
    </div>
  );
};

export default HomeScreen;
