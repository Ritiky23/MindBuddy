// src/pages/ExpertDoctorsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For back button or other navigation

// --- Global Styles & Variables (Assume these are available globally or imported) ---
// Re-using the GlobalStyles component from MedicationTrackerPage if it's in a shared location
// For this standalone example, I'll define a simplified version of necessary styles.
// In a real app, you'd import GlobalStyles from a shared file.

const GlobalStylesDoctors = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');

        :root {
          --primary-color: #5C6BC0; /* Calming Indigo */
          --primary-darker: #3F51B5;
          --primary-lighter: #7986CB;
          --secondary-color: #81C784; /* Soft Green */
          --accent-color: #FFCA28; /* Warm Amber */
          --text-color: #263238;
          --text-light: #546E7A;
          --bg-color: #F4F6F8;
          --bg-light: #FFFFFF;
          --border-color: #DDE2E7;
          --shadow-color: rgba(40, 50, 90, 0.1);
          --shadow-color-light: rgba(40, 50, 90, 0.05);
          --danger-color: #EF4444;

          --font-primary: 'Poppins', sans-serif;
          --font-secondary: 'Merriweather', serif;

          --border-radius: 12px;
          --border-radius-small: 8px;
          --transition-speed: 0.3s;
          --transition-speed-fast: 0.2s;
        }

        body {
          margin: 0;
          font-family: var(--font-primary);
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.7;
          font-size: 16px;
        }

        .themed-button-doctors {
            transition: all var(--transition-speed) ease;
        }
        .themed-button-doctors:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px var(--shadow-color) !important;
            opacity: 0.9;
        }
        .doctor-card-hover {
            transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease, border-color var(--transition-speed) ease;
        }
        .doctor-card-hover:hover {
            transform: translateY(-8px) scale(1.02); /* More lift & scale */
            box-shadow: 0 15px 35px var(--shadow-color) !important;
            border-color: var(--primary-lighter) !important;
        }
    `}</style>
);

const styles = {
    pageWrapper: {
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
        paddingTop: '1px', // For margin collapse
    },
    container: {
        fontFamily: 'var(--font-primary)',
        maxWidth: '1100px', // A bit wider for doctor listings
        margin: '40px auto',
        padding: '30px',
        // No background/shadow here, as pageWrapper has bg-color. Content is on cards.
    },
    headerContainer: { // For Back Button and Header
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px', // Reduced margin before intro text
        position: 'relative',
    },
    pageTitle: { // Like .section-title
        fontFamily: 'var(--font-secondary)',
        fontSize: '2.5rem',
        color: 'var(--primary-darker)',
        textAlign: 'center',
        fontWeight: '700',
        flexGrow: 1, // To center it when back button is present
        marginBottom: 0, // Margin handled by headerContainer
    },
    introText: { // Like .section-subtitle
        fontSize: '1.1rem',
        color: 'var(--text-light)',
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.8',
    },
    backButton: { // Re-using styles from MedicationTracker
        fontFamily: 'var(--font-primary)',
        backgroundColor: 'transparent',
        color: 'var(--primary-color)',
        padding: '8px 12px',
        position: 'absolute',
        left: '0px', // Aligned with container edge
        top: '50%',
        transform: 'translateY(-50%)',
        border: 'none',
        borderRadius: 'var(--border-radius-small)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        // Add class for hover effect if needed or define inline
    },
    doctorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', // Responsive grid
        gap: '30px',
    },
    doctorCard: {
        backgroundColor: 'var(--bg-light)',
        borderRadius: 'var(--border-radius)',
        padding: '25px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 25px var(--shadow-color-light)',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center', // Center content within the card initially
    },
    doctorPhotoContainer: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        margin: '0 auto 20px auto', // Center the photo
        border: '3px solid var(--primary-lighter)',
        boxShadow: '0 4px 10px var(--shadow-color-light)',
    },
    doctorPhoto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    doctorName: {
        fontFamily: 'var(--font-primary)',
        fontSize: '1.4rem', // Like .feature-title
        fontWeight: '600',
        color: 'var(--primary-darker)',
        marginBottom: '5px',
    },
    doctorCredentials: {
        fontSize: '0.9rem',
        color: 'var(--text-light)',
        marginBottom: '10px',
        fontStyle: 'italic',
    },
    doctorSpecialty: {
        fontSize: '1rem',
        fontWeight: '500',
        color: 'var(--primary-color)',
        marginBottom: '15px',
        display: 'inline-block', // To allow background
        padding: '5px 10px',
        backgroundColor: '#E8EAF6', // Light Indigo background
        borderRadius: 'var(--border-radius-small)',
    },
    doctorBio: {
        fontSize: '0.9rem',
        color: 'var(--text-light)',
        lineHeight: '1.6',
        marginBottom: '20px',
        minHeight: '50px', // Ensure some consistent height for bio section
        textAlign: 'left', // Bio text left-aligned for readability
    },
    contactInfoSection: {
        marginTop: 'auto', // Pushes contact info to the bottom if card height varies
        borderTop: '1px solid var(--border-color)',
        paddingTop: '15px',
        textAlign: 'left', // Contact details left-aligned
    },
    contactDetail: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: 'var(--text-color)',
        marginBottom: '8px',
        textDecoration: 'none', // For links
    },
    contactIcon: {
        marginRight: '10px',
        color: 'var(--primary-color)',
        width: '18px', // Fixed width for alignment
        textAlign: 'center',
    },
    viewProfileButton: { // Main action button for the card
        fontFamily: 'var(--font-primary)',
        padding: '10px 20px',
        backgroundColor: 'var(--primary-color)',
        color: 'var(--bg-light)',
        border: 'none',
        borderRadius: '50px', // Pill shape
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        marginTop: '20px',
        width: '100%', // Full width button
        boxShadow: '0 4px 15px var(--shadow-color-light)',
    },
    noDoctors: {
        textAlign: 'center',
        color: 'var(--text-light)',
        marginTop: '50px',
        fontSize: '1.1rem',
        padding: '30px',
    },
    // Simplified button style for this page, assuming GlobalStylesDoctors handles .themed-button-doctors
    buttonDoctors: (variant = 'primary') => ({
        padding: '12px 25px',
        backgroundColor: variant === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)',
        color: 'var(--bg-light)',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        margin: '5px',
        boxShadow: '0 4px 15px var(--shadow-color-light)',
        letterSpacing: '0.5px',
    }),
};

// Dummy doctor data (replace with actual data source/API call)
const dummyDoctors = [
    {
        id: 'doc1',
        name: 'Dr. Eleanor Vance',
        credentials: 'MD, Psychiatrist',
        specialty: 'Adult Psychiatry, Mood Disorders',
        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZG9jdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60', // Replace with actual photo
        bio: 'Dr. Vance is dedicated to providing compassionate and comprehensive mental health care. She specializes in treating depression, anxiety, and bipolar disorder.',
        phone: '555-0101',
        email: 'eleanor.vance@mindbuddy.expert',
        experience: '12 years',
    },
    {
        id: 'doc2',
        name: 'Dr. Samuel Green',
        credentials: 'PsyD, Clinical Psychologist',
        specialty: 'Cognitive Behavioral Therapy (CBT)',
        photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9jdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60',
        bio: 'Dr. Green focuses on evidence-based therapies to help individuals overcome challenges and improve their well-being, with expertise in CBT for anxiety and trauma.',
        phone: '555-0102',
        email: 'samuel.green@mindbuddy.expert',
        experience: '8 years',
    },
    {
        id: 'doc3',
        name: 'Dr. Aisha Khan',
        credentials: 'LCSW, Therapist',
        specialty: 'Family Therapy, Child Psychology',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da60310?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvY3RvcnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=100&q=60',
        bio: 'Aisha Khan works with families and children to navigate complex emotional landscapes, fostering communication and resilience within family units.',
        phone: '555-0103',
        email: 'aisha.khan@mindbuddy.expert',
        experience: '10 years',
    },
    // Add more doctors
];


const ExpertDoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setDoctors(dummyDoctors);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleGoHome = () => {
        navigate('/'); // Or your MindBuddy home route
    };

    // --- Contact Icons (Simple SVGs or Font Icons) ---
    // For simplicity, using text icons. In a real app, use SVG icons.
    const PhoneIcon = () => <span style={styles.contactIcon}>📞</span>;
    const EmailIcon = () => <span style={styles.contactIcon}>✉️</span>;
    const LocationIcon = () => <span style={styles.contactIcon}>📍</span>;


    if (isLoading) {
        return (
            <div style={styles.pageWrapper}>
                <GlobalStylesDoctors />
                <div style={{...styles.container, textAlign: 'center', paddingTop: '100px' }}>
                    <div style={styles.spinnerContainer}> {/* Using same spinner as MedicationTracker */}
                         <div style={{...styles.spinner, borderTopColor: 'var(--primary-color)'}}></div>
                    </div>
                    <p style={{color: 'var(--text-light)', fontSize: '1.2rem', marginTop: '20px'}}>Loading Expert Doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            <GlobalStylesDoctors />
            <div style={styles.container}>
                <div style={styles.headerContainer}>
                    <button
                        onClick={handleGoHome}
                        className="themed-button-doctors" // Apply base class for hover
                        style={{ ...styles.backButton, '&:hover': { backgroundColor: 'var(--border-color)' } }} // Basic hover
                        title="Back to Home"
                    >
                        ← Home
                    </button>
                    <h1 style={styles.pageTitle}>Meet Our Expert Doctors</h1>
                </div>

                <p style={styles.introText}>
                    Connect with experienced mental health professionals dedicated to supporting your journey.
                    Below you can find their contact details to reach out directly.
                </p>

                {doctors.length > 0 ? (
                    <div style={styles.doctorGrid}>
                        {doctors.map(doctor => (
                            <div key={doctor.id} style={styles.doctorCard} className="doctor-card-hover">
                                <div style={styles.doctorPhotoContainer}>
                                    <img src={doctor.photoUrl || 'https://via.placeholder.com/120?text=No+Photo'} alt={`Dr. ${doctor.name}`} style={styles.doctorPhoto} />
                                </div>
                                <h2 style={styles.doctorName}>{doctor.name}</h2>
                                <p style={styles.doctorCredentials}>{doctor.credentials}</p>
                                <p style={styles.doctorSpecialty}>{doctor.specialty}</p>
                                {doctor.experience && <p style={{...styles.doctorCredentials, fontStyle: 'normal', marginBottom: '15px', color: 'var(--text-color)'}}>{doctor.experience} of experience</p>}
                                <p style={styles.doctorBio}>{doctor.bio}</p>

                                <div style={styles.contactInfoSection}>
                                    {doctor.phone && (
                                        <a href={`tel:${doctor.phone}`} style={styles.contactDetail}>
                                            <PhoneIcon /> {doctor.phone}
                                        </a>
                                    )}
                                    {doctor.email && (
                                        <a href={`mailto:${doctor.email}`} style={styles.contactDetail}>
                                            <EmailIcon /> {doctor.email}
                                        </a>
                                    )}
                                    {/* Optional: Address
                                    {doctor.address && (
                                        <div style={styles.contactDetail}>
                                            <LocationIcon /> {doctor.address}
                                        </div>
                                    )}
                                    */}
                                </div>
                                <button
                                    className="themed-button-doctors"
                                    style={{...styles.viewProfileButton}}
                                    onClick={() => alert(`Viewing profile for ${doctor.name} (feature coming soon!)`)}
                                >
                                    View Profile (Soon)
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={styles.noDoctors}>No doctors are currently listed. Please check back later.</p>
                )}
            </div>
        </div>
    );
};

export default ExpertDoctorsPage;